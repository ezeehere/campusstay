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

export async function loginStudentWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);

  await ensureStudentProfile(result.user);

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

  return result.user;
}

export async function loginStudentWithEmail(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);

  await ensureStudentProfile(result.user);

  return result.user;
}

export async function logoutStudent() {
  return signOut(auth);
}

export function watchStudentAuth(callback) {
  return onAuthStateChanged(auth, callback);
}