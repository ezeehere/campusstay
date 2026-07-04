export function getListingRent(listing) {
  return Number(listing.startingRent || listing.rent || 0);
}

export function getNearbyInstitutions(listing) {
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
  return getNearbyInstitutions(listing).join(" ");
}

function getTimestampSeconds(value) {
  if (!value) return 0;
  if (value?.seconds) return value.seconds;
  if (typeof value?.toDate === "function") return value.toDate().getTime() / 1000;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime() / 1000;
}

export function getTotalSeatsLeft(listing) {
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