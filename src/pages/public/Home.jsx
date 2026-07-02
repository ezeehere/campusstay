import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";

import {
  CheckCircle2,
  Home as HomeIcon,
  MapPin,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import ListingCard from "../../components/public/ListingCard";
import ListingDetailsModal from "../../components/public/ListingDetailsModal";
import Badge from "../../components/common/Badge";
import { getApprovedListings } from "../../firebase/listings";

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

function Home() {
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("all");
  const [type, setType] = useState("all");
  const [area, setArea] = useState("all");
  const [foodFilter, setFoodFilter] = useState("all");
  const [institution, setInstitution] = useState("all");
  const [sortBy, setSortBy] = useState("recommended");

  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(true);

  const [selectedListing, setSelectedListing] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchParams] = useSearchParams();

  function handleViewListing(listing) {
    setSelectedListing(listing);
  }

  useEffect(() => {
    async function loadApprovedListings() {
      try {
        setLoading(true);
        const data = await getApprovedListings();
        setListings(sortListingsBySeatsLeft(data));
      } catch (error) {
        console.error("Error loading approved listings:", error);
        alert("Could not load listings.");
      } finally {
        setLoading(false);
      }
    }

    loadApprovedListings();
  }, []);

  useEffect(() => {
    const openListingId = searchParams.get("openListing");

    if (!openListingId || listings.length === 0) return;

    const matchedListing = listings.find(
      (listing) => listing.id === openListingId
    );

    if (matchedListing) {
      setSelectedListing(matchedListing);
    }
  }, [searchParams, listings]);

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

  const filteredListings = useMemo(() => {
    const cleanSearch = search.toLowerCase().trim();

    const filtered = listings.filter((listing) => {
      const nearbyText = getNearbyText(listing);

      const searchableText = `${listing.name || ""} ${listing.area || ""} ${listing.gender || ""
        } ${listing.type || ""} ${nearbyText} ${(listing.facilities || []).join(
          " "
        )}`.toLowerCase();

      const matchesSearch =
        !cleanSearch || searchableText.includes(cleanSearch);

      const matchesGender = gender === "all" || listing.gender === gender;
      const matchesType = type === "all" || listing.type === type;
      const matchesArea = area === "all" || listing.area === area;

      const matchesInstitution =
        institution === "all" ||
        getNearbyInstitutions(listing).includes(institution);

      const foodIncluded = listing.foodIncluded === true || listing.food === true;

      const matchesFood =
        foodFilter === "all" ||
        (foodFilter === "included" && foodIncluded) ||
        (foodFilter === "not_included" && !foodIncluded);

      const matchesVerified = !verifiedOnly || listing.verified;
      const matchesAvailable = !availableOnly || listing.available;

      return (
        matchesSearch &&
        matchesGender &&
        matchesType &&
        matchesArea &&
        matchesInstitution &&
        matchesFood &&
        matchesVerified &&
        matchesAvailable
      );
    });

    return sortListings(filtered, sortBy);
  }, [
    listings,
    search,
    gender,
    type,
    area,
    institution,
    foodFilter,
    verifiedOnly,
    availableOnly,
    sortBy,
  ]);

  const sortedListings = useMemo(() => {
    return sortListingsBySeatsLeft(filteredListings);
  }, [filteredListings]);

  const quickFilterClass = (active) =>
    `shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${active
      ? "border-slate-950 bg-slate-950 text-white"
      : "border-[#E8DFD2] bg-white text-slate-700 hover:bg-[#FFF8EF]"
    }`;

  function resetFilters() {
    setSearch("");
    setGender("all");
    setType("all");
    setArea("all");
    setFoodFilter("all");
    setInstitution("all");
    setSortBy("recommended");
    setVerifiedOnly(false);
    setAvailableOnly(true);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FFF8EF] via-white to-[#F6F1E8] text-slate-950">
      <header className="sticky top-0 z-45 border-b border-[#E8DFD2] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#070B1F] text-white sm:h-10 sm:w-10">
              <HomeIcon size={18} />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-[1.35rem] font-bold leading-none text-[#070B1F] sm:text-xl">
                CampusStay
              </h1>
              <p className="mt-1 hidden text-xs text-slate-500 sm:block">
                PGs and rooms made easy
              </p>
            </div>
          </Link>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <Link
              to="/student/login"
              className="rounded-2xl border border-[#E8DFD2] bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-[#F6F1E8] sm:px-4 sm:text-sm"
            >
              Student
            </Link>

            <Link
              to="/owner/login"
              className="rounded-2xl border border-[#E8DFD2] bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-[#F6F1E8] sm:px-4 sm:text-sm"
            >
              Owner
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-[#070B1F] sm:text-5xl lg:text-6xl">
              Find verified PGs and rooms near your campus.
            </h1>

            <div className="mt-6 grid grid-cols-3 gap-3 sm:max-w-2xl">
              <div className="rounded-2xl border border-[#E8DFD2] bg-white p-4 shadow-sm">
                <p className="text-xl font-extrabold text-[#070B1F]">
                  {listings.length || "20"}+
                </p>
                <p className="mt-1 text-xs text-slate-500">Listed stays</p>
              </div>

              <div className="rounded-2xl border border-[#E8DFD2] bg-white p-4 shadow-sm">
                <p className="text-xl font-extrabold text-[#070B1F]">4</p>
                <p className="mt-1 text-xs text-slate-500">Institutions</p>
              </div>

              <div className="rounded-2xl border border-[#E8DFD2] bg-white p-4 shadow-sm">
                <p className="text-xl font-extrabold text-[#070B1F]">Free</p>
                <p className="mt-1 text-xs text-slate-500">For students</p>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-[#E8DFD2] bg-white p-4 shadow-sm">
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={19}
                />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search PG name, area, institution, boys, girls..."
                  className="h-14 w-full rounded-2xl border border-[#E8DFD2] bg-[#FFF8EF] pl-12 pr-4 text-base outline-none transition focus:border-slate-400 focus:bg-white"
                />
              </div>

              <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none]">
                <button
                  onClick={() =>
                    setGender(gender === "Boys" ? "all" : "Boys")
                  }
                  className={quickFilterClass(gender === "Boys")}
                >
                  Boys
                </button>

                <button
                  onClick={() =>
                    setGender(gender === "Girls" ? "all" : "Girls")
                  }
                  className={quickFilterClass(gender === "Girls")}
                >
                  Girls
                </button>

                <button
                  onClick={() => setType(type === "PG" ? "all" : "PG")}
                  className={quickFilterClass(type === "PG")}
                >
                  PG
                </button>

                <button
                  onClick={() => setType(type === "Room" ? "all" : "Room")}
                  className={quickFilterClass(type === "Room")}
                >
                  Room
                </button>

                <button
                  onClick={() =>
                    setFoodFilter(
                      foodFilter === "included" ? "all" : "included"
                    )
                  }
                  className={quickFilterClass(foodFilter === "included")}
                >
                  Food included
                </button>

                <button
                  onClick={() => setVerifiedOnly(!verifiedOnly)}
                  className={quickFilterClass(verifiedOnly)}
                >
                  Verified only
                </button>
              </div>
            </div>

          </div>

          <div className="hidden lg:block">
            <div className="rounded-[2rem] border border-[#E8DFD2] bg-white p-4 shadow-2xl shadow-slate-200/70">
              <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">Quick stay preview</p>

                  <Badge type="verified">
                    <CheckCircle2 size={13} />
                    Verified
                  </Badge>
                </div>

                <div className="mt-5 overflow-hidden rounded-3xl">
                  <img
                    src="https://images.unsplash.com/photo-1560448204-603b3fc33ddc?q=80&w=1200&auto=format&fit=crop"
                    alt="Room preview"
                    className="h-60 w-full object-cover sm:h-64"
                  />
                </div>

                <div className="mt-5 rounded-3xl bg-white p-4 text-slate-950">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold">Near campus PG</h3>
                      <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                        <MapPin size={15} />
                        Near JIST and nearby student areas
                      </p>
                    </div>

                    <p className="font-extrabold">₹5,200</p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <span className="rounded-2xl bg-slate-100 px-3 py-2">
                      Food included
                    </span>
                    <span className="rounded-2xl bg-slate-100 px-3 py-2">
                      Girls PG
                    </span>
                    <span className="rounded-2xl bg-slate-100 px-3 py-2">
                      Wi-Fi
                    </span>
                    <span className="rounded-2xl bg-slate-100 px-3 py-2">
                      Available
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="available-stays"
        className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8"
      >
        <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="inline-flex items-center gap-2 rounded-full border border-[#E8DFD2] bg-[#F6F1E8] px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white lg:hidden"
            >
              <SlidersHorizontal size={14} />
              {showMobileFilters ? "Hide filters" : "Filters & Sort"}
            </button>

            <div className="hidden lg:inline-flex">
              <Badge>
                <SlidersHorizontal size={14} />
                Filters and sorting
              </Badge>
            </div>

            <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Available stays
            </h2>
          </div>

          <p className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
            Showing {filteredListings.length} of {listings.length} listings
          </p>
        </div>

        <div
          className={`mb-6 rounded-3xl border border-[#E8DFD2] bg-white p-4 shadow-sm ${showMobileFilters ? "block" : "hidden"
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
              <label className="flex h-11 items-center gap-2 rounded-2xl border border-[#E8DFD2] bg-[#FFF8EF] px-4 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                />
                Available only
              </label>

              <label className="flex h-11 items-center gap-2 rounded-2xl border border-[#E8DFD2] bg-[#FFF8EF] px-4 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                />
                Verified only
              </label>
            </div>

            <button
              type="button"
              onClick={resetFilters}
              className="h-11 rounded-2xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-[#FFF8EF]"
            >
              Reset filters
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <h3 className="text-xl font-bold">Loading listings...</h3>
            <p className="mt-2 text-slate-500">
              Please wait while we fetch approved stays.
            </p>
          </div>
        ) : filteredListings.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onViewDetails={() => handleViewListing(listing)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <h3 className="text-xl font-bold">No listing found</h3>
            <p className="mt-2 text-slate-500">
              Try changing the filters or search text.
            </p>
          </div>
        )}
      </section>

      <footer className="border-t border-[#E8DFD2] bg-[#FFF8EF]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-[#E8DFD2] bg-white p-6 shadow-sm sm:p-8">
            <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1E5B4F] text-white shadow-sm">
                    <HomeIcon size={23} />
                  </div>

                  <div>
                    <h3 className="text-xl font-extrabold text-[#1F2933]">
                      CampusStay
                    </h3>
                    <p className="text-sm text-slate-500">
                      PGs and rooms made easy
                    </p>
                  </div>
                </div>

                <p className="mt-4 max-w-md text-sm leading-6 text-slate-600">
                  CampusStay helps students find verified PGs and rooms near
                  campus with rent, photos, facilities, location, and direct
                  owner contact.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold uppercase tracking-wide text-[#1E5B4F]">
                  Quick links
                </h4>

                <div className="mt-4 grid gap-3 text-sm">
                  <Link
                    to="/"
                    className="w-fit font-medium text-slate-600 transition hover:text-[#1E5B4F]"
                  >
                    Home
                  </Link>

                  <Link
                    to="/submit-listing"
                    className="w-fit font-medium text-slate-600 transition hover:text-[#1E5B4F]"
                  >
                    List your PG
                  </Link>

                  <Link
                    to="/check-status"
                    className="w-fit font-medium text-slate-600 transition hover:text-[#1E5B4F]"
                  >
                    Check status
                  </Link>

                  <Link
                    to="/admin/login"
                    className="w-fit font-medium text-slate-600 transition hover:text-[#1E5B4F]"
                  >
                    Admin
                  </Link>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold uppercase tracking-wide text-[#1E5B4F]">
                  Launch area
                </h4>

                <div className="mt-4 rounded-3xl bg-[#F6F1E8] p-4">
                  <p className="text-2xl font-extrabold text-[#1F2933]">
                    JIST · JEC
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Expanding across nearby student areas including Kaziranga
                    ITI and Ayush Pharmacy.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-[#E8DFD2] pt-5">
              <div className="flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Students and parents are advised to visit and verify the stay
                  before making any payment.
                </p>

                <p>
                  Designed and built by{" "}
                  <span className="font-bold text-[#1E5B4F]">
                    Ezaz Ahmed
                  </span>
                  , JIST, Jorhat.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {selectedListing && (
        <ListingDetailsModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
        />
      )}
    </main>
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
        className="h-12 w-full rounded-2xl border border-[#E8DFD2] bg-[#FFF8EF] px-4 text-sm font-semibold text-slate-700 outline-none"
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

function getListingRent(listing) {
  return Number(listing.startingRent || listing.rent || 0);
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
  return getNearbyInstitutions(listing).join(" ");
}

function getTimestampSeconds(value) {
  if (!value) return 0;
  if (value?.seconds) return value.seconds;
  if (typeof value?.toDate === "function") return value.toDate().getTime() / 1000;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime() / 1000;
}

function sortListings(items, sortBy) {
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

function getTotalSeatsLeft(listing) {
  if (Array.isArray(listing.roomOptions) && listing.roomOptions.length > 0) {
    return listing.roomOptions.reduce(
      (total, room) => total + Number(room.availableUnits || 0),
      0
    );
  }

  return listing.available ? 1 : 0;
}

function sortListingsBySeatsLeft(listings) {
  return [...listings].sort((a, b) => {
    const seatsA = getTotalSeatsLeft(a);
    const seatsB = getTotalSeatsLeft(b);

    if (seatsB !== seatsA) {
      return seatsB - seatsA;
    }

    const timeA = getTimestampSeconds(a.updatedAt || a.createdAt);
    const timeB = getTimestampSeconds(b.updatedAt || b.createdAt);

    return timeB - timeA;
  });
}

export default Home;