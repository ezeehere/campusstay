import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "./config";

export async function ensureStudentProfile(user, extraData = {}) {
  if (!user) return null;

  const studentRef = doc(db, "students", user.uid);
  const studentSnap = await getDoc(studentRef);

  if (!studentSnap.exists()) {
    const newProfile = {
      uid: user.uid,
      fullName: extraData.fullName || user.displayName || "",
      email: user.email || "",
      phone: "",
      college: "JIST",
      gender: "",
      budgetMin: "",
      budgetMax: "",
      preferredArea: "",
      foodRequired: "",
      preferredStayType: "",
      preferredRoomType: "",
      moveInTime: "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    };

    await setDoc(studentRef, newProfile);
    return newProfile;
  }

  await updateDoc(studentRef, {
    email: user.email || "",
    lastLoginAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    id: studentSnap.id,
    ...studentSnap.data(),
  };
}

export async function getStudentProfile(uid) {
  if (!uid) return null;

  const studentRef = doc(db, "students", uid);
  const studentSnap = await getDoc(studentRef);

  if (!studentSnap.exists()) return null;

  return {
    id: studentSnap.id,
    ...studentSnap.data(),
  };
}

export async function updateStudentProfile(uid, profileData) {
  if (!uid) throw new Error("Student ID is required.");

  const studentRef = doc(db, "students", uid);

  await updateDoc(studentRef, {
    ...profileData,
    updatedAt: serverTimestamp(),
  });
}