import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  CheckCircle2,
  Home as HomeIcon,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";

import ListingCard from "../../components/public/ListingCard";
import ListingDetailsModal from "../../components/public/ListingDetailsModal";
import Badge from "../../components/common/Badge";
import { getApprovedListings } from "../../firebase/listings";

const genders = ["All", "Boys", "Girls", "Co-ed"];
const types = ["All", "PG", "Room"];
const areas = ["All", "Sotai", "Near JIST Gate", "Pulibor Road"];

function Home() {
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("All");
  const [type, setType] = useState("All");
  const [area, setArea] = useState("All");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(true);
  const [foodOnly, setFoodOnly] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);


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

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const searchableText = `${listing.name || ""} ${listing.area || ""} ${
          listing.gender || ""
        } ${listing.type || ""}`;

      const matchesSearch = searchableText
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesGender = gender === "All" || listing.gender === gender;
      const matchesType = type === "All" || listing.type === type;
      const matchesArea = area === "All" || listing.area === area;
      const matchesVerified = !verifiedOnly || listing.verified;
      const matchesAvailable = !availableOnly || listing.available;
      const matchesFood = !foodOnly || listing.food;

      return (
        matchesSearch &&
        matchesGender &&
        matchesType &&
        matchesArea &&
        matchesVerified &&
        matchesAvailable &&
        matchesFood
      );
    });
  }, [
    listings,
    search,
    gender,
    type,
    area,
    verifiedOnly,
    availableOnly,
    foodOnly,
  ]);

  const quickFilterClass = (active) =>
    `rounded-full border px-4 py-2 text-sm font-semibold transition ${
      active
        ? "border-slate-950 bg-slate-950 text-white"
        : "border-[#E8DFD2] bg-white text-slate-700 hover:bg-[#FFF8EF]"
    }`;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FFF8EF] via-white to-[#F6F1E8] text-slate-950">
      <header className="sticky top-0 z-30 border-b border-[#E8DFD2] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
              <HomeIcon size={22} />
            </div>

            <div>
              <h1 className="text-xl font-black tracking-tight">
                CampusStay
              </h1>
              <p className="text-xs text-slate-500">
                PGs and rooms made easy
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/check-status"
              className="hidden rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-[#FFF8EF] sm:inline-block"
            >
              Check status
            </Link>

            <Link
              to="/submit-listing"
              className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              List PG
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 pb-7 pt-8 sm:px-6 lg:px-8 lg:pt-12">
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <h2 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Find verified PGs and rooms near campus.
            </h2>

            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Currently showing stays around JIST. Check rent, food, distance,
              photos, and contact owners directly.
            </p>

            <div className="mt-6 rounded-3xl border border-[#E8DFD2] bg-white p-4 shadow-sm">
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={19}
                />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by PG name, area, boys, girls, room..."
                  className="h-14 w-full rounded-2xl border border-[#E8DFD2] bg-[#FFF8EF] pl-12 pr-4 text-base outline-none transition focus:border-slate-400 focus:bg-white"
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setGender(gender === "Boys" ? "All" : "Boys")}
                  className={quickFilterClass(gender === "Boys")}
                >
                  Boys
                </button>

                <button
                  onClick={() =>
                    setGender(gender === "Girls" ? "All" : "Girls")
                  }
                  className={quickFilterClass(gender === "Girls")}
                >
                  Girls
                </button>

                <button
                  onClick={() => setType(type === "PG" ? "All" : "PG")}
                  className={quickFilterClass(type === "PG")}
                >
                  PG
                </button>

                <button
                  onClick={() => setType(type === "Room" ? "All" : "Room")}
                  className={quickFilterClass(type === "Room")}
                >
                  Room
                </button>

                <button
                  onClick={() => setFoodOnly(!foodOnly)}
                  className={quickFilterClass(foodOnly)}
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

            <div className="mt-6 grid max-w-xl grid-cols-3 gap-3">
              <div className="rounded-3xl border border-[#E8DFD2] bg-white p-4 shadow-sm">
                <p className="text-2xl font-extrabold">20+</p>
                <p className="text-xs text-slate-500">Target listings</p>
              </div>

              <div className="rounded-3xl border border-[#E8DFD2] bg-white p-4 shadow-sm">
                <p className="text-2xl font-extrabold">JIST</p>
                <p className="text-xs text-slate-500">Current area</p>
              </div>

              <div className="rounded-3xl border border-[#E8DFD2] bg-white p-4 shadow-sm">
                <p className="text-2xl font-extrabold">Free</p>
                <p className="text-xs text-slate-500">For students</p>
              </div>
            </div>
          </div>

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
                    <h3 className="text-lg font-bold">Near JIST Gate PG</h3>
                    <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                      <MapPin size={15} />
                      700 m from campus
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
                    WiFi
                  </span>
                  <span className="rounded-2xl bg-slate-100 px-3 py-2">
                    Available
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
            <section
        id="listings"
        className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8"
      >
        <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <Badge>
              <SlidersHorizontal size={14} />
              Refine results
            </Badge>

            <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Available stays
            </h2>
          </div>

          <p className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
            Showing {filteredListings.length} of {listings.length} listings
          </p>
        </div>

        <div className="mb-6 rounded-3xl border border-[#E8DFD2] bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto_auto]">
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="h-12 rounded-2xl border border-[#E8DFD2] bg-[#FFF8EF] px-4 text-sm outline-none"
            >
              {genders.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="h-12 rounded-2xl border border-[#E8DFD2] bg-[#FFF8EF] px-4 text-sm outline-none"
            >
              {types.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="h-12 rounded-2xl border border-[#E8DFD2] bg-[#FFF8EF] px-4 text-sm outline-none"
            >
              {areas.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            <label className="flex h-12 items-center gap-2 rounded-2xl border border-[#E8DFD2] bg-[#FFF8EF] px-4 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
              />
              Available
            </label>

            <button
              onClick={() => {
                setSearch("");
                setGender("All");
                setType("All");
                setArea("All");
                setVerifiedOnly(false);
                setAvailableOnly(true);
                setFoodOnly(false);
              }}
              className="h-12 rounded-2xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-[#FFF8EF]"
            >
              Reset
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
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onViewDetails={setSelectedListing}
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



            <footer className="border-t border-[#E8DFD2] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>CampusStay - Find verified PGs and rooms near campus.</p>
          <p>Students and parents should visit and verify before paying.</p>
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

export default Home;