import { collection, getDocs } from "firebase/firestore";
import { db } from "./config";

function getTimestampSeconds(value) {
  return value?.seconds || 0;
}

function safeLower(value) {
  return String(value || "").toLowerCase();
}

export async function getAdminCustomerAnalytics() {
  const [studentsSnapshot, savedSnapshot, analyticsSnapshot, leadsSnapshot] =
    await Promise.all([
      getDocs(collection(db, "students")),
      getDocs(collection(db, "savedListings")),
      getDocs(collection(db, "analyticsEvents")),
      getDocs(collection(db, "studentLeads")),
    ]);

  const students = studentsSnapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));

  const savedListings = savedSnapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));

  const analyticsEvents = analyticsSnapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));

  const leads = leadsSnapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));

  return students.map((student) => {
    const studentId = student.uid || student.id;

    const studentSaved = savedListings.filter(
      (item) => item.studentId === studentId
    );

    const studentEvents = analyticsEvents.filter(
      (event) => event.userId === studentId || event.studentId === studentId
    );

    const studentLeads = leads.filter((lead) => lead.studentId === studentId);

    const viewEvents = studentEvents.filter(
      (event) => event.eventType === "view_details"
    );

    const saveEvents = studentEvents.filter(
      (event) => event.eventType === "save"
    );

    const callEvents = studentEvents.filter(
      (event) => event.eventType === "call_click"
    );

    const whatsappEvents = studentEvents.filter(
      (event) => event.eventType === "whatsapp_click"
    );

    const mapEvents = studentEvents.filter(
      (event) => event.eventType === "map_click"
    );

    const allActivity = [...studentEvents, ...studentSaved, ...studentLeads];

    const lastActiveSeconds = Math.max(
      0,
      ...allActivity.map((item) =>
        getTimestampSeconds(item.createdAt || item.savedAt || item.updatedAt)
      )
    );

    return {
      ...student,

      savedListings: studentSaved,

      analyticsEvents: studentEvents.sort(
        (a, b) =>
          getTimestampSeconds(b.createdAt) - getTimestampSeconds(a.createdAt)
      ),

      callbackLeads: studentLeads.sort(
        (a, b) =>
          getTimestampSeconds(b.createdAt) - getTimestampSeconds(a.createdAt)
      ),

      stats: {
        saved: studentSaved.length,
        views: viewEvents.length,
        savesLogged: saveEvents.length,
        calls: callEvents.length,
        whatsapp: whatsappEvents.length,
        maps: mapEvents.length,
        callbackRequests: studentLeads.length,
      },

      lastActiveSeconds,

      searchText: safeLower(
        `${student.fullName || ""} ${student.email || ""} ${
          student.phone || ""
        } ${student.college || ""} ${student.preferredArea || ""}`
      ),
    };
  });
}