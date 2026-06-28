import { addDoc, collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./config";

const areas = [
  "JIST Gate",
  "Sotai",
  "Dhekiajuli Path",
  "Kenduguri",
  "Jorhat Town",
  "Tarajan",
  "Cinnamara",
  "Rajabari",
];

const names = [
  "Green Nest PG",
  "Campus Corner Stay",
  "Student Comfort Home",
  "Sunrise Girls PG",
  "Brahmaputra Boys PG",
  "JIST View Rooms",
  "Study Point PG",
  "SafeStay Hostel",
  "Homely Nest PG",
  "Prime Student Rooms",
];

const facilitiesList = [
  ["WiFi", "Drinking Water", "Parking", "Study Table"],
  ["WiFi", "Food", "Laundry", "Power Backup"],
  ["Attached Bathroom", "Drinking Water", "CCTV", "Parking"],
  ["Food", "WiFi", "Common Area", "Study Table"],
  ["Power Backup", "CCTV", "Drinking Water", "Laundry"],
];

const rulesList = [
  ["No smoking", "Entry before 9 PM", "Visitors not allowed"],
  ["Maintain cleanliness", "No loud music", "Monthly rent on time"],
  ["ID proof required", "No outside guests at night"],
  ["Keep room clean", "Inform owner before leaving"],
];

function createTrackingId(index) {
  return `CS-DEMO-${String(index + 1).padStart(3, "0")}`;
}

function createStatusKey(trackingId, phone) {
  return `${trackingId}_${phone}`.replace(/\s+/g, "");
}

function getRoomOptions(index) {
  const baseRent = 2800 + (index % 8) * 400;

  return [
    {
      id: "room-1",
      title: "Single Room",
      rent: baseRent + 1500,
      deposit: 3000,
      capacity: 1,
      availableUnits: index % 3 === 0 ? 0 : 2,
      available: index % 3 !== 0,
      note: "Best for students who prefer private space.",
    },
    {
      id: "room-2",
      title: "Double Sharing",
      rent: baseRent,
      deposit: 2500,
      capacity: 2,
      availableUnits: index % 4 === 0 ? 0 : 4,
      available: index % 4 !== 0,
      note: "Affordable option for two students.",
    },
    {
      id: "room-3",
      title: "Triple Sharing",
      rent: baseRent - 500,
      deposit: 2000,
      capacity: 3,
      availableUnits: index % 5 === 0 ? 0 : 3,
      available: index % 5 !== 0,
      note: "Budget friendly shared room.",
    },
  ];
}

export async function seedDummyListings() {
  const listingsCollection = collection(db, "listings");

  for (let i = 0; i < 30; i++) {
    const roomOptions = getRoomOptions(i);
    const startingRent = Math.min(...roomOptions.map((room) => room.rent));
    const trackingId = createTrackingId(i);
    const phone = `900000${String(i + 1).padStart(4, "0")}`;

    const listingData = {
      name: `${names[i % names.length]} ${i + 1}`,
      ownerName: `Demo Owner ${i + 1}`,
      phone,
      area: areas[i % areas.length],
      nearbyCollege: "JIST",
      distance: `${(0.4 + (i % 8) * 0.3).toFixed(1)} km from JIST`,
      type: i % 3 === 0 ? "Room" : "PG",
      gender: i % 3 === 0 ? "Boys" : i % 3 === 1 ? "Girls" : "All",
      foodIncluded: i % 2 === 0,
      foodDetails: i % 2 === 0 ? "Breakfast and dinner included" : "Food not included",
      facilities: facilitiesList[i % facilitiesList.length],
      rules: rulesList[i % rulesList.length],
      mapLink: "https://maps.google.com",
      images: [
        `https://picsum.photos/seed/campusstay-${i + 1}-1/900/650`,
        `https://picsum.photos/seed/campusstay-${i + 1}-2/900/650`,
        `https://picsum.photos/seed/campusstay-${i + 1}-3/900/650`,
      ],
      roomOptions,
      startingRent,
      rent: startingRent,
      deposit: roomOptions[0].deposit,
      roomType: roomOptions.map((room) => room.title).join(" / "),
      approved: true,
      verified: i % 2 === 0,
      available: roomOptions.some((room) => room.available),
      featured: i % 7 === 0,
      reportCount: 0,
      status: "approved",
      trackingId,
      adminNote: "",
      verificationLevel: i % 2 === 0 ? "Verified" : "Basic Check",
      lastUpdated: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(listingsCollection, listingData);

    const statusKey = createStatusKey(trackingId, phone);

    await setDoc(doc(db, "listingStatus", statusKey), {
      listingId: docRef.id,
      trackingId,
      phone,
      name: listingData.name,
      area: listingData.area,
      distance: listingData.distance,
      type: listingData.type,
      gender: listingData.gender,
      startingRent,
      approved: true,
      available: listingData.available,
      status: "approved",
      adminNote: "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  return true;
}