import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Loader2,
  MapPin,
  Phone,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

import { trackListingInteraction } from "../../firebase/analytics";
import { getApprovedListings } from "../../firebase/listings";
import { getSavedListings } from "../../firebase/savedListings";
import { watchStudentAuth } from "../../firebase/studentAuth";
import { getListingId } from "../../utils/listingHelpers";
import SaveListingButton from "./SaveListingButton";
import ShareListingButton from "../shared/ShareListingButton";

const RUPEE = "\u20B9";
const DOT = "\u00B7";

const genderFilters = [
  { label: "All Students", value: "all" },
  { label: "Boys", value: "Boys" },
  { label: "Girls", value: "Girls" },
  { label: "Co-ed", value: "Co-ed" },
];

const stayTypeFilters = [
  { label: "All Stays", value: "all" },
  { label: "PG", value: "PG" },
  { label: "Room", value: "Room" },
  { label: "Hostel", value: "Hostel" },
];

const foodFilters = [
  { label: "Any Food Option", value: "all" },
  { label: "Food Included", value: "included" },
  { label: "Without Food", value: "not_included" },
];

const institutionFilters = [
  { label: "All Institutions", value: "all" },
  { label: "JIST", value: "JIST" },
  { label: "JEC", value: "JEC" },
  { label: "Kaziranga ITI", value: "Kaziranga ITI" },
  { label: "Ayush Pharmacy", value: "Ayush Pharmacy" },
];

const sortOptions = [
  { label: "Recommended", value: "recommended" },
  { label: "Lowest rent first", value: "lowest_rent" },
  { label: "Highest rent first", value: "highest_rent" },
  { label: "Newest first", value: "newest" },
  { label: "Most seats available", value: "most_available" },
];

function getListingRent(listing) {
  return Number(listing.startingRent || listing.rent || 0);
}

function isFoodIncluded(listing) {
  return listing.foodIncluded === true || listing.food === true;
}

