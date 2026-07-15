import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Home as HomeIcon, SlidersHorizontal } from "lucide-react";
import ListingCard from "../../components/public/ListingCard";
import Badge from "../../components/common/Badge";
import HeroSection from "../../components/public/HeroSection";
import Footer from "../../components/public/Footer";
import InstitutionUpdateCard from "../../components/public/InstitutionUpdateCard";
import {
  TrustProcessSection,
  OwnerCTASection,
} from "../../components/public/InfoSections";
import {
  institutions,
  listingMatchesInstitution,
} from "../../config/institutions";
import { getApprovedListings } from "../../firebase/listings";
import { getNearbyText } from "../../utils/listingHelpers";

import { sortListingsByOption } from "../../utils/listingScore";

import {
  genderFilters,
  stayTypeFilters,
  foodFilters,
  institutionFilters,
  sortOptions,
} from "../../utils/filterConstants";

const allInstitution = institutions.find((institution) => institution.id === "all");
const homeInstitutionChips = [
  allInstitution,
  ...institutions.filter((institution) => institution.showOnHome === true),
].filter(Boolean);
const heroInstitutions = homeInstitutionChips.filter(
  (institution) => institution.id !== "all"
);

function Home() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("all");
  const [type, setType] = useState("all");
  const [area, setArea] = useState("all");
  const [foodFilter, setFoodFilter] = useState("all");
  const [institution, setInstitution] = useState("all");
  const [sortBy, setSortBy] = useState("recommended");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12);

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchParams] = useSearchParams();

  const [textIndex, setTextIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % heroInstitutions.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadApprovedListings() {
      try {
        setLoading(true);
        const data = await getApprovedListings();
        setListings(data);
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

    if (!openListingId) return;

    navigate(`/listing/${openListingId}`, { replace: true });
  }, [searchParams, navigate]);

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

  const totalSeatsAvailable = useMemo(() => {
    return listings.reduce((total, listing) => {
      return total + getTotalSeatsLeft(listing);
    }, 0);
  }, [listings]);

  const jecListingCount = useMemo(() => {
    return listings.filter((listing) => listingMatchesInstitution(listing, "jec")).length;
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
      const matchesInstitution = listingMatchesInstitution(listing, institution);
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
    return sortListingsByOption(filtered, sortBy);
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

  const visibleListings = filteredListings.slice(0, visibleCount);
  const showJecUpdate = institution === "jec";

  useEffect(() => {
    setVisibleCount(12);
  }, [search, gender, type, area, foodFilter, institution, sortBy, verifiedOnly, availableOnly]);

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
          Now helping students find stays around JIST, JEC, and nearby areas
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
        totalSeatsAvailable={totalSeatsAvailable}
        currentInstitutionName={heroInstitutions[textIndex]?.heroLabel || "JIST"}
      />

      <section className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {homeInstitutionChips.map((item) => {
            const selected = institution === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setInstitution(item.id)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-black transition ${
                  selected
                    ? "border-[#1E5B4F] bg-[#1E5B4F] text-white"
                    : "border-[#E8DFD2] bg-white text-slate-700 hover:bg-[#F6F1E8]"
                }`}
              >
                {item.heroLabel}
              </button>
            );
          })}
        </div>
      </section>
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
              Recommended stays based on availability, updates, trust, and fair
              visibility.
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

        {showJecUpdate && !loading && (
          <InstitutionUpdateCard listingCount={jecListingCount || 6} />
        )}

        {loading ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <h3 className="text-xl font-bold">Loading listings...</h3>
          </div>
        ) : filteredListings.length > 0 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onViewDetails={() => navigate(`/listing/${listing.id}`)}
                />
              ))}
            </div>

            {visibleCount < filteredListings.length && (
              <button
                onClick={() => setVisibleCount((count) => count + 12)}
                className="mx-auto mt-8 block rounded-2xl bg-[#1E5B4F] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#123C35]"
              >
                Load more stays
              </button>
            )}
          </>
        ) : showJecUpdate ? null : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <h3 className="text-xl font-bold">No listing found</h3>
          </div>
        )}
      </section>

      <TrustProcessSection />
      <OwnerCTASection />

      <Footer />
    </main>
  );
}

function getTotalSeatsLeft(listing) {
  if (!Array.isArray(listing.roomOptions)) {
    return listing.available ? 1 : 0;
  }

  return listing.roomOptions.reduce(
    (sum, room) => sum + Number(room.availableUnits || 0),
    0,
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
