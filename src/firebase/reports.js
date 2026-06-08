import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { db } from "./config";

const reportsCollection = collection(db, "reports");

export async function submitListingReport(reportData) {
  const docRef = await addDoc(reportsCollection, {
    ...reportData,
    status: "open",
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}