function getNearbyInstitutions(listing) {
  if (
    Array.isArray(listing.nearbyInstitutions) &&
    listing.nearbyInstitutions.length > 0
  ) {
    return listing.nearbyInstitutions;
  }

  if (listing.nearbyCollege) {
    return [listing.nearbyCollege];
  }

  if (listing.nearbyInstitutionText) {
    return String(listing.nearbyInstitutionText)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function getNearbyText(listing) {
  return getNearbyInstitutions(listing).join(", ");
}

function getPreferredAreas(profile) {
  if (Array.isArray(profile?.preferredAreas) && profile.preferredAreas.length > 0) {
    return profile.preferredAreas;
  }

  if (profile?.preferredArea) {
    return String(profile.preferredArea)
      .split(",")
      .map((area) => area.trim())
      .filter(Boolean);
  }

  return [];
}

function getTotalSeatsLeft(listing) {
  if (!Array.isArray(listing.roomOptions)) return listing.available ? 1 : 0;

  return listing.roomOptions.reduce(
    (sum, room) => sum + Number(room.availableUnits || 0),
    0
  );
}

function getAvailableFromText(listing) {
  if (listing.moveInNote) return listing.moveInNote;
  if (!listing.availableFrom) return "Ask";

  try {
    return new Date(listing.availableFrom).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return listing.availableFrom;
  }
}

function CompactInfo({ label, value }) {
  return (
    <div className="rounded-2xl bg-[#F6F1E8] px-2.5 py-2">
      <p className="text-[9px] font-black uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 line-clamp-1 text-xs font-black text-[#1F2933]">
        {value || "Ask"}
      </p>
    </div>
  );
}


function getTimestampSeconds(value) {
  if (!value) return 0;
  if (value?.seconds) return value.seconds;
  if (typeof value?.toDate === "function") return value.toDate().getTime() / 1000;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime() / 1000;
}

function getPreferenceSignalScore(listing, profile) {
  let score = 0;

  const rent = getListingRent(listing);
  const budgetMin = Number(profile?.budgetMin || 0);
  const budgetMax = Number(profile?.budgetMax || 0);
  const selectedInstitution =
    profile?.institutionId || profile?.college || profile?.institutionName;

  if (selectedInstitution && listingMatchesInstitution(listing, selectedInstitution)) {
    score += 3;
  }

  const preferredAreas = getPreferredAreas(profile);

  if (preferredAreas.length > 0) {
    const listingArea = String(listing.area || "").toLowerCase();
    const matchesPreferredArea = preferredAreas.some((area) => {
      const preferredArea = String(area || "").toLowerCase();

      return (
        listingArea &&
        preferredArea &&
        (listingArea.includes(preferredArea) ||
          preferredArea.includes(listingArea))
      );
    });

    if (matchesPreferredArea) {
      score += 3;
    }
  }

  if (profile?.preferredStayType && profile.preferredStayType !== "Both") {
    if (
      String(listing.type || "").toLowerCase() ===
      profile.preferredStayType.toLowerCase()
    ) {
      score += 2;
    }
  }

  if (profile?.gender) {
    if (
      listing.gender === profile.gender ||
      listing.gender === "Co-ed" ||
      profile.gender === "All"
    ) {
      score += 2;
    }
  }

  if (budgetMin && rent >= budgetMin) score += 1;
  if (budgetMax && rent <= budgetMax) score += 2;

  if (profile?.foodRequired === "Yes" && isFoodIncluded(listing)) score += 2;

  return score;
}

function getRecommendationScore(listing, profile) {
  let score = getPreferenceSignalScore(listing, profile);

  if (listing.verified) score += 1;
  if (listing.available) score += 1;

  return score;
}
function getListingFreshnessSeconds(listing) {
  return Math.max(
    getTimestampSeconds(listing.updatedAt),
    getTimestampSeconds(listing.createdAt)
  );
}

function normalizeFilterText(value) {
  return String(value || "").toLowerCase().trim();
}

function listingMatchesInstitution(listing, selectedInstitution) {
  if (selectedInstitution === "all") return true;

  const cleanSelectedInstitution = normalizeFilterText(selectedInstitution);
  const listingInstitutions = [
    listing.institutionId,
    listing.nearbyCollege,
    listing.nearbyInstitutionText,
    ...getNearbyInstitutions(listing),
  ]
    .map(normalizeFilterText)
    .filter(Boolean);

  return listingInstitutions.some((institution) => {
    return (
      institution === cleanSelectedInstitution ||
      institution.includes(cleanSelectedInstitution) ||
      cleanSelectedInstitution.includes(institution)
    );
  });
}

function getSearchableListingText(listing) {
  const nearbyText = getNearbyText(listing);

  return `${listing.name || ""} ${listing.area || ""} ${listing.gender || ""} ${
    listing.type || ""
  } ${nearbyText} ${(listing.facilities || []).join(" ")} ${(
    listing.nearbyEssentials || []
  ).join(" ")} ${listing.otherCharges || ""} ${listing.moveInNote || ""}`.toLowerCase();
}

function listingMatchesFilters(listing, filters) {
  const cleanSearch = normalizeFilterText(filters.search);
  const foodIncluded = isFoodIncluded(listing);

  const matchesSearch =
    !cleanSearch || getSearchableListingText(listing).includes(cleanSearch);
  const matchesGender = filters.gender === "all" || listing.gender === filters.gender;
  const matchesType = filters.type === "all" || listing.type === filters.type;
  const matchesArea = filters.area === "all" || listing.area === filters.area;
  const matchesInstitution = listingMatchesInstitution(listing, filters.institution);
  const matchesFood =
    filters.foodFilter === "all" ||
    (filters.foodFilter === "included" && foodIncluded) ||
    (filters.foodFilter === "not_included" && !foodIncluded);
  const matchesAvailable = !filters.availableOnly || listing.available;
  const matchesVerified = !filters.verifiedOnly || listing.verified;

  return (
    matchesSearch &&
    matchesGender &&
    matchesType &&
    matchesArea &&
    matchesInstitution &&
    matchesFood &&
    matchesAvailable &&
    matchesVerified
  );
}

function filterListingsByControls(items, filters) {
  return items.filter((listing) => listingMatchesFilters(listing, filters));
}

function sortListings(items, sortBy, profile) {
  const sorted = [...items];

  if (sortBy === "lowest_rent" || sortBy === "price_low_high") {
    return sorted.sort((a, b) => getListingRent(a) - getListingRent(b));
  }

  if (sortBy === "highest_rent" || sortBy === "price_high_low") {
    return sorted.sort((a, b) => getListingRent(b) - getListingRent(a));
  }

  if (sortBy === "newest" || sortBy === "recent") {
    return sorted.sort(
      (a, b) => getListingFreshnessSeconds(b) - getListingFreshnessSeconds(a)
    );
  }

  if (sortBy === "most_available") {
    return sorted.sort((a, b) => getTotalSeatsLeft(b) - getTotalSeatsLeft(a));
  }

  if (sortBy === "food_first") {
    return sorted.sort((a, b) => {
      const aFood = isFoodIncluded(a) ? 1 : 0;
      const bFood = isFoodIncluded(b) ? 1 : 0;

      return bFood - aFood;
    });
  }

  return sorted.sort((a, b) => {
    const aScore = getRecommendationScore(a, profile);
    const bScore = getRecommendationScore(b, profile);

    if (bScore !== aScore) return bScore - aScore;

    const aVerified = a.verified ? 1 : 0;
    const bVerified = b.verified ? 1 : 0;

    const aAvailable = a.available ? 1 : 0;
    const bAvailable = b.available ? 1 : 0;

    return bVerified + bAvailable - (aVerified + aAvailable);
  });
}

function StudentListingSection({ profile, activeView = "forYou" }) {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [savedListings, setSavedListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("all");
  const [type, setType] = useState("all");
  const [area, setArea] = useState("all");
  const [foodFilter, setFoodFilter] = useState("all");
  const [institution, setInstitution] = useState("all");
  const [sortBy, setSortBy] = useState("recommended");
  const [availableOnly, setAvailableOnly] = useState(true);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  async function loadData(user) {
    const approvedListings = await getApprovedListings();
    setListings(approvedListings);

    if (user) {
      const savedData = await getSavedListings(user.uid);
      setSavedListings(savedData);
    }
  }

  useEffect(() => {
    const unsubscribe = watchStudentAuth(async (user) => {
      await loadData(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const areaFilters = useMemo(() => {
    const uniqueAreas = Array.from(
      new Set(
        listings
          .map((listing) => listing.area)
          .filter(Boolean)
          .map((item) => item.trim())
      )
    ).sort();

    return [
      { label: "All Areas", value: "all" },
      ...uniqueAreas.map((item) => ({
        label: item,
        value: item,
      })),
    ];
  }, [listings]);

  const activeFilters = useMemo(
    () => ({
      search,
      gender,
      type,
      area,
      foodFilter,
      institution,
      availableOnly,
      verifiedOnly,
    }),
    [
      search,
      gender,
      type,
      area,
      foodFilter,
      institution,
      availableOnly,
      verifiedOnly,
    ]
  );

  const recommendedListings = useMemo(() => {
    const recommendedBase = listings
      .map((listing) => ({
        ...listing,
        preferenceSignalScore: getPreferenceSignalScore(listing, profile),
        recommendationScore: getRecommendationScore(listing, profile),
      }))
      .filter((listing) => listing.preferenceSignalScore > 0);

    return sortListings(
      filterListingsByControls(recommendedBase, activeFilters),
      sortBy,
      profile
    ).slice(0, 6);
  }, [listings, profile, activeFilters, sortBy]);

  const filteredListings = useMemo(() => {
    return sortListings(
      filterListingsByControls(listings, activeFilters),
      sortBy,
      profile
    );
  }, [listings, activeFilters, sortBy, profile]);
  const savedListingIds = new Set(savedListings.map((item) => item.listingId));
  const isForYouView = activeView === "forYou";
  const currentListings = isForYouView ? recommendedListings : filteredListings;
  const sectionTitle = isForYouView ? "Recommended for you" : "Browse all stays";
  const sectionSubtitle = isForYouView
    ? "Based on your preferences and active filters."
    : "Explore all approved listings.";
  const resultLabel = isForYouView
    ? `${recommendedListings.length} matches`
    : `${filteredListings.length} stays`;
  const emptyTitle = isForYouView
    ? "No recommended stays match your preferences yet."
    : "No stays found for these filters.";
  const emptyText = isForYouView
    ? "Try changing filters or browse all stays."
    : "Try changing budget, area, or stay type.";

  function resetFilters() {
    setSearch("");
    setGender("all");
    setType("all");
    setArea("all");
    setFoodFilter("all");
    setInstitution("all");
    setSortBy("recommended");
    setAvailableOnly(true);
    setVerifiedOnly(false);
  }

  function handleViewDetails(listing) {
    const listingId = getListingId(listing);

    if (!listingId) {
      alert("Listing details are not available.");
      return;
    }

    navigate(`/listing/${listingId}`);
  }

  if (loading) {
    return (
      <section className="mt-5 rounded-[1.5rem] border border-[#E8DFD2] bg-white p-4 shadow-sm sm:rounded-[2rem] sm:p-6">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <Loader2 className="animate-spin" size={19} />
          Loading PG and room suggestions...
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="rounded-[1.5rem] border border-[#E8DFD2] bg-white p-3 shadow-sm sm:rounded-[2rem] sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-[#1F2933] sm:text-xl">
              <SlidersHorizontal size={19} />
              Filters & Sort
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFilters((previous) => !previous)}
              className="inline-flex items-center gap-2 rounded-full bg-[#1E5B4F] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#123C35]"
            >
              <SlidersHorizontal size={15} />
              {showFilters ? "Hide filters" : "Filters & Sort"}
            </button>

            <p className="rounded-full bg-[#F1FAF7] px-4 py-2 text-sm font-bold text-[#1E5B4F]">
              {filteredListings.length} of {listings.length}
            </p>
          </div>
        </div>

        <div className={`${showFilters ? "block" : "hidden"} lg:block`}>
          <div className="mt-3">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search PG name, area, institution, facilities..."
                className="h-12 w-full rounded-2xl border border-[#E8DFD2] bg-[#FFF8EF] pl-11 pr-4 text-sm outline-none focus:border-[#1E5B4F] focus:bg-white"
              />
            </div>
          </div>

          <div className="mt-3 rounded-3xl border border-[#E8DFD2] bg-[#FFF8EF] p-3 sm:p-4">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <FilterSelect
                label="For"
                value={gender}
                onChange={setGender}
                options={genderFilters}
              />

              <FilterSelect
                label="Stay Type"
                value={type}
                onChange={setType}
                options={stayTypeFilters}
              />

              <FilterSelect
                label="Food"
                value={foodFilter}
                onChange={setFoodFilter}
                options={foodFilters}
              />

              <FilterSelect
                label="Nearby Institution"
                value={institution}
                onChange={setInstitution}
                options={institutionFilters}
              />

              <FilterSelect
                label="Area"
                value={area}
                onChange={setArea}
                options={areaFilters}
              />

              <FilterSelect
                label="Sort By"
                value={sortBy}
                onChange={setSortBy}
                options={sortOptions}
              />
            </div>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-3">
                <label className="flex h-11 items-center gap-2 rounded-2xl border border-[#E8DFD2] bg-white px-4 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={availableOnly}
                    onChange={(event) => setAvailableOnly(event.target.checked)}
                  />
                  Available only
                </label>

                <label className="flex h-11 items-center gap-2 rounded-2xl border border-[#E8DFD2] bg-white px-4 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(event) => setVerifiedOnly(event.target.checked)}
                  />
                  Verified only
                </label>
              </div>

              <button
                type="button"
                onClick={resetFilters}
                className="h-11 rounded-2xl border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-[#F6F1E8]"
              >
                Reset filters
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-[1.5rem] border border-[#E8DFD2] bg-white p-3 shadow-sm sm:rounded-[2rem] sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-[#1F2933]">
              {isForYouView && <Sparkles size={21} />}
              {sectionTitle}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{sectionSubtitle}</p>
          </div>

          <p className="rounded-full bg-[#F1FAF7] px-4 py-2 text-sm font-bold text-[#1E5B4F]">
            {resultLabel}
          </p>
        </div>

        {currentListings.length === 0 ? (
          <div className="mt-3 rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center sm:p-8">
            <h3 className="text-lg font-bold text-[#1F2933]">{emptyTitle}</h3>
            <p className="mt-2 text-sm text-slate-500">{emptyText}</p>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-4 sm:mt-4 sm:grid-cols-2 lg:grid-cols-3">
            {currentListings.map((listing) => (
              <StudentListingCard
                key={listing.id}
                listing={listing}
                saved={savedListingIds.has(listing.id)}
                onView={() => handleViewDetails(listing)}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-2xl border border-[#E8DFD2] bg-white px-4 text-sm font-semibold text-slate-700 outline-none"
      >
        {options.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function StudentListingCard({ listing, onView }) {
  const images = Array.isArray(listing.images) ? listing.images : [];
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const image = images[activeImageIndex] || "";
  const rent = getListingRent(listing);
  const nearbyText = getNearbyText(listing);
  const seatsLeft = getTotalSeatsLeft(listing);
  const foodIncluded = isFoodIncluded(listing);
  const availableFromText = getAvailableFromText(listing);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [listing.id]);

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setActiveImageIndex((previousIndex) =>
        previousIndex + 1 >= images.length ? 0 : previousIndex + 1
      );
    }, 4000);

    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <article className="overflow-hidden rounded-[1.4rem] border border-[#E8DFD2] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-36 bg-[#F6F1E8] sm:h-40">
        {image ? (
          <img
            src={image}
            alt={listing.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-bold text-slate-400">
            No image
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />

        <div className="absolute right-3 top-3 flex gap-2">
          <ShareListingButton listing={listing} />
          <SaveListingButton listing={listing} showText={false} />
        </div>

        <div className="absolute left-3 top-3 flex gap-1.5">
          {listing.verified && (
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-700">
              Verified
            </span>
          )}

          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-black ${listing.available
              ? "bg-[#1E5B4F] text-white"
              : "bg-red-50 text-red-700"
              }`}
          >
            {listing.available ? "Available" : "Full"}
          </span>
        </div>

        <div className="absolute bottom-3 left-3 right-24">
          <p className="text-[11px] font-semibold text-white/80">
            {listing.type || "Stay"} {listing.gender ? `for ${listing.gender}` : ""}
          </p>

          <h3 className="mt-0.5 line-clamp-1 text-lg font-black text-white">
            {listing.name || "Unnamed stay"}
          </h3>
        </div>

        <div className="absolute bottom-3 right-3 rounded-2xl bg-white/95 px-3 py-2 text-right shadow-sm">
          <p className="text-[10px] font-bold uppercase text-slate-500">
            rent
          </p>
          <p className="text-lg font-black leading-none text-[#1F2933]">
            {RUPEE}{rent}
          </p>
        </div>

        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1">
            {images.map((_, index) => (
              <span
                key={index}
                className={`h-1.5 rounded-full transition-all ${activeImageIndex === index
                  ? "w-5 bg-white"
                  : "w-1.5 bg-white/70"
                  }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="flex items-start gap-1.5 text-sm text-slate-500">
          <MapPin size={14} className="mt-0.5 shrink-0" />
          <span className="line-clamp-2">
            <span className="font-bold text-slate-700">
              {listing.area || "Area not added"}
            </span>
            {nearbyText ? ` ${DOT} Near ${nearbyText}` : ""}
          </span>
        </p>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <CompactInfo label="Seats" value={seatsLeft > 0 ? `${seatsLeft} left` : "Full"} />
          <CompactInfo label="Food" value={foodIncluded ? "Yes" : "No"} />
          <CompactInfo label="Move-in" value={availableFromText} />
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {[listing.type, listing.gender, ...(listing.facilities || []).slice(0, 1)]
            .filter(Boolean)
            .map((chip, index) => (
              <span
                key={`${chip}-${index}`}
                className="rounded-full bg-[#F6F1E8] px-2.5 py-1 text-xs font-bold text-slate-600"
              >
                {chip}
              </span>
            ))}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onView}
            className="flex-1 rounded-2xl bg-[#1E5B4F] px-4 py-3 text-sm font-black text-white transition hover:bg-[#123C35]"
          >
            View details
          </button>

          {listing.phone && (
            <a
              href={`tel:${listing.phone}`}
              onClick={(event) => {
                event.stopPropagation();
                trackListingInteraction(
                  "call_click",
                  listing,
                  "callClicks"
                ).catch((error) => {
                  console.error("Call analytics failed:", error);
                });
              }}
              className="rounded-2xl border border-[#E8DFD2] bg-white px-4 py-3 text-[#1E5B4F] transition hover:bg-[#F6F1E8]"
            >
              <Phone size={18} />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default StudentListingSection;
