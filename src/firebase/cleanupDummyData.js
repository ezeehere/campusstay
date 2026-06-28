import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    where,
} from "firebase/firestore";

import { db } from "./config";

function isDemoTrackingId(value) {
    return String(value || "").startsWith("CS-DEMO-");
}

export async function cleanupDummyData() {
    const deletedListingIds = new Set();

    // 1. Delete dummy listings
    const listingsSnapshot = await getDocs(collection(db, "listings"));

    const listingDeletePromises = listingsSnapshot.docs
        .filter((docItem) => {
            const data = docItem.data();

            return (
                isDemoTrackingId(data.trackingId) ||
                String(data.ownerName || "").startsWith("Demo Owner") ||
                String(data.phone || "").startsWith("900000")
            );
        })
        .map(async (docItem) => {
            deletedListingIds.add(docItem.id);
            await deleteDoc(doc(db, "listings", docItem.id));
        });

    await Promise.all(listingDeletePromises);

    // 2. Delete dummy listingStatus records
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

    // 3. Delete savedListings connected to deleted demo listings
    const savedSnapshot = await getDocs(collection(db, "savedListings"));

    const savedDeletePromises = savedSnapshot.docs
        .filter((docItem) => {
            const data = docItem.data();
            return deletedListingIds.has(data.listingId);
        })
        .map((docItem) => deleteDoc(doc(db, "savedListings", docItem.id)));

    await Promise.all(savedDeletePromises);

    // 4. Delete analyticsEvents connected to deleted demo listings
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