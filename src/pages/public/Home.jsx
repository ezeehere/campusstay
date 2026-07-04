import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { institutionNames } from "../../utils/tickerConstants";
import {
  // CheckCircle2,
  Home as HomeIcon,
  // MapPin,
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

function HighlightSticker({ children, color = "green" }) {
  const bgColor = color === "yellow" ? "bg-[#FFE45C]" : "bg-[#42B66B]";

  return (
    <span className="relative inline-flex rotate-[-3deg] px-2 py-0.5 sm:px-3 sm:py-1">
      <span
        className={`absolute inset-0 -z-10 ${bgColor}`}
        style={{
          clipPath:
            "polygon(2% 8%, 98% 0%, 96% 92%, 5% 100%, 0% 45%)",
        }}
      />
      <span className="relative z-10 font-black text-[#03071F]">
        {children}
      </span>
    </span>
  );
}

function HeroTrustPill({ children }) {
  return (
    <span className="rounded-full border border-[#E8DFD2] bg-white/80 px-3 py-1.5 text-xs font-black text-slate-700 shadow-sm backdrop-blur">
      {children}
    </span>
  );
}

// Yahan dynamic text show karne ke liye props pass kiya hai
function HeroPreviewCard() {
  return (
    <div className="relative hidden lg:block">
      <div className="absolute -left-8 top-10 z-20">
        <HeroTrustPill>Updated seats</HeroTrustPill>
      </div>

      <div className="absolute -right-5 bottom-12 z-20">
        <HeroTrustPill>Direct owner contact</HeroTrustPill>
      </div>

      <div className="rounded-[2.2rem] border border-[#E8DFD2] bg-white p-4 shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
        <div className="rounded-[1.7rem] bg-[#070B1F] p-4">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-black text-white">
              Quick stay preview
            </p>

            <span className="rounded-full bg-[#E9FFF4] px-3 py-1 text-xs font-black text-[#16845A]">
              Verified
            </span>
          </div>

          <div className="h-52 overflow-hidden rounded-[1.5rem] bg-[#FFF8EF]">
            <img
              src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80"
              alt="Room preview"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="mt-4 rounded-[1.5rem] bg-white p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-black text-[#03071F]">
                  Student stay near JIST
                </h3>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  Sotai · Near JIST and nearby student areas
                </p>
              </div>

              <p className="text-right text-lg font-black text-[#03071F]">
                ₹3,000
                <span className="block text-[10px] font-bold text-slate-400">
                  month
                </span>
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700">
                8 seats left
              </div>
              <div className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700">
                Food available
              </div>
              <div className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700">
                Wi-Fi
              </div>
              <div className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700">
                Move-in: Ask
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RouteLineBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-40">
      <svg
        viewBox="0 0 1200 500"
        className="absolute left-0 top-0 h-full w-full"
        fill="none"
      >
        <path
          d="M80 420 C250 300, 330 360, 480 240 C620 130, 760 170, 900 90 C1010 30, 1080 80, 1160 40"
          stroke="#F97316"
          strokeWidth="3"
          strokeDasharray="10 14"
          strokeLinecap="round"
        />

        <circle cx="80" cy="420" r="7" fill="#1E5B4F" />
        <circle cx="480" cy="240" r="7" fill="#1E5B4F" />
        <circle cx="900" cy="90" r="7" fill="#1E5B4F" />
      </svg>
    </div>
  );
}

function TrustProcessSection() {
  const items = [
    {
      title: "Owner submits stay",
      text: "PG owners add photos, rent, seats left, food and rules.",
    },
    {
      title: "Admin checks details",
      text: "Listings are reviewed before becoming public.",
    },
    {
      title: "Students contact directly",
      text: "Call, WhatsApp or request callback without broker fee.",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="rounded-[2rem] border border-[#E8DFD2] bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1E5B4F]">
              Trust first
            </p>

            <h2 className="mt-2 text-2xl font-black text-[#03071F]">
              Built to reduce PG confusion
            </h2>
          </div>

          <span className="w-fit rounded-full bg-[#FFF3D6] px-4 py-2 text-xs font-black text-[#B45309]">
            No random unverified posts
          </span>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {items.map((item, index) => (
            <div
              key={item.title}
              className="rounded-[1.5rem] border border-[#E8DFD2] bg-[#FFF8EF] p-4"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#03071F] text-sm font-black text-white">
                {index + 1}
              </div>

              <h3 className="mt-4 font-black text-[#03071F]">
                {item.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OwnerCTASection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="relative overflow-hidden rounded-[2rem] bg-[#070B1F] p-6 text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)] sm:p-8">
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[#42B66B]/30 blur-3xl" />
        <div className="absolute -bottom-24 left-20 h-60 w-60 rounded-full bg-orange-400/25 blur-3xl" />

        <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#A7F3D0]">
              For PG owners
            </p>

            <h2 className="mt-2 max-w-2xl text-3xl font-black tracking-tight">
              Have empty seats? List your PG and share one clean public link.
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">
              Add photos, rent, rules, seats left and move-in info. Students can call
              or WhatsApp you directly.
            </p>
          </div>

          <a
            href="/submit-listing"
            className="inline-flex justify-center rounded-2xl bg-white px-6 py-4 text-sm font-black text-[#070B1F] transition hover:bg-[#FFF3D6]"
          >
            List your PG
          </a>
        </div>
      </div>
    </section>
  );
}

function PopularSearches({ onSearch }) {
  return null;
}

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

  // TIMER FOR CHANGING NAMES 
  const [textIndex, setTextIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % institutionNames.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

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
          Now helping students find stays around JIST, JEC, Kaziranga ITI and nearby areas
        </div>
      </div>

      <section className="relative overflow-hidden border-b border-[#E8DFD2] bg-[#FFF8EF]">
        <RouteLineBackground />
        <div className="pointer-events-none absolute -right-24 bottom-[-140px] h-72 w-72 rounded-full bg-[#FF7A1A]/20" />
        <div className="pointer-events-none absolute -right-10 bottom-[-90px] h-52 w-52 rounded-full bg-[#42B66B]/20" />

        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 pb-5 pt-5 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-14 lg:pt-12">
          <div>
            <div>
              <div className="mb-3 inline-flex rounded-full border border-[#E8DFD2] bg-white px-4 py-2 text-[11px] font-black uppercase tracking-wide text-[#1E5B4F] shadow-sm">
                No broker fee for students
              </div>

              {/* DYNAMIC TEXT LINKED TO TIMER STATE WITH SAFETY MIN-HEIGHT TO PREVENT LAYOUT SHIFT */}
              <h1 className="max-w-3xl text-[2.35rem] font-black leading-[1.03] tracking-[-0.055em] text-[#03071F] sm:text-6xl lg:text-7xl min-h-[90px] sm:min-h-[140px]">
                Find verified PGs and rooms near{" "}
                <HighlightSticker color="green">
                  {institutionNames[textIndex]}
                </HighlightSticker>
              </h1>

              <p className="mt-4 max-w-xl text-sm font-semibold leading-6 text-slate-600 sm:text-lg sm:leading-7">
                Real photos, updated seats, clear charges, and direct owner contact.
              </p>

              <div className="mt-4 hidden flex-wrap items-center gap-2 text-sm sm:flex">
                <span className="font-bold text-slate-500">Made for</span>

                {["JIST", "JEC", "Kaziranga ITI", "Ayush Pharmacy"].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-[#E8DFD2] bg-white px-3 py-1.5 text-xs font-black text-[#03071F] shadow-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-2xl border border-[#E8DFD2] bg-white p-3 shadow-sm sm:p-4">
                <p className="text-xl font-black text-[#03071F] sm:text-2xl">
                  {listings.length}+
                </p>
                <p className="mt-1 text-[11px] font-semibold text-slate-500 sm:text-xs">
                  Stays listed
                </p>
              </div>

              <div className="rounded-2xl border border-[#E8DFD2] bg-white p-3 shadow-sm sm:p-4">
                <p className="text-xl font-black text-[#03071F] sm:text-2xl">4</p>
                <p className="mt-1 text-[11px] font-semibold text-slate-500 sm:text-xs">
                  Student areas
                </p>
              </div>

              <div className="rounded-2xl border border-[#E8DFD2] bg-white p-3 shadow-sm sm:p-4">
                <p className="text-xl font-black text-[#03071F] sm:text-2xl">0</p>
                <p className="mt-1 text-[11px] font-semibold text-slate-500 sm:text-xs">
                  Broker fee
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-[1.5rem] border border-[#E8DFD2] bg-white/95 p-2 shadow-sm backdrop-blur sm:mt-7 sm:rounded-[2rem] sm:p-3">
              <div className="flex items-center gap-3 rounded-[1.2rem] border border-[#E8DFD2] bg-[#FFF8EF] px-4 py-3 sm:rounded-[1.5rem] sm:py-4">
                <Search size={18} className="text-slate-400" />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search PG, area, institution..."
                  className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="mt-2 flex gap-2 overflow-x-auto pb-1 sm:mt-3">
                {["Boys", "Girls", "PG", "Room", "Food included"].map((chip) => {
                  let isActive = false;
                  let clickHandler = () => { };

                  if (chip === "Boys") {
                    isActive = gender === "Boys";
                    clickHandler = () => setGender(gender === "Boys" ? "all" : "Boys");
                  } else if (chip === "Girls") {
                    isActive = gender === "Girls";
                    clickHandler = () => setGender(gender === "Girls" ? "all" : "Girls");
                  } else if (chip === "PG") {
                    isActive = type === "PG";
                    clickHandler = () => setType(type === "PG" ? "all" : "PG");
                  } else if (chip === "Room") {
                    isActive = type === "Room";
                    clickHandler = () => setType(type === "Room" ? "all" : "Room");
                  } else if (chip === "Food included") {
                    isActive = foodFilter === "included";
                    clickHandler = () => setFoodFilter(foodFilter === "included" ? "all" : "included");
                  }

                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={clickHandler}
                      className={`shrink-0 rounded-full border px-4 py-2 text-xs font-black transition ${isActive
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-[#E8DFD2] bg-white text-slate-700 hover:bg-[#F6F1E8]"
                        }`}
                    >
                      {chip}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <HeroPreviewCard />
        </div>
      </section>

      <PopularSearches onSearch={setSearch} />

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
              Sorted by seats left, so students see the most available stays first.
            </p>
          </div>

          <div className="w-fit rounded-2xl border border-[#E8DFD2] bg-white px-4 py-3 text-sm font-black text-slate-700 shadow-sm">
            Showing {filteredListings.length} of {listings.length}
          </div>
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

      <TrustProcessSection />

      <OwnerCTASection />

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

                <p className="mt-4 text-sm leading-7 text-slate-600">
                  CampusStay helps students find verified PGs, boys PGs, girls PGs, and rooms
                  for rent near JIST, JEC, Kaziranga ITI, Ayush Pharmacy, Sotai, and nearby
                  Jorhat student areas. Students can check real photos, rent, seats left, food,
                  facilities, rules, charges, location, and direct owner contact before visiting.
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
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Starting with PGs and rent rooms near JIST and JEC, then expanding across
                    Kaziranga ITI, Ayush Pharmacy, Sotai, and nearby Jorhat student areas.
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    "PG near JIST",
                    "PG in JIST",
                    "Rent rooms in JIST",
                    "Girls PG near JIST",
                    "Boys PG near JIST",
                    "PG near JEC",
                    "PG in Sotai",
                    "Student rooms near Jorhat",
                  ].map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-[#FFF8EF] px-3 py-1.5 text-xs font-bold text-slate-600"
                    >
                      {item}
                    </span>
                  ))}
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