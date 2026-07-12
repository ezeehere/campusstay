// src/utils/filterConstants.js

import { institutions } from "../config/institutions";

export const genderFilters = [
  { label: "All Students", value: "all" },
  { label: "Boys", value: "Boys" },
  { label: "Girls", value: "Girls" },
  { label: "Co-ed", value: "Co-ed" },
];

export const stayTypeFilters = [
  { label: "All Stays", value: "all" },
  { label: "PG", value: "PG" },
  { label: "Room", value: "Room" },
  { label: "Hostel", value: "Hostel" },
];

export const foodFilters = [
  { label: "Any Food Option", value: "all" },
  { label: "Food Included", value: "included" },
  { label: "Without Food", value: "not_included" },
];

export const institutionFilters = institutions.map((institution) => ({
  label: institution.id === "all" ? "All Institutions" : institution.heroLabel,
  value: institution.id,
}));

export const sortOptions = [
  { label: "Recommended", value: "recommended" },
  { label: "Price: Low to High", value: "price_low_high" },
  { label: "Price: High to Low", value: "price_high_low" },
  { label: "Most seats left", value: "seats_left" },
  { label: "Recently updated", value: "recently_updated" },
  { label: "Verified first", value: "verified_first" },
];