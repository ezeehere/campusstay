import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  MapPin,
  Phone,
  Search,
  SlidersHorizontal,
  Sparkles,
  Utensils,
} from "lucide-react";

import { trackListingInteraction } from "../../firebase/analytics";
import { getApprovedListings } from "../../firebase/listings";
import { getSavedListings } from "../../firebase/savedListings";
import { watchStudentAuth } from "../../firebase/studentAuth";
import ListingDetailsModal from "../public/ListingDetailsModal";
import SaveListingButton from "./SaveListingButton";
import ShareListingButton from "../shared/ShareListingButton";

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
  { label: "Price: Low to High", value: "price_low_high" },
  { label: "Price: High to Low", value: "price_high_low" },
  { label: "Recently Added", value: "recent" },
  { label: "Food Included First", value: "food_first" },
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

function getEstimatedFirstMonthCost(listing) {
  const rent = Number(listing.startingRent || listing.rent || 0);
  const deposit = Number(listing.deposit || 0);
  const electricity =
    listing.electricityIncluded === false
      ? Number(listing.electricityCharge || 0)
      : 0;

  return rent + deposit + electricity;
}

function getTimestampSeconds(value) {
  if (!value) return 0;
  if (value?.seconds) return value.seconds;
  if (typeof value?.toDate === "function") return value.toDate().getTime() / 1000;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime() / 1000;
}

function getRecommendationScore(listing, profile) {
  let score = 0;

  const rent = getListingRent(listing);
  const budgetMin = Number(profile?.budgetMin || 0);
  const budgetMax = Number(profile?.budgetMax || 0);
  const nearbyInstitutions = getNearbyInstitutions(listing);

  if (profile?.college && nearbyInstitutions.includes(profile.college)) {
    score += 3;
  }

  if (profile?.preferredArea) {
    const listingArea = String(listing.area || "").toLowerCase();
    const preferredArea = String(profile.preferredArea || "").toLowerCase();

    if (
      listingArea.includes(preferredArea) ||
      preferredArea.includes(listingArea)
    ) {
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
  if (listing.verified) score += 1;
  if (listing.available) score += 1;

  return score;
}

function sortListings(items, sortBy, profile) {
  const sorted = [...items];

  if (sortBy === "price_low_high") {
    return sorted.sort((a, b) => getListingRent(a) - getListingRent(b));
  }

  if (sortBy === "price_high_low") {
    return sorted.sort((a, b) => getListingRent(b) - getListingRent(a));
  }

  if (sortBy === "recent") {
    return sorted.sort(
      (a, b) =>
        getTimestampSeconds(b.createdAt || b.updatedAt) -
        getTimestampSeconds(a.createdAt || a.updatedAt)
    );
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

function StudentListingSection({ profile }) {
  const [listings, setListings] = useState([]);
  const [savedListings, setSavedListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
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

  const recommendedListings = useMemo(() => {
    return [...listings]
      .map((listing) => ({
        ...listing,
        recommendationScore: getRecommendationScore(listing, profile),
      }))
      .filter((listing) => listing.recommendationScore > 0)
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 6);
  }, [listings, profile]);

  const filteredListings = useMemo(() => {
    const cleanSearch = search.toLowerCase().trim();

    const filtered = listings.filter((listing) => {
      const nearbyText = getNearbyText(listing);

      const searchableText = `${listing.name || ""} ${listing.area || ""} ${listing.gender || ""
        } ${listing.type || ""} ${nearbyText} ${(listing.facilities || []).join(
          " "
        )} ${(listing.nearbyEssentials || []).join(" ")} ${listing.otherCharges || ""
        } ${listing.moveInNote || ""}`.toLowerCase();

      const matchesSearch =
        !cleanSearch || searchableText.includes(cleanSearch);

      const matchesGender = gender === "all" || listing.gender === gender;
      const matchesType = type === "all" || listing.type === type;
      const matchesArea = area === "all" || listing.area === area;

      const matchesInstitution =
        institution === "all" ||
        getNearbyInstitutions(listing).includes(institution);

      const foodIncluded = isFoodIncluded(listing);

      const matchesFood =
        foodFilter === "all" ||
        (foodFilter === "included" && foodIncluded) ||
        (foodFilter === "not_included" && !foodIncluded);

      const matchesAvailable = !availableOnly || listing.available;
      const matchesVerified = !verifiedOnly || listing.verified;

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
    });

    return sortListings(filtered, sortBy, profile);
  }, [
    listings,
    search,
    gender,
    type,
    area,
    institution,
    foodFilter,
    availableOnly,
    verifiedOnly,
    sortBy,
    profile,
  ]);

  const savedListingIds = new Set(savedListings.map((item) => item.listingId));

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
      <section className="mt-5 rounded-[1.5rem] border border-[#E8DFD2] bg-white p-4 shadow-sm sm:rounded-[2rem] sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-[#1F2933]">
              <Sparkles size={21} />
              Recommended for you
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Based on your institution, budget, area, food, gender, and stay type.
            </p>
          </div>

          <p className="text-sm font-bold text-[#1E5B4F]">
            {recommendedListings.length} matches
          </p>
        </div>

        {recommendedListings.length === 0 ? (
          <div className="mt-4 rounded-3xl bg-[#FFF8EF] p-4 text-sm text-slate-500">
            No strong recommendations yet. Update preferences or browse all listings.
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommendedListings.map((listing) => (
              <StudentListingCard
                key={listing.id}
                listing={listing}
                saved={savedListingIds.has(listing.id)}
                onView={() => setSelectedListing(listing)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mt-5 rounded-[1.5rem] border border-[#E8DFD2] bg-white p-4 shadow-sm sm:rounded-[2rem] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#1F2933]">
              Browse PGs and rooms
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Filter and sort approved listings inside your student dashboard.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFilters((previous) => !previous)}
              className="inline-flex items-center gap-2 rounded-full border border-[#E8DFD2] bg-[#F6F1E8] px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-white"
            >
              <SlidersHorizontal size={15} />
              {showFilters ? "Hide filters" : "Filters & Sort"}
            </button>

            <p className="rounded-full bg-[#F1FAF7] px-4 py-2 text-sm font-bold text-[#1E5B4F]">
              {filteredListings.length} of {listings.length}
            </p>
          </div>
        </div>

        <div className="mt-4">
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

        <div
          className={`mt-4 rounded-3xl border border-[#E8DFD2] bg-[#FFF8EF] p-4 ${showFilters ? "block" : "hidden"
            } lg:block`}
        >
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

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

        {filteredListings.length === 0 ? (
          <div className="mt-4 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <h3 className="text-lg font-bold text-[#1F2933]">
              No matching PG found
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Try changing your filters or search text.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredListings.map((listing) => (
              <StudentListingCard
                key={listing.id}
                listing={listing}
                saved={savedListingIds.has(listing.id)}
                onView={() => setSelectedListing(listing)}
              />
            ))}
          </div>
        )}
      </section>

      {selectedListing && (
        <ListingDetailsModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
        />
      )}
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
      <div className="relative h-40 bg-[#F6F1E8]">
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
            ₹{rent}
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
            {nearbyText ? ` · Near ${nearbyText}` : ""}
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