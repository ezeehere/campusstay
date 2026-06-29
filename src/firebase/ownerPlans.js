import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "./config";

function cleanId(value) {
  return String(value || "").trim();
}

function getFreePlan(ownerId) {
  return {
    ownerId,
    plan: "free",
    active: false,
    leadAccess: false,
  };
}

export async function getOwnerPlan(ownerId) {
  const cleanOwnerId = cleanId(ownerId);

  if (!cleanOwnerId) {
    return getFreePlan("");
  }

  console.log("Trying to load owner plan for:", cleanOwnerId);

  // Method 1: direct document read
  const directPlanRef = doc(db, "ownerPlans", cleanOwnerId);
  const directPlanSnap = await getDoc(directPlanRef);

  console.log("Direct owner plan exists:", directPlanSnap.exists());

  if (directPlanSnap.exists()) {
    const plan = {
      id: directPlanSnap.id,
      ...directPlanSnap.data(),
    };

    console.log("Direct owner plan data:", plan);
    return plan;
  }

  // Method 2: query by ownerId field
  const planQuery = query(
    collection(db, "ownerPlans"),
    where("ownerId", "==", cleanOwnerId)
  );

  const planSnapshot = await getDocs(planQuery);

  console.log("Owner plan query count:", planSnapshot.size);

  if (!planSnapshot.empty) {
    const planDoc = planSnapshot.docs[0];

    const plan = {
      id: planDoc.id,
      ...planDoc.data(),
    };

    console.log("Queried owner plan data:", plan);
    return plan;
  }

  // Method 3: scan all plans temporarily for debugging
  const allPlansSnapshot = await getDocs(collection(db, "ownerPlans"));

  const allPlans = allPlansSnapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));

  console.log("All ownerPlans visible to app:", allPlans);

  const matchedPlan = allPlans.find((plan) => {
    return (
      cleanId(plan.id) === cleanOwnerId ||
      cleanId(plan.ownerId) === cleanOwnerId
    );
  });

  if (matchedPlan) {
    console.log("Matched owner plan from scan:", matchedPlan);
    return matchedPlan;
  }

  console.log("No owner plan found. Returning free plan.");

  return getFreePlan(cleanOwnerId);
}

export async function requestLeadAccess(ownerData) {
  const ownerId = cleanId(ownerData?.ownerId);

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
  const cleanOwnerId = cleanId(ownerId);

  if (!cleanOwnerId) {
    throw new Error("Owner ID missing.");
  }

  const ownerRef = doc(db, "owners", cleanOwnerId);

  await updateDoc(ownerRef, {
    leadAccess: true,
    plan: "lead_access",
    active: true,
    leadAccessActivatedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const planRef = doc(db, "ownerPlans", cleanOwnerId);

  await setDoc(
    planRef,
    {
      ownerId: cleanOwnerId,
      plan: "lead_access",
      active: true,
      leadAccess: true,
      startsAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}