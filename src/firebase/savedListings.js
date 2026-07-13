import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

import { auth, db } from "./config";
import {
  decrementListingAnalytics,
  trackListingInteraction,
} from "./analytics";

function createSaveId(studentId, listingId) {
  return `${studentId}_${listingId}`;
}

function getListingImage(listing) {
  if (Array.isArray(listing.images) && listing.images.length > 0) {
    return listing.images[0] || "";
  }

  return listing.image || "";
}

function getTimestampSeconds(value) {
  return value?.seconds || 0;
}

export async function checkSavedListing(studentId, listingId) {
  if (!studentId || !listingId) return false;

  const saveId = createSaveId(studentId, listingId);
  const saveRef = doc(db, "savedListings", saveId);

  try {
    const saveSnap = await getDoc(saveRef);
    return saveSnap.exists();
  } catch (error) {
    if (error?.code !== "permission-denied") throw error;
  }

  const savedQuery = query(
    collection(db, "savedListings"),
    where("studentId", "==", studentId)
  );
  const snapshot = await getDocs(savedQuery);

  return snapshot.docs.some((docItem) => {
    const data = docItem.data();
    return docItem.id === saveId || data.listingId === listingId;
  });
}

export const checkListingSaved = checkSavedListing;

export async function saveListing(studentId, listing) {
  const currentUserId = auth.currentUser?.uid;

  if (!studentId) throw new Error("Student login required.");
  if (!listing?.id) throw new Error("Listing ID missing.");
  if (!currentUserId || currentUserId !== studentId) {
    throw new Error("Student account mismatch. Please sign in again.");
  }

  const saveRef = doc(db, "savedListings", createSaveId(studentId, listing.id));
  const timestamp = serverTimestamp();

  await setDoc(
    saveRef,
    {
      studentId,
      listingId: listing.id,
      listingName: listing.name || "",
      area: listing.area || "",
      rent: Number(listing.startingRent || listing.rent || 0),
      image: getListingImage(listing),
      ownerPhone: listing.phone || "",
      type: listing.type || "",
      gender: listing.gender || "",
      foodIncluded: listing.foodIncluded || false,
      verified: listing.verified || false,
      available: listing.available || false,
      createdAt: timestamp,
      updatedAt: timestamp,
      savedAt: timestamp,
    },
    { merge: true }
  );

  try {
    await trackListingInteraction("save", listing, "saves");
  } catch (error) {
    console.warn("Saved listing, but analytics failed:", error);
  }
}

export async function unsaveListing(studentId, listingId) {
  if (!studentId || !listingId) return;

  const saveRef = doc(db, "savedListings", createSaveId(studentId, listingId));

  await deleteDoc(saveRef);

  try {
    await decrementListingAnalytics(listingId, "saves");
  } catch (error) {
    console.warn("Removed saved listing, but analytics failed:", error);
  }
}

export async function toggleSaveListing(
  studentId,
  listing,
  isCurrentlySaved = false
) {
  if (isCurrentlySaved) {
    await unsaveListing(studentId, listing.id);
    return false;
  }

  await saveListing(studentId, listing);
  return true;
}

export async function getSavedListingsForStudent(studentId) {
  if (!studentId) return [];

  const savedQuery = query(
    collection(db, "savedListings"),
    where("studentId", "==", studentId)
  );

  const snapshot = await getDocs(savedQuery);

  const savedData = snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));

  return savedData.sort((a, b) => {
    const aTime = getTimestampSeconds(a.updatedAt || a.savedAt || a.createdAt);
    const bTime = getTimestampSeconds(b.updatedAt || b.savedAt || b.createdAt);
    return bTime - aTime;
  });
}

export const getSavedListings = getSavedListingsForStudent;