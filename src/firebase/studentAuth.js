import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendPasswordResetEmail
} from "firebase/auth";

import { auth } from "./config";
import { ensureStudentProfile } from "./students";
import { clearStoredRole, setStoredRole } from "./userRoles";

function setStudentRole() {
  setStoredRole("student");
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
  clearStoredRole();
  return signOut(auth);
}

export function watchStudentAuth(callback) {
  return onAuthStateChanged(auth, callback);
}



export async function resetStudentPassword(email) {
  await sendPasswordResetEmail(auth, email);
}
