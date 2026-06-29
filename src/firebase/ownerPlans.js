import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

import { db } from "./config";

export async function getOwnerPlan(ownerId) {
  if (!ownerId) {
    return {
      ownerId: "",
      plan: "free",
      active: false,
      leadAccess: false,
    };
  }

  // Main method: document ID should be owner UID.
  const directPlanRef = doc(db, "ownerPlans", ownerId);
  const directPlanSnap = await getDoc(directPlanRef);

  if (directPlanSnap.exists()) {
    return {
      id: directPlanSnap.id,
      ...directPlanSnap.data(),
    };
  }

  // Backup method: find by ownerId field.
  const planQuery = query(
    collection(db, "ownerPlans"),
    where("ownerId", "==", ownerId)
  );

  const planSnapshot = await getDocs(planQuery);

  if (!planSnapshot.empty) {
    const planDoc = planSnapshot.docs[0];

    return {
      id: planDoc.id,
      ...planDoc.data(),
    };
  }

  return {
    ownerId,
    plan: "free",
    active: false,
    leadAccess: false,
  };
}

export async function requestLeadAccess(ownerData) {
  const ownerId = ownerData?.ownerId;

  if (!ownerId) {
    throw new Error("Owner ID missing.");
  }

  const existingQuery = query(
    collection(db, "leadAccessRequests"),
    where("ownerId", "==", ownerId),
    where("status", "==", "pending")
  );

  const existingSnapshot = await getDocs(existingQuery);

  if (!existingSnapshot.empty) {
    return {
      alreadyExists: true,
      id: existingSnapshot.docs[0].id,
    };
  }

  const docRef = await addDoc(collection(db, "leadAccessRequests"), {
    ownerId,
    ownerName: ownerData.ownerName || "",
    ownerEmail: ownerData.ownerEmail || "",
    ownerPhone: ownerData.ownerPhone || "",
    planRequested: "lead_access",
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    alreadyExists: false,
    id: docRef.id,
  };
}

export async function activateOwnerLeadAccess(ownerId) {
  if (!ownerId) {
    throw new Error("Owner ID missing.");
  }

  const planRef = doc(db, "ownerPlans", ownerId);

  await setDoc(
    planRef,
    {
      ownerId,
      plan: "lead_access",
      active: true,
      leadAccess: true,
      startsAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}