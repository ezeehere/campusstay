import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  getDoc,
  setDoc,
} from "firebase/firestore";

import { db } from "./config";
import { normalizeInstitutionDistances } from "../utils/listingHelpers";

function createStatusKey(trackingId, phone) {
  return `${trackingId}_${phone}`.replace(/\s+/g, "");
}

const listingsCollection = collection(db, "listings");
function prepareInstitutionDistancesForWrite(value) {
  const distances = normalizeInstitutionDistances(value);

  return Object.fromEntries(
    Object.entries(distances).map(([institutionId, item]) => [
      institutionId,
      {
        distanceKm: Number(item.distanceKm),
        referencePoint: item.referencePoint || "",
        updatedAt: item.updatedAt || serverTimestamp(),
      },
    ])
  );
}

function prepareListingDataForCreate(listingData) {
  const { institutionDistances, ...restListingData } = listingData;
  const preparedDistances = prepareInstitutionDistancesForWrite(institutionDistances);

  if (Object.keys(preparedDistances).length === 0) {
    return restListingData;
  }

  return {
    ...restListingData,
    institutionDistances: preparedDistances,
  };
}

function prepareListingUpdatesForWrite(updates) {
  if (!Object.prototype.hasOwnProperty.call(updates, "institutionDistances")) {
    return updates;
  }

  const { institutionDistances, ...restUpdates } = updates;

  return {
    ...restUpdates,
    institutionDistances: prepareInstitutionDistancesForWrite(institutionDistances),
  };
}

export async function addPendingListing(listingData) {
  const listingWriteData = prepareListingDataForCreate(listingData);
  const roomOptions = listingData.roomOptions || [];

  const startingRent =
    roomOptions.length > 0
      ? Math.min(...roomOptions.map((room) => Number(room.rent || 0)).filter(Boolean))
      : Number(listingData.rent || 0);
  const hasAvailableRoom =
    roomOptions.length > 0
      ? roomOptions.some((room) => Number(room.availableUnits || 0) > 0)
      : listingData.available === true;
  const docRef = await addDoc(listingsCollection, {
    ...listingWriteData,
    contactPerson: listingData.contactPerson || "Owner",
    alternatePhone: listingData.alternatePhone || "",
    alternateContactPerson: listingData.alternateContactPerson || "",
    analytics: listingData.analytics || {
      views: 0,
      saves: 0,
      callClicks: 0,
      whatsappClicks: 0,
      mapClicks: 0,
      callbackRequests: 0,
      shareClicks: 0,
    },

    nearbyInstitutions: listingData.nearbyInstitutions || [],
    nearbyCollege: listingData.nearbyInstitutions?.[0] || "",
    nearbyInstitutionText: (listingData.nearbyInstitutions || []).join(", "),

    approved: false,
    verified: false,
    available: hasAvailableRoom,
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
    contactPerson: listingData.contactPerson || "Owner",
    alternatePhone: listingData.alternatePhone || "",
    alternateContactPerson: listingData.alternateContactPerson || "",
    name: listingData.name || "",
    area: listingData.area || "",
    nearbyInstitutions: listingData.nearbyInstitutions || [],
    nearbyCollege: listingData.nearbyInstitutions?.[0] || "",
    nearbyInstitutionText: (listingData.nearbyInstitutions || []).join(", "),
    distance: "",
    type: listingData.type || "",
    gender: listingData.gender || "",
    startingRent,
    approved: false,
    available: hasAvailableRoom,
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
  const statusSnapshot = await getDoc(statusRef);

  if (!statusSnapshot.exists()) {
    return null;
  }

  const statusData = statusSnapshot.data();

  let fullListingData = {};

  if (statusData.listingId) {
    const listingRef = doc(db, "listings", statusData.listingId);
    const listingSnapshot = await getDoc(listingRef);

    if (listingSnapshot.exists()) {
      fullListingData = {
        id: listingSnapshot.id,
        ...listingSnapshot.data(),
      };
    }
  }

  return {
    ...fullListingData,
    ...statusData,
    id: statusData.listingId || fullListingData.id || statusSnapshot.id,
    statusDocId: statusSnapshot.id,
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

  const preparedUpdates = prepareListingUpdatesForWrite(updates);

  await updateDoc(listingRef, {
    ...preparedUpdates,
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
      contactPerson: listingData.contactPerson || "Owner",
      alternatePhone: listingData.alternatePhone || "",
      alternateContactPerson: listingData.alternateContactPerson || "",
      name: listingData.name || "",
      area: listingData.area || "",
      nearbyInstitutions: listingData.nearbyInstitutions || [],
      nearbyCollege: listingData.nearbyInstitutions?.[0] || "",
      nearbyInstitutionText: (listingData.nearbyInstitutions || []).join(", "),
      distance: "",
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

export async function updateListingAvailability(
  listingId,
  roomOptions,
  availabilityData = {}
) {
  if (!listingId) {
    throw new Error("Listing ID is required.");
  }

  const cleanedRoomOptions = (roomOptions || []).map((room, index) => {
    const availableUnits = Math.max(Number(room.availableUnits || 0), 0);

    return {
      ...room,
      id: room.id || `room-${index + 1}`,
      availableUnits,
      available: availableUnits > 0,
    };
  });

  const hasAvailableRoom = cleanedRoomOptions.some(
    (room) => Number(room.availableUnits || 0) > 0
  );

  const moveInUpdates = {};

  if (availabilityData.availableFrom !== undefined) {
    moveInUpdates.availableFrom = availabilityData.availableFrom;
  }

  if (availabilityData.moveInNote !== undefined) {
    moveInUpdates.moveInNote = availabilityData.moveInNote;
  }

  const listingRef = doc(db, "listings", listingId);

  await updateDoc(listingRef, {
    roomOptions: cleanedRoomOptions,
    available: hasAvailableRoom,
    availabilityUpdatedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastUpdated: new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    ...moveInUpdates,
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
      available: hasAvailableRoom,
      roomOptions: cleanedRoomOptions,
      availabilityUpdatedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...moveInUpdates,
    },
    { merge: true }
  );
}
