import dotenv from "dotenv";
import fs from "fs";
import sharp from "sharp";
import { v2 as cloudinary } from "cloudinary";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

dotenv.config({ path: ".env.migration", override: true });

const serviceAccountPath = "./serviceAccountKey.json";

if (!fs.existsSync(serviceAccountPath)) {
    throw new Error("serviceAccountKey.json not found in project root.");
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

initializeApp({
    credential: cert(serviceAccount),
});

const db = getFirestore();

cloudinary.config({
    cloud_name: process.env.NEW_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEW_CLOUDINARY_API_KEY,
    api_secret: process.env.NEW_CLOUDINARY_API_SECRET,
});

const OLD_CLOUD_NAME = process.env.OLD_CLOUDINARY_CLOUD_NAME;
const NEW_CLOUD_NAME = process.env.NEW_CLOUDINARY_CLOUD_NAME;
const MIGRATION_LIMIT = Number(process.env.MIGRATION_LIMIT || 1);

if (!NEW_CLOUD_NAME || !process.env.NEW_CLOUDINARY_API_KEY || !process.env.NEW_CLOUDINARY_API_SECRET) {
    throw new Error("New Cloudinary credentials are missing in .env.migration.");
}

function isOldCloudinaryUrl(url) {
    if (!url || typeof url !== "string") return false;

    return (
        url.includes("res.cloudinary.com") &&
        OLD_CLOUD_NAME &&
        url.includes(`res.cloudinary.com/${OLD_CLOUD_NAME}`)
    );
}

function isNewCloudinaryUrl(url) {
    if (!url || typeof url !== "string") return false;

    return (
        url.includes("res.cloudinary.com") &&
        NEW_CLOUD_NAME &&
        url.includes(`res.cloudinary.com/${NEW_CLOUD_NAME}`)
    );
}

async function downloadImage(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            `Failed to download image: ${response.status} ${response.statusText}`
        );
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

async function compressImage(buffer) {
    return sharp(buffer)
        .rotate()
        .resize({
            width: 1200,
            height: 1200,
            fit: "inside",
            withoutEnlargement: true,
        })
        .jpeg({
            quality: 72,
            mozjpeg: true,
        })
        .toBuffer();
}

function uploadBufferToCloudinary(buffer, publicId) {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "campusstay/migrated",
                public_id: publicId,
                resource_type: "image",
                overwrite: false,
                tags: ["campusstay", "migrated", "pg-listing"],
            },
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(result.secure_url);
            }
        );

        uploadStream.end(buffer);
    });
}

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function migrateListingImages(listingDoc) {
    const data = listingDoc.data();

    if (!Array.isArray(data.images) || data.images.length === 0) {
        return {
            skipped: true,
            reason: "No images",
        };
    }

    const oldCloudinaryImagesBackup = [...data.images];
    const newImages = [];
    let migratedCount = 0;

    for (let i = 0; i < data.images.length; i++) {
        const imageUrl = data.images[i];

        if (!isOldCloudinaryUrl(imageUrl) || isNewCloudinaryUrl(imageUrl)) {
            newImages.push(imageUrl);
            continue;
        }

        try {
            console.log(`Downloading image ${i + 1}: ${imageUrl}`);

            const originalBuffer = await downloadImage(imageUrl);
            const compressedBuffer = await compressImage(originalBuffer);

            console.log(
                `Compressed: ${(originalBuffer.length / 1024).toFixed(1)} KB -> ${(compressedBuffer.length / 1024).toFixed(1)} KB`
            );

            const publicId = `${listingDoc.id}-${i + 1}-${Date.now()}`;
            const newUrl = await uploadBufferToCloudinary(compressedBuffer, publicId);

            console.log(`Uploaded to new Cloudinary: ${newUrl}`);

            newImages.push(newUrl);
            migratedCount++;

            await wait(800);
        } catch (error) {
            console.error(
                `Failed to migrate image for listing ${listingDoc.id}:`,
                error.message
            );

            newImages.push(imageUrl);
        }
    }

    if (migratedCount > 0) {
        await listingDoc.ref.update({
            images: newImages,
            oldCloudinaryImagesBackup,
            imageMigration: {
                migratedTo: "new-cloudinary",
                migratedCount,
                migratedAt: FieldValue.serverTimestamp(),
            },
            updatedAt: FieldValue.serverTimestamp(),
        });
    }

    return {
        skipped: false,
        migratedCount,
    };
}

async function runMigration() {
    console.log("Starting CampusStay Cloudinary image migration...");
    console.log(`Old Cloudinary: ${OLD_CLOUD_NAME}`);
    console.log(`New Cloudinary: ${NEW_CLOUD_NAME}`);
    console.log(`Migration limit: ${MIGRATION_LIMIT}`);

    const snapshot = await db.collection("listings").get();

    let processedListings = 0;
    let migratedListings = 0;

    for (const listingDoc of snapshot.docs) {
        if (processedListings >= MIGRATION_LIMIT) break;

        const data = listingDoc.data();
        const images = Array.isArray(data.images) ? data.images : [];

        const hasOldCloudinaryImages = images.some((url) =>
            isOldCloudinaryUrl(url)
        );

        if (!hasOldCloudinaryImages) {
            continue;
        }

        processedListings++;

        console.log("\n----------------------------------------");
        console.log(`Processing listing: ${data.name || listingDoc.id}`);

        const result = await migrateListingImages(listingDoc);

        if (!result.skipped && result.migratedCount > 0) {
            migratedListings++;
        }

        console.log("Result:", result);
    }

    console.log("\nMigration finished.");
    console.log(`Processed listings: ${processedListings}`);
    console.log(`Migrated listings: ${migratedListings}`);
}

runMigration().catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
});