import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "./config";

const reportsCollection = collection(db, "reports");

export async function submitListingReport(reportData) {
  const docRef = await addDoc(reportsCollection, {
    ...reportData,
    status: "open",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function getAllReports() {
  const reportsQuery = query(reportsCollection, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(reportsQuery);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
}

export async function updateReportStatus(reportId, status) {
  const reportRef = doc(db, "reports", reportId);

  await updateDoc(reportRef, {
    status,
    updatedAt: serverTimestamp(),
  });
}