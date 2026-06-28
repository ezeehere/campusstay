    import { doc, getDoc } from "firebase/firestore";
import { db } from "./config";

export async function checkIsAdmin(uid) {
  if (!uid) return false;

  const adminRef = doc(db, "admins", uid);
  const adminSnap = await getDoc(adminRef);

  return adminSnap.exists();
}