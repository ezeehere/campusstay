import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "./config";

const CURRENT_TERMS_VERSION = "2026-07-13";

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
      institutionId: "",
      institutionName: "",
      college: "",
      gender: "",
      budgetMin: "",
      budgetMax: "",
      preferredArea: "",
      preferredAreas: [],
      preferredStayType: "",
      foodRequired: "",
      preferredRoomType: "",
      moveInTime: "",
      termsAccepted: false,
      termsVersion: "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    };

    await setDoc(studentRef, newProfile, { merge: true });
    return newProfile;
  }

  await setDoc(
    studentRef,
    {
      email: user.email || "",
      fullName: studentSnap.data().fullName || user.displayName || "",
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

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
  const studentSnap = await getDoc(studentRef);
  const existingProfile = studentSnap.exists() ? studentSnap.data() : {};
  const nextProfileData = { ...profileData };

  if (
    Array.isArray(nextProfileData.preferredAreas) &&
    nextProfileData.preferredArea === undefined
  ) {
    nextProfileData.preferredArea = nextProfileData.preferredAreas.join(", ");
  }

  if (
    !Array.isArray(nextProfileData.preferredAreas) &&
    typeof nextProfileData.preferredArea === "string"
  ) {
    nextProfileData.preferredAreas = nextProfileData.preferredArea
      .split(",")
      .map((area) => area.trim())
      .filter(Boolean);
  }

  if (nextProfileData.termsAccepted === true) {
    nextProfileData.termsVersion =
      nextProfileData.termsVersion || existingProfile.termsVersion || CURRENT_TERMS_VERSION;

    if (!nextProfileData.termsAcceptedAt && !existingProfile.termsAcceptedAt) {
      nextProfileData.termsAcceptedAt = serverTimestamp();
    }
  }

  const newStudentDefaults = studentSnap.exists()
    ? {}
    : {
        uid,
        fullName: "",
        email: "",
        phone: "",
        institutionId: "",
        institutionName: "",
        college: "",
        gender: "",
        budgetMin: "",
        budgetMax: "",
        preferredArea: "",
        preferredAreas: [],
        preferredStayType: "",
        foodRequired: "",
        preferredRoomType: "",
        moveInTime: "",
        termsAccepted: false,
        termsVersion: "",
        createdAt: serverTimestamp(),
      };

  await setDoc(
    studentRef,
    {
      ...newStudentDefaults,
      uid,
      ...nextProfileData,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
