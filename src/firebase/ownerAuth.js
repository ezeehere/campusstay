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
import { ensureOwnerProfile } from "./owners";
import { clearStoredRole, setStoredRole } from "./userRoles";

function setOwnerRole() {
  setStoredRole("owner");
}

export async function loginOwnerWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);

  await ensureOwnerProfile(result.user);
  setOwnerRole();

  return result.user;
}

export async function registerOwnerWithEmail(fullName, email, password) {
  const result = await createUserWithEmailAndPassword(auth, email, password);

  await updateProfile(result.user, {
    displayName: fullName,
  });

  await ensureOwnerProfile(result.user, {
    fullName,
  });

  setOwnerRole();

  return result.user;
}

export async function loginOwnerWithEmail(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);

  await ensureOwnerProfile(result.user);
  setOwnerRole();

  return result.user;
}

export async function logoutOwner() {
  clearStoredRole();
  return signOut(auth);
}

export function watchOwnerAuth(callback) {
  return onAuthStateChanged(auth, callback);
}
