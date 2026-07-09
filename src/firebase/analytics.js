import {
  addDoc,
  collection,
  doc,
  increment,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { auth, db } from "./config";

function getUserRole() {
  if (!auth.currentUser) return "guest";

  // Keep it simple for analytics.
  // Exact role can be handled elsewhere if needed.
  return "student";
}

export async function logAnalyticsEvent(
  eventType,
  listing,
  metricKey,
  extraData = {}
) {
  if (!listing?.id || !eventType) return;

  await addDoc(collection(db, "analyticsEvents"), {
    eventType,
    metricKey: metricKey || eventType,

    listingId: listing.id,
    listingName: listing.name || "",
    area: listing.area || "",
    rent: Number(listing.startingRent || listing.rent || 0),
    ownerId: listing.ownerId || "",

    userId: auth.currentUser?.uid || null,
    userRole: getUserRole(),

    metadata: extraData || {},
    createdAt: serverTimestamp(),
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
    await logAnalyticsEvent(eventType, listing, metricKey, extraData);
  } catch (error) {
    console.warn("Analytics event log failed:", error);
  }

  try {
    await incrementListingAnalytics(listing.id, metricKey);
  } catch (error) {
    console.warn("Listing analytics counter failed:", error);
  }
}