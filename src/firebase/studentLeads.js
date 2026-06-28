import {
    addDoc,
    collection,
    getDocs,
    query,
    serverTimestamp,
    where,
} from "firebase/firestore";

import { auth, db } from "./config";
import { getStudentProfile } from "./students";

export async function createStudentLead(listing) {
    const user = auth.currentUser;

    if (!user) {
        throw new Error("Student login required.");
    }

    if (!listing?.id) {
        throw new Error("Listing ID missing.");
    }

    const profile = await getStudentProfile(user.uid);

    if (!profile?.phone) {
        throw new Error("Phone number missing.");
    }

    const leadData = {
        studentId: user.uid,
        studentName: profile.fullName || user.displayName || "",
        studentEmail: user.email || "",
        studentPhone: profile.phone || "",
        studentCollege: profile.college || "",
        studentGender: profile.gender || "",
        studentBudgetMin: profile.budgetMin || "",
        studentBudgetMax: profile.budgetMax || "",
        studentPreferredArea: profile.preferredArea || "",
        studentPreferredStayType: profile.preferredStayType || "",
        studentFoodRequired: profile.foodRequired || "",

        listingId: listing.id,
        listingName: listing.name || "",
        listingArea: listing.area || "",
        listingRent: listing.startingRent || listing.rent || 0,

        ownerId: listing.ownerId || "",
        ownerPhone: listing.phone || "",
        ownerName: listing.ownerName || "",

        actionType: "callback_request",
        consentGiven: true,
        consentText:
            "I agree to share my contact details with this PG/room owner so they can contact me about this listing.",

        status: "new",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "studentLeads"), leadData);

    return docRef.id;
}

export async function getOwnerCallbackLeads(ownerId, ownerPhone) {
    const leadsMap = new Map();

    if (ownerId) {
        const ownerQuery = query(
            collection(db, "studentLeads"),
            where("ownerId", "==", ownerId)
        );

        const ownerSnapshot = await getDocs(ownerQuery);

        ownerSnapshot.docs.forEach((docItem) => {
            leadsMap.set(docItem.id, {
                id: docItem.id,
                ...docItem.data(),
            });
        });
    }

    if (ownerPhone) {
        const phoneQuery = query(
            collection(db, "studentLeads"),
            where("ownerPhone", "==", ownerPhone)
        );

        const phoneSnapshot = await getDocs(phoneQuery);

        phoneSnapshot.docs.forEach((docItem) => {
            leadsMap.set(docItem.id, {
                id: docItem.id,
                ...docItem.data(),
            });
        });
    }

    return Array.from(leadsMap.values()).sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
    });
}