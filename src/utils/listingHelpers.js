import { findInstitution, getInstitutionReferencePoint as getConfiguredInstitutionReferencePoint } from "../config/institutions";

export function getListingId(listing) {
  return listing?.id || listing?.listingId || listing?.docId || "";
}

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
function normalizeInstitutionDistanceKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, "_");
}

export function getInstitutionIdFromValue(value) {
  const institution = findInstitution(value);

  if (institution?.id && institution.id !== "all") {
    return institution.id;
  }

  const normalized = normalizeInstitutionDistanceKey(value);

  return normalized === "all" ? "" : normalized;
}

export function getInstitutionReferencePoint(value) {
  return getConfiguredInstitutionReferencePoint(value);
}

export function normalizeInstitutionDistances(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value)
      .map(([rawInstitutionId, item]) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) {
          return null;
        }

        const distanceKm = Number(item.distanceKm);
        const institutionId =
          getInstitutionIdFromValue(rawInstitutionId) ||
          getInstitutionIdFromValue(item.institutionId) ||
          getInstitutionIdFromValue(item.referencePoint);

        if (!institutionId || !Number.isFinite(distanceKm) || distanceKm < 0) {
          return null;
        }

        const referencePoint = String(
          item.referencePoint || getInstitutionReferencePoint(institutionId) || ""
        ).trim();

        return [
          institutionId,
          {
            ...item,
            distanceKm,
            referencePoint,
          },
        ];
      })
      .filter(Boolean)
  );
}

export function getInstitutionDistance(listing, institutionId) {
  const cleanInstitutionId = getInstitutionIdFromValue(institutionId);

  if (!cleanInstitutionId) return null;

  const distanceKm = normalizeInstitutionDistances(listing?.institutionDistances)?.[
    cleanInstitutionId
  ]?.distanceKm;
  const parsed = Number(distanceKm);

  if (!Number.isFinite(parsed) || parsed < 0) return null;

  return parsed;
}

export function formatDistance(distanceKm) {
  const value = Number(distanceKm);

  if (!Number.isFinite(value) || value < 0) return "";

  if (value < 1) {
    return `${Math.round(value * 1000)} m`;
  }

  const rounded = Math.round(value * 10) / 10;

  return Number.isInteger(rounded) ? `${rounded} km` : `${rounded.toFixed(1)} km`;
}

function getListingInstitutionIds(listing) {
  const rawValues = [
    listing?.institutionId,
    listing?.nearbyCollege,
    ...(Array.isArray(listing?.nearbyInstitutions) ? listing.nearbyInstitutions : []),
    ...(listing?.nearbyInstitutionText
      ? String(listing.nearbyInstitutionText)
          .split(",")
          .map((item) => item.trim())
      : []),
  ];

  return Array.from(
    new Set(
      rawValues
        .map(getInstitutionIdFromValue)
        .filter((institutionId) => institutionId && institutionId !== "all")
    )
  );
}

function buildDistanceInfo(institutionId, item) {
  if (!item) return null;

  const distanceText = formatDistance(item.distanceKm);
  const referencePoint = String(
    item.referencePoint || getInstitutionReferencePoint(institutionId) || ""
  ).trim();

  if (!distanceText || !referencePoint) return null;

  return {
    institutionId,
    distanceKm: Number(item.distanceKm),
    distanceText,
    referencePoint,
    label: `Approx. ${distanceText} from ${referencePoint}`,
  };
}

export function getBestInstitutionDistanceInfo(listing, selectedInstitutionId) {
  const distances = normalizeInstitutionDistances(listing?.institutionDistances);
  const selectedId = getInstitutionIdFromValue(selectedInstitutionId);

  if (selectedId && selectedId !== "all") {
    const selectedInfo = buildDistanceInfo(selectedId, distances[selectedId]);

    if (selectedInfo) return selectedInfo;
  }

  const orderedIds = Array.from(
    new Set([...getListingInstitutionIds(listing), ...Object.keys(distances)])
  );

  for (const institutionId of orderedIds) {
    const info = buildDistanceInfo(institutionId, distances[institutionId]);

    if (info) return info;
  }

  return null;
}

export function getListingDistanceEntries(listing) {
  const distances = normalizeInstitutionDistances(listing?.institutionDistances);
  const orderedIds = Array.from(
    new Set([...getListingInstitutionIds(listing), ...Object.keys(distances)])
  );

  return orderedIds
    .map((institutionId) => buildDistanceInfo(institutionId, distances[institutionId]))
    .filter(Boolean);
}

export function buildInstitutionDistanceInputs(value) {
  return Object.fromEntries(
    Object.entries(normalizeInstitutionDistances(value)).map(([institutionId, item]) => [
      institutionId,
      String(item.distanceKm),
    ])
  );
}

export function buildInstitutionDistancesFromInputs(
  selectedInstitutionValues,
  distanceInputs = {},
  existingDistances = {}
) {
  const selectedInstitutionIds = Array.from(
    new Set(
      (Array.isArray(selectedInstitutionValues) ? selectedInstitutionValues : [])
        .map(getInstitutionIdFromValue)
        .filter(Boolean)
    )
  );
  const institutionDistances = {
    ...normalizeInstitutionDistances(existingDistances),
  };

  selectedInstitutionIds.forEach((institutionId) => {
    delete institutionDistances[institutionId];
  });

  for (const institutionId of selectedInstitutionIds) {
    const rawValue = distanceInputs?.[institutionId];
    const cleanValue = String(rawValue ?? "").trim();

    if (!cleanValue) continue;

    const distanceKm = Number(cleanValue);
    const referencePoint = getInstitutionReferencePoint(institutionId);

    if (!Number.isFinite(distanceKm) || distanceKm < 0) {
      return {
        error: `Enter a valid non-negative distance for ${referencePoint || institutionId}.`,
        institutionDistances,
      };
    }

    institutionDistances[institutionId] = {
      distanceKm,
      referencePoint,
    };
  }

  return {
    error: "",
    institutionDistances,
  };
}
