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
  getDoc,
  setDoc,
} from "firebase/firestore";

import { db } from "./config";

function createStatusKey(trackingId, phone) {
  return `${trackingId}_${phone}`.replace(/\s+/g, "");
}

const listingsCollection = collection(db, "listings");

export async function addPendingListing(listingData) {
    const roomOptions = listingData.roomOptions || [];

const startingRent =
  roomOptions.length > 0
    ? Math.min(...roomOptions.map((room) => Number(room.rent || 0)).filter(Boolean))
    : Number(listingData.rent || 0);
  const docRef = await addDoc(listingsCollection, {
    ...listingData,
    ownerId: listingData.ownerId || "",
    ownerEmail: listingData.ownerEmail || "",
    analytics: listingData.analytics || {
      views: 0,
      saves: 0,
      callClicks: 0,
      whatsappClicks: 0,
      mapClicks: 0,
    },

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

  const statusKey = createStatusKey(listingData.trackingId, listingData.phone);

await setDoc(doc(db, "listingStatus", statusKey), {
  listingId: docRef.id,
  trackingId: listingData.trackingId,
  phone: listingData.phone,
  name: listingData.name || "",
  area: listingData.area || "",
  distance: listingData.distance || "",
  type: listingData.type || "",
  gender: listingData.gender || "",
  startingRent,
  approved: false,
  available: true,
  status: listingData.status || "pending",
  adminNote: listingData.adminNote || "",
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});

  return docRef.id;
}

export async function getListingByTrackingIdAndPhone(trackingId, phone) {
  const statusKey = createStatusKey(trackingId, phone);

  const statusRef = doc(db, "listingStatus", statusKey);
  const snapshot = await getDoc(statusRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
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

  const listingSnapshot = await getDoc(listingRef);

  if (!listingSnapshot.exists()) return;

  const listingData = listingSnapshot.data();

  if (!listingData.trackingId || !listingData.phone) return;

  const statusKey = createStatusKey(
    listingData.trackingId,
    listingData.phone
  );

  await setDoc(
    doc(db, "listingStatus", statusKey),
    {
      listingId,
      trackingId: listingData.trackingId,
      phone: listingData.phone,
      name: listingData.name || "",
      area: listingData.area || "",
      distance: listingData.distance || "",
      type: listingData.type || "",
      gender: listingData.gender || "",
      startingRent: listingData.startingRent || listingData.rent || 0,
      approved: listingData.approved || false,
      available: listingData.available || false,
      status: listingData.status || "pending",
      adminNote: listingData.adminNote || "",
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function deleteListing(listingId) {
  const listingRef = doc(db, "listings", listingId);
  await deleteDoc(listingRef);
}

export async function getOwnerListings({ ownerId, phone }) {
  const listingMap = new Map();

  if (ownerId) {
    const ownerQuery = query(
      listingsCollection,
      where("ownerId", "==", ownerId)
    );

    const ownerSnapshot = await getDocs(ownerQuery);

    ownerSnapshot.docs.forEach((docItem) => {
      listingMap.set(docItem.id, {
        id: docItem.id,
        ...docItem.data(),
      });
    });
  }

  if (phone) {
    const phoneQuery = query(
      listingsCollection,
      where("phone", "==", phone),
      where("approved", "==", true)
    );

    const phoneSnapshot = await getDocs(phoneQuery);

    phoneSnapshot.docs.forEach((docItem) => {
      listingMap.set(docItem.id, {
        id: docItem.id,
        ...docItem.data(),
      });
    });
  }

  return Array.from(listingMap.values()).sort((a, b) => {
    const aTime = a.createdAt?.seconds || 0;
    const bTime = b.createdAt?.seconds || 0;
    return bTime - aTime;
  });
}

export async function getListingById(listingId) {
  if (!listingId) return null;

  const listingRef = doc(db, "listings", listingId);
  const listingSnap = await getDoc(listingRef);

  if (!listingSnap.exists()) return null;

  return {
    id: listingSnap.id,
    ...listingSnap.data(),
  };
}