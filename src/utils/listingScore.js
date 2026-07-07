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

export function getTotalSeatsLeft(listing) {
  if (!Array.isArray(listing?.roomOptions)) {
    return listing?.available ? 1 : 0;
  }

  return listing.roomOptions.reduce(
    (total, room) => total + Number(room.availableUnits || 0),
    0
  );
}

export function getListingUpdatedTime(listing) {
  const value =
    listing?.availabilityUpdatedAt ||
    listing?.updatedAt ||
    listing?.createdAt ||
    listing?.submittedAt;

  if (!value) return 0;

  if (typeof value === "number") return value;

  if (value.seconds) {
    return value.seconds * 1000;
  }

  if (value.toDate) {
    return value.toDate().getTime();
  }

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function getDaysSinceUpdate(listing) {
  const updatedTime = getListingUpdatedTime(listing);

  if (!updatedTime) return Infinity;

  return (Date.now() - updatedTime) / (1000 * 60 * 60 * 24);
}

function hasGoodPhotos(listing) {
  return Array.isArray(listing?.images) && listing.images.length >= 3;
}

function hasMoveInInfo(listing) {
  return Boolean(listing?.moveInNote || listing?.availableFrom);
}

function hasMapLocation(listing) {
  return Boolean(listing?.mapLink);
}

function hasPgNote(listing) {
  return Boolean(String(listing?.pgNote || "").trim());
}

export function getListingScoreBreakdown(listing) {
  const seatsLeft = getTotalSeatsLeft(listing);
  const daysSinceUpdate = getDaysSinceUpdate(listing);

  const items = [];
  const missing = [];

  function add(label, points) {
    if (points > 0) {
      items.push({ label, points });
    }
  }

  if (listing?.available) {
    add("Available", 25);
  } else {
    missing.push("Currently full");
  }

  if (listing?.verified) {
    add("Verified", 15);
  } else {
    missing.push("Not verified");
  }

  if (daysSinceUpdate <= 3) {
    add("Updated within 3 days", 15);
  } else if (daysSinceUpdate <= 7) {
    add("Updated within 7 days", 10);
  } else if (daysSinceUpdate <= 30) {
    add("Updated within 30 days", 5);
  } else {
    missing.push("Needs recent update");
  }

  if (seatsLeft > 0) {
    add("Has seats left", 10);

    if (seatsLeft <= 5) {
      add("Small PG fair boost", 10);
    } else if (seatsLeft <= 12) {
      add("Medium PG boost", 8);
    } else {
      add("Large PG availability boost", 5);
    }
  } else {
    missing.push("No seats left");
  }

  if (hasGoodPhotos(listing)) {
    add("3+ photos", 10);
  } else {
    missing.push("Needs 3+ photos");
  }

  if (hasMoveInInfo(listing)) {
    add("Move-in info", 5);
  } else {
    missing.push("Move-in info missing");
  }

  if (hasPgNote(listing)) {
    add("PG note", 5);
  } else {
    missing.push("PG note missing");
  }

  if (hasMapLocation(listing)) {
    add("Map location", 5);
  } else {
    missing.push("Map link missing");
  }

  const total = Math.min(
    100,
    items.reduce((sum, item) => sum + item.points, 0)
  );

  let label = "Low visibility risk";

  if (total >= 80) {
    label = "Excellent listing";
  } else if (total >= 65) {
    label = "Good listing";
  } else if (total >= 45) {
    label = "Needs improvement";
  }

  return {
    total,
    label,
    items,
    missing,
    seatsLeft,
    startingRent: getStartingRent(listing),
    updatedTime: getListingUpdatedTime(listing),
  };
}

export function sortListingsByOption(listings, sortBy = "recommended") {
  return [...listings].sort((a, b) => {
    const scoreA = getListingScoreBreakdown(a);
    const scoreB = getListingScoreBreakdown(b);

    const availableA = a.available ? 1 : 0;
    const availableB = b.available ? 1 : 0;

    if (availableB !== availableA) {
      return availableB - availableA;
    }

    if (sortBy === "price_low_high") {
      if (scoreA.startingRent !== scoreB.startingRent) {
        return scoreA.startingRent - scoreB.startingRent;
      }

      return scoreB.total - scoreA.total;
    }

    if (sortBy === "price_high_low") {
      if (scoreA.startingRent !== scoreB.startingRent) {
        return scoreB.startingRent - scoreA.startingRent;
      }

      return scoreB.total - scoreA.total;
    }

    if (sortBy === "seats_left") {
      if (scoreB.seatsLeft !== scoreA.seatsLeft) {
        return scoreB.seatsLeft - scoreA.seatsLeft;
      }

      return scoreB.total - scoreA.total;
    }

    if (sortBy === "recently_updated") {
      if (scoreB.updatedTime !== scoreA.updatedTime) {
        return scoreB.updatedTime - scoreA.updatedTime;
      }

      return scoreB.total - scoreA.total;
    }

    if (sortBy === "verified_first") {
      const verifiedA = a.verified ? 1 : 0;
      const verifiedB = b.verified ? 1 : 0;

      if (verifiedB !== verifiedA) {
        return verifiedB - verifiedA;
      }

      return scoreB.total - scoreA.total;
    }

    // Default: Recommended
    if (scoreB.total !== scoreA.total) {
      return scoreB.total - scoreA.total;
    }

    return scoreB.updatedTime - scoreA.updatedTime;
  });
}
