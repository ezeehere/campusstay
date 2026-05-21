import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "./config";

const listingsCollection = collection(db, "listings");

export async function addPendingListing(listingData) {
    const roomOptions = listingData.roomOptions || [];

const startingRent =
  roomOptions.length > 0
    ? Math.min(...roomOptions.map((room) => Number(room.rent || 0)).filter(Boolean))
    : Number(listingData.rent || 0);
  const docRef = await addDoc(listingsCollection, {
    ...listingData,

    nearbyCollege: "JIST",

    approved: false,
    verified: false,
    available: true,
    featured: false,
    reportCount: 0,
    images: listingData.images || [],
    trackingId: listingData.trackingId,
    adminNote: listingData.adminNote || "",
    lastUpdated: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        }),

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    status: listingData.status || "pending",
    
  });

  return docRef.id;
}

export async function getListingByTrackingIdAndPhone(trackingId, phone) {
  const statusQuery = query(
    listingsCollection,
    where("trackingId", "==", trackingId),
    where("phone", "==", phone),
    limit(1)
  );

  const snapshot = await getDocs(statusQuery);

  if (snapshot.empty) {
    return null;
  }

  const docItem = snapshot.docs[0];

  return {
    id: docItem.id,
    ...docItem.data(),
  };
}
export async function getApprovedListings() {
  const approvedQuery = query(
    listingsCollection,
    where("approved", "==", true)
  );

  const snapshot = await getDocs(approvedQuery);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
}

export async function getAllListings() {
  const allListingsQuery = query(
    listingsCollection,
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(allListingsQuery);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
}

export async function updateListing(listingId, updates) {
  const listingRef = doc(db, "listings", listingId);

  await updateDoc(listingRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteListing(listingId) {
  const listingRef = doc(db, "listings", listingId);
  await deleteDoc(listingRef);
}