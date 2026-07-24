export const institutions = [
  {
    id: "all",
    shortName: "All",
    fullName: "All institutions",
    heroLabel: "All Colleges",
    showOnHome: false,
    referencePoint: "",
    areas: [
      "JIST Gate",
      "Sotai",
      "JEC Gate",
      "Tarajan",
      "Ayush Pharmacy Area",
      "Kaziranga ITI Area",
    ],
  },
  {
    id: "jist",
    shortName: "JIST",
    fullName: "Jorhat Institute of Science and Technology",
    heroLabel: "JIST",
    showOnHome: true,
    referencePoint: "JIST Main Gate",
    areas: ["JIST Gate", "Sotai", "Kokilamukh Road", "Nearby JIST"],
  },
  {
    id: "jec",
    shortName: "JEC",
    fullName: "Jorhat Engineering College",
    heroLabel: "JEC",
    showOnHome: true,
    referencePoint: "JEC Main Gate",
    areas: ["JEC Gate", "Garmur", "Tarajan", "Nearby JEC"],
  },
  {
    id: "ayush",
    shortName: "Ayush",
    fullName: "Ayush Pharmacy",
    heroLabel: "Ayush Pharmacy",
    showOnHome: false,
    referencePoint: "Ayush Pharmacy Main Gate",
    areas: ["Ayush Pharmacy Area", "Tarajan", "Nearby Ayush Pharmacy"],
  },
  {
    id: "kaziranga",
    shortName: "Kaziranga",
    fullName: "Kaziranga ITI",
    heroLabel: "Kaziranga ITI",
    showOnHome: false,
    referencePoint: "Kaziranga ITI Main Gate",
    areas: ["Kaziranga ITI Area", "Sotai", "Nearby Kaziranga ITI"],
  },
];

export function getInstitutionById(id) {
  return (
    institutions.find((institution) => institution.id === id) || institutions[0]
  );
}
export function findInstitution(value) {
  const normalizedValue = normalizeInstitution(value);

  if (!normalizedValue) return null;

  return (
    institutions.find((institution) => {
      const aliases = [
        institution.id,
        institution.shortName,
        institution.fullName,
        institution.heroLabel,
        institution.referencePoint,
      ]
        .map(normalizeInstitution)
        .filter(Boolean);

      return aliases.some(
        (alias) =>
          alias === normalizedValue ||
          alias.includes(normalizedValue) ||
          normalizedValue.includes(alias)
      );
    }) || null
  );
}

export function getInstitutionReferencePoint(value) {
  return findInstitution(value)?.referencePoint || "";
}
function normalizeInstitution(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function listingMatchesInstitution(listing, institutionId) {
  if (!institutionId || institutionId === "all") return true;

  const institution = getInstitutionById(institutionId);
  const aliases = [
    institution.id,
    institution.shortName,
    institution.fullName,
    institution.heroLabel,
    institution.referencePoint,
  ]
    .map(normalizeInstitution)
    .filter(Boolean);

  const listingValues = [
    listing?.institutionId,
    listing?.nearbyCollege,
    listing?.nearbyInstitutionText,
    ...(Array.isArray(listing?.nearbyInstitutions)
      ? listing.nearbyInstitutions
      : []),
  ]
    .map(normalizeInstitution)
    .filter(Boolean);

  return listingValues.some((value) =>
    aliases.some((alias) => value === alias || value.includes(alias))
  );
}
