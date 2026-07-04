import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Home as HomeIcon, SlidersHorizontal } from "lucide-react";

// Components Imports
import ListingCard from "../../components/public/ListingCard";
import ListingDetailsModal from "../../components/public/ListingDetailsModal";
import Badge from "../../components/common/Badge";
import HeroSection from "../../components/public/HeroSection";
import Footer from "../../components/public/Footer";

import { institutionNames } from "../../utils/tickerConstants";

import {
  TrustProcessSection,
  OwnerCTASection,
} from "../../components/public/InfoSections";

import { getApprovedListings } from "../../firebase/listings";
import {
  sortListings,
  sortListingsBySeatsLeft,
  getNearbyText,
  getNearbyInstitutions,
} from "../../utils/listingHelpers";

import { 
  genderFilters, 
  stayTypeFilters, 
  foodFilters, 
  institutionFilters, 
  sortOptions 
} from "../../utils/filterConstants";


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

  const [textIndex, setTextIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % institutionNames.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

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
    const matchedListing = listings.find((l) => l.id === openListingId);
    if (matchedListing) setSelectedListing(matchedListing);
  }, [searchParams, listings]);

  const areaFilters = useMemo(() => {
    const uniqueAreas = Array.from(
      new Set(
        listings
          .map((l) => l.area)
          .filter(Boolean)
          .map((i) => i.trim()),
      ),
    ).sort();
    return [
      { label: "All Areas", value: "all" },
      ...uniqueAreas.map((i) => ({ label: i, value: i })),
    ];
  }, [listings]);

  const filteredListings = useMemo(() => {
    const cleanSearch = search.toLowerCase().trim();
    const filtered = listings.filter((listing) => {
      const nearbyText = getNearbyText(listing);
      const searchableText =
        `${listing.name || ""} ${listing.area || ""} ${listing.gender || ""} ${listing.type || ""} ${nearbyText} ${(listing.facilities || []).join(" ")}`.toLowerCase();

      const matchesSearch =
        !cleanSearch || searchableText.includes(cleanSearch);
      const matchesGender = gender === "all" || listing.gender === gender;
      const matchesType = type === "all" || listing.type === type;
      const matchesArea = area === "all" || listing.area === area;
      const matchesInstitution =
        institution === "all" ||
        getNearbyInstitutions(listing).includes(institution);
      const foodIncluded =
        listing.foodIncluded === true || listing.food === true;
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

  const sortedListings = useMemo(
    () => sortListingsBySeatsLeft(filteredListings),
    [filteredListings],
  );

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

      <div className="mx-auto hidden max-w-7xl px-4 pt-4 sm:block sm:px-6">
        <div className="rounded-full border border-[#E8DFD2] bg-white px-4 py-2 text-center text-xs font-black text-slate-700 shadow-sm">
          Now helping students find stays around JIST, JEC, Kaziranga ITI and
          nearby areas
        </div>
      </div>

      <HeroSection
        search={search}
        setSearch={setSearch}
        gender={gender}
        setGender={setGender}
        type={type}
        setType={setType}
        foodFilter={foodFilter}
        setFoodFilter={setFoodFilter}
        totalListings={listings.length}
        currentInstitutionName={institutionNames[textIndex]}
      />

      <section
        id="available-stays"
        className="mx-auto max-w-7xl px-4 pt-5 pb-10 sm:px-6 lg:px-8 sm:pt-8"
      >
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
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
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1E5B4F] hidden lg:block">
                Live listings
              </p>
            </div>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#03071F]">
              Available stays near you
            </h2>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Sorted by seats left, so students see the most available stays
              first.
            </p>
          </div>
          <div className="w-fit rounded-2xl border border-[#E8DFD2] bg-white px-4 py-3 text-sm font-black text-slate-700 shadow-sm">
            Showing {filteredListings.length} of {listings.length}
          </div>
        </div>

        <div
          className={`mb-6 rounded-3xl border border-[#E8DFD2] bg-white p-4 shadow-sm ${showMobileFilters ? "block" : "hidden"} lg:block`}
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
          </div>
        ) : filteredListings.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onViewDetails={() => setSelectedListing(listing)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <h3 className="text-xl font-bold">No listing found</h3>
          </div>
        )}
      </section>

      <TrustProcessSection />
      <OwnerCTASection />

      <Footer />

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
        onChange={(e) => onChange(e.target.value)}
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

export default Home;