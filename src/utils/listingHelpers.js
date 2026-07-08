export function getListingRent(listing) {
  return getStartingRent(listing);
}

export function getStartingRent(listing) {
  if (Array.isArray(listing?.roomOptions) && listing.roomOptions.length > 0) {
    const rents = listing.roomOptions
      .map((room) => Number(room.rent || 0))
      .filter((rent) => rent > 0);

    if (rents.length > 0) {
      return Math.min(...rents);
    }
  }

  return Number(listing?.startingRent || listing?.rent || 0);
}

export function getNearbyInstitutions(listing) {
  if (!listing) return [];
  if (Array.isArray(listing.nearbyInstitutions) && listing.nearbyInstitutions.length > 0) {
    return listing.nearbyInstitutions;
  }
  if (listing.nearbyCollege) return [listing.nearbyCollege];
  if (listing.nearbyInstitutionText) {
    return String(listing.nearbyInstitutionText).split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

export function getNearbyText(listing) {
  if (!listing) return "";
  const institutions = getNearbyInstitutions(listing);
  if (institutions.length > 0) {
    return institutions.join(", ");
  }
  return listing.nearbyInstitutionText || listing.nearbyCollege || "";
}

function getTimestampSeconds(value) {
  if (!value) return 0;
  if (value?.seconds) return value.seconds;
  if (typeof value?.toDate === "function") return value.toDate().getTime() / 1000;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime() / 1000;
}

export function getTotalSeatsLeft(listing) {
  if (!listing) return 0;
  if (Array.isArray(listing.roomOptions) && listing.roomOptions.length > 0) {
    return listing.roomOptions.reduce((total, room) => total + Number(room.availableUnits || 0), 0);
  }
  return listing.available ? 1 : 0;
}

export function sortListings(items, sortBy) {
  const sorted = [...items];
  if (sortBy === "price_low_high") return sorted.sort((a, b) => getListingRent(a) - getListingRent(b));
  if (sortBy === "price_high_low") return sorted.sort((a, b) => getListingRent(b) - getListingRent(a));
  if (sortBy === "recent") {
    return sorted.sort((a, b) => getTimestampSeconds(b.createdAt || b.updatedAt) - getTimestampSeconds(a.createdAt || a.updatedAt));
  }
  if (sortBy === "food_first") {
    return sorted.sort((a, b) => {
      const aFood = a.foodIncluded === true || a.food === true ? 1 : 0;
      const bFood = b.foodIncluded === true || b.food === true ? 1 : 0;
      return bFood - aFood;
    });
  }
  return sorted.sort((a, b) => {
    const aVerified = a.verified ? 1 : 0;
    const bVerified = b.verified ? 1 : 0;
    const aAvailable = a.available ? 1 : 0;
    const bAvailable = b.available ? 1 : 0;
    return bVerified + bAvailable - (aVerified + aAvailable);
  });
}

export function sortListingsBySeatsLeft(listings) {
  return [...listings].sort((a, b) => {
    const seatsA = getTotalSeatsLeft(a);
    const seatsB = getTotalSeatsLeft(b);
    if (seatsB !== seatsA) return seatsB - seatsA;
    return getTimestampSeconds(b.updatedAt || b.createdAt) - getTimestampSeconds(a.updatedAt || a.createdAt);
  });
}

export function getShortRoomTitle(title = "") {
  const cleanTitle = String(title).toLowerCase();

  if (cleanTitle.includes("single")) return "Single";
  if (cleanTitle.includes("double")) return "Double";
  if (cleanTitle.includes("triple")) return "Triple";
  if (cleanTitle.includes("four")) return "Four";
  if (cleanTitle.includes("dorm")) return "Dorm";

  return title || "Room";
}

export function getAvailableRoomTypesText(listing) {
  if (!listing || !Array.isArray(listing.roomOptions) || listing.roomOptions.length === 0) {
    return "";
  }

  const availableRooms = listing.roomOptions
    .filter((room) => Number(room.availableUnits || 0) > 0)
    .map((room) => getShortRoomTitle(room.title));

  const uniqueRooms = Array.from(new Set(availableRooms)).slice(0, 3);

  if (uniqueRooms.length === 0) return "";

  if (uniqueRooms.length === 1) return `${uniqueRooms[0]} room`;

  if (uniqueRooms.length === 2) {
    return `${uniqueRooms[0]} and ${uniqueRooms[1]} rooms`;
  }

  return `${uniqueRooms.slice(0, -1).join(", ")} and ${
    uniqueRooms[uniqueRooms.length - 1]
  } rooms`;
}

export function getEssentialsText(listing) {
  if (
    !listing ||
    !Array.isArray(listing.nearbyEssentials) ||
    listing.nearbyEssentials.length === 0
  ) {
    return "";
  }

  return listing.nearbyEssentials.slice(0, 2).join(" and ");
}

export function getRoomPreview(listing) {
  if (!listing) return [];
  const roomOptions = Array.isArray(listing.roomOptions)
    ? listing.roomOptions
    : [];

  if (roomOptions.length === 0) {
    return [
      {
        key: "total-seats",
        title: "Seats",
        seats: listing.available ? 1 : 0,
      },
    ];
  }

  return roomOptions.slice(0, 3).map((room, index) => ({
    key: room.id || `${room.title}-${index}`,
    title: getShortRoomTitle(room.title),
    seats: Number(room.availableUnits || 0),
  }));
}

export function getListingCoverImage(listing) {
  if (Array.isArray(listing?.images) && listing.images.length > 0) {
    return listing.images[0];
  }
  return "";
}