import {
  addDoc,
  collection,
  doc,
  increment,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { auth, db } from "./config";

export async function logAnalyticsEvent(eventType, listing, extraData = {}) {
  if (!listing?.id) return;

  await addDoc(collection(db, "analyticsEvents"), {
    eventType,
    listingId: listing.id,
    listingName: listing.name || "",
    area: listing.area || "",
    rent: listing.startingRent || listing.rent || 0,
    ownerId: listing.ownerId || "",
    ownerPhone: listing.phone || "",
    studentId: auth.currentUser?.uid || null,
    studentEmail: auth.currentUser?.email || null,
    createdAt: serverTimestamp(),
    ...extraData,
  });
}

export async function incrementListingAnalytics(listingId, metricKey) {
  if (!listingId || !metricKey) return;

  const listingRef = doc(db, "listings", listingId);

  await updateDoc(listingRef, {
    [`analytics.${metricKey}`]: increment(1),
    updatedAt: serverTimestamp(),
  });
}

export async function decrementListingAnalytics(listingId, metricKey) {
  if (!listingId || !metricKey) return;

  const listingRef = doc(db, "listings", listingId);

  await updateDoc(listingRef, {
    [`analytics.${metricKey}`]: increment(-1),
    updatedAt: serverTimestamp(),
  });
}

export async function trackListingInteraction(
  eventType,
  listing,
  metricKey,
  extraData = {}
) {
  if (!listing?.id) return;

  try {
    await logAnalyticsEvent(eventType, listing, extraData);
  } catch (error) {
    console.warn("Analytics event log failed:", error);
  }

  try {
    await incrementListingAnalytics(listing.id, metricKey);
  } catch (error) {
    console.warn("Listing analytics counter failed:", error);
  }
}