import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "./config";

export async function ensureOwnerProfile(user, extraData = {}) {
  if (!user) return null;

  const ownerRef = doc(db, "owners", user.uid);
  const ownerSnap = await getDoc(ownerRef);

  if (!ownerSnap.exists()) {
    const newProfile = {
      uid: user.uid,
      fullName: extraData.fullName || user.displayName || "",
      email: user.email || "",
      phone: "",
      businessName: "",
      area: "",
      role: "owner",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    };

    await setDoc(ownerRef, newProfile);
    return newProfile;
  }

  await updateDoc(ownerRef, {
    email: user.email || "",
    lastLoginAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    id: ownerSnap.id,
    ...ownerSnap.data(),
  };
}

export async function getOwnerProfile(uid) {
  if (!uid) return null;

  const ownerRef = doc(db, "owners", uid);
  const ownerSnap = await getDoc(ownerRef);

  if (!ownerSnap.exists()) return null;

  return {
    id: ownerSnap.id,
    ...ownerSnap.data(),
  };
}

export async function updateOwnerProfile(uid, profileData) {
  if (!uid) throw new Error("Owner ID is required.");

  const ownerRef = doc(db, "owners", uid);

  await updateDoc(ownerRef, {
    ...profileData,
    updatedAt: serverTimestamp(),
  });
}
