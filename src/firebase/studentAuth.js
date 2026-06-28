import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";

import { auth } from "./config";
import { ensureStudentProfile } from "./students";

function setStudentRole() {
  localStorage.setItem("campusstay_active_role", "student");
}

export async function loginStudentWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);

  await ensureStudentProfile(result.user);
  setStudentRole();

  return result.user;
}

export async function registerStudentWithEmail(fullName, email, password) {
  const result = await createUserWithEmailAndPassword(auth, email, password);

  await updateProfile(result.user, {
    displayName: fullName,
  });

  await ensureStudentProfile(result.user, {
    fullName,
  });

  setStudentRole();

  return result.user;
}

export async function loginStudentWithEmail(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);

  await ensureStudentProfile(result.user);
  setStudentRole();

  return result.user;
}

export async function logoutStudent() {
  localStorage.removeItem("campusstay_active_role");
  return signOut(auth);
}

export function watchStudentAuth(callback) {
  return onAuthStateChanged(auth, callback);
}