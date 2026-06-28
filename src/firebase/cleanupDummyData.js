import {
    collection,
    deleteDoc,
    doc,
    getDocs,
} from "firebase/firestore";

import { db } from "./config";

function isDemoTrackingId(value) {
    return String(value || "").startsWith("CS-DEMO-");
}

function isDemoListing(data) {
    return (
        isDemoTrackingId(data.trackingId) ||
        String(data.ownerName || "").startsWith("Demo Owner") ||
        String(data.phone || "").startsWith("900000") ||
        String(data.name || "").includes("Green Nest PG") ||
        String(data.name || "").includes("Campus Corner Stay") ||
        String(data.name || "").includes("Student Comfort Home") ||
        String(data.name || "").includes("Sunrise Girls PG") ||
        String(data.name || "").includes("Brahmaputra Boys PG") ||
        String(data.name || "").includes("JIST View Rooms") ||
        String(data.name || "").includes("Study Point PG") ||
        String(data.name || "").includes("SafeStay Hostel") ||
        String(data.name || "").includes("Homely Nest PG") ||
        String(data.name || "").includes("Prime Student Rooms")
    );
}

export async function cleanupDummyData() {
    const deletedListingIds = new Set();

    const listingsSnapshot = await getDocs(collection(db, "listings"));

    const listingDeletePromises = listingsSnapshot.docs
        .filter((docItem) => isDemoListing(docItem.data()))
        .map(async (docItem) => {
            deletedListingIds.add(docItem.id);
            await deleteDoc(doc(db, "listings", docItem.id));
        });

    await Promise.all(listingDeletePromises);

    const statusSnapshot = await getDocs(collection(db, "listingStatus"));

    const statusDeletePromises = statusSnapshot.docs
        .filter((docItem) => {
            const data = docItem.data();

            return (
                isDemoTrackingId(data.trackingId) ||
                deletedListingIds.has(data.listingId)
            );
        })
        .map((docItem) => deleteDoc(doc(db, "listingStatus", docItem.id)));

    await Promise.all(statusDeletePromises);

    const savedSnapshot = await getDocs(collection(db, "savedListings"));

    const savedDeletePromises = savedSnapshot.docs
        .filter((docItem) => {
            const data = docItem.data();
            return deletedListingIds.has(data.listingId);
        })
        .map((docItem) => deleteDoc(doc(db, "savedListings", docItem.id)));

    await Promise.all(savedDeletePromises);

    const analyticsSnapshot = await getDocs(collection(db, "analyticsEvents"));

    const analyticsDeletePromises = analyticsSnapshot.docs
        .filter((docItem) => {
            const data = docItem.data();
            return deletedListingIds.has(data.listingId);
        })
        .map((docItem) => deleteDoc(doc(db, "analyticsEvents", docItem.id)));

    await Promise.all(analyticsDeletePromises);

    return {
        deletedListings: deletedListingIds.size,
        deletedStatuses: statusDeletePromises.length,
        deletedSavedItems: savedDeletePromises.length,
        deletedAnalyticsEvents: analyticsDeletePromises.length,
    };
}