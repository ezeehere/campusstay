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

import { db } from "./config";
import {
  decrementListingAnalytics,
  trackListingInteraction,
} from "./analytics";

function createSaveId(studentId, listingId) {
  return `${studentId}_${listingId}`;
}

export async function checkListingSaved(studentId, listingId) {
  if (!studentId || !listingId) return false;

  const saveRef = doc(db, "savedListings", createSaveId(studentId, listingId));
  const saveSnap = await getDoc(saveRef);

  return saveSnap.exists();
}

export async function saveListing(studentId, listing) {
  if (!studentId) throw new Error("Student login required.");
  if (!listing?.id) throw new Error("Listing ID missing.");

  const saveRef = doc(db, "savedListings", createSaveId(studentId, listing.id));

  await setDoc(
    saveRef,
    {
      studentId,
      listingId: listing.id,
      listingName: listing.name || "",
      area: listing.area || "",
      type: listing.type || "",
      gender: listing.gender || "",
      rent: listing.startingRent || listing.rent || 0,
      image: listing.images?.[0] || "",
      foodIncluded: listing.foodIncluded || false,
      verified: listing.verified || false,
      available: listing.available || false,
      savedAt: serverTimestamp(),
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

export async function toggleSaveListing(studentId, listing, isCurrentlySaved = false) {
  if (isCurrentlySaved) {
    await unsaveListing(studentId, listing.id);
    return false;
  }

  await saveListing(studentId, listing);
  return true;
}

export async function getSavedListings(studentId) {
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
    const aTime = a.savedAt?.seconds || 0;
    const bTime = b.savedAt?.seconds || 0;
    return bTime - aTime;
  });
}