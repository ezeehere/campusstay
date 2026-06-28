import { useEffect, useMemo, useState } from "react";
import { Loader2, MapPin, Phone, Sparkles, Utensils } from "lucide-react";

import { trackListingInteraction } from "../../firebase/analytics";
import { getApprovedListings } from "../../firebase/listings";
import { getSavedListings } from "../../firebase/savedListings";
import { watchStudentAuth } from "../../firebase/studentAuth";
import ListingDetailsModal from "../public/ListingDetailsModal";
import SaveListingButton from "./SaveListingButton";

function getListingRent(listing) {
  return Number(listing.startingRent || listing.rent || 0);
}

function getRecommendationScore(listing, profile) {
  let score = 0;

  const rent = getListingRent(listing);
  const budgetMin = Number(profile?.budgetMin || 0);
  const budgetMax = Number(profile?.budgetMax || 0);

  if (profile?.preferredArea) {
    const listingArea = String(listing.area || "").toLowerCase();
    const preferredArea = String(profile.preferredArea || "").toLowerCase();

    if (listingArea.includes(preferredArea) || preferredArea.includes(listingArea)) {
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
      listing.gender === "All" ||
      profile.gender === "All"
    ) {
      score += 2;
    }
  }

  if (budgetMin && rent >= budgetMin) score += 1;
  if (budgetMax && rent <= budgetMax) score += 2;

  if (profile?.foodRequired === "Yes" && listing.foodIncluded) score += 2;
  if (listing.verified) score += 1;
  if (listing.available) score += 1;

  return score;
}

function StudentListingSection({ profile }) {
  const [studentUser, setStudentUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [savedListings, setSavedListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [loading, setLoading] = useState(true);

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
      setStudentUser(user);
      await loadData(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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

  const savedListingIds = new Set(savedListings.map((item) => item.listingId));

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
              Based on your budget, area, food, gender, and stay type.
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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#1F2933]">
              All PGs and rooms
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Browse all approved listings on CampusStay.
            </p>
          </div>

          <p className="text-sm font-bold text-[#1E5B4F]">
            {listings.length} listings
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <StudentListingCard
              key={listing.id}
              listing={listing}
              saved={savedListingIds.has(listing.id)}
              onView={() => setSelectedListing(listing)}
            />
          ))}
        </div>
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

function StudentListingCard({ listing, onView }) {
  const image = listing.images?.[0] || "";
  const rent = getListingRent(listing);

  return (
    <article className="overflow-hidden rounded-[1.4rem] border border-[#E8DFD2] bg-white shadow-sm">
      <div className="relative aspect-[16/10] bg-[#F6F1E8]">
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

        <div className="absolute right-3 top-3">
          <SaveListingButton listing={listing} showText={false} />
        </div>

        {listing.verified && (
          <span className="absolute left-3 top-3 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            Verified
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="line-clamp-1 text-base font-bold text-[#1F2933]">
              {listing.name}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
              <MapPin size={14} />
              <span className="line-clamp-1">{listing.area}</span>
            </p>
          </div>

          <span className="shrink-0 rounded-full bg-[#FFF4D8] px-3 py-1 text-xs font-bold text-[#8A5A00]">
            ₹{rent}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-[#F6F1E8] px-3 py-1 text-xs font-bold text-slate-600">
            {listing.type}
          </span>

          <span className="rounded-full bg-[#F6F1E8] px-3 py-1 text-xs font-bold text-slate-600">
            {listing.gender}
          </span>

          <span className="inline-flex items-center gap-1 rounded-full bg-[#F6F1E8] px-3 py-1 text-xs font-bold text-slate-600">
            <Utensils size={12} />
            {listing.foodIncluded ? "Food" : "No food"}
          </span>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onView}
            className="flex-1 rounded-2xl bg-[#1E5B4F] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#123C35]"
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
