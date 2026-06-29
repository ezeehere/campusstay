import { useEffect, useState } from "react";
import {
  BedDouble,
  CalendarDays,
  MapPin,
  Utensils,
} from "lucide-react";

import SaveListingButton from "../student/SaveListingButton";

function ListingCard({ listing, onViewDetails }) {
  const images = Array.isArray(listing.images) ? listing.images : [];
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const image = images[activeImageIndex] || "";
  const rent = listing.startingRent || listing.rent || 0;
  const seatsLeft = getTotalSeatsLeft(listing);
  const availableFromText = getAvailableFromText(listing);
  const nearbyText = getNearbyText(listing);
  const foodIncluded = listing.foodIncluded === true || listing.food === true;

  const chips = [
    listing.type,
    listing.gender,
    ...(listing.facilities || []).slice(0, 1),
    ...(listing.nearbyEssentials || []).slice(0, 2),
  ].filter(Boolean);

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
    <article className="overflow-hidden rounded-[1.5rem] border border-[#E8DFD2] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-40 overflow-hidden bg-[#F6F1E8] sm:h-44">
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

        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {listing.verified && (
            <span className="rounded-full bg-[#E9FFF4] px-2.5 py-1 text-[11px] font-black text-[#16845A]">
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

        <div className="absolute bottom-3 right-3 rounded-2xl bg-white/95 px-3 py-2 text-right shadow-sm backdrop-blur">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
            starts
          </p>
          <p className="text-lg font-black leading-none text-[#111827]">
            ₹{rent}
          </p>
          <p className="text-[10px] font-semibold text-slate-500">month</p>
        </div>

        <div className="absolute bottom-3 left-3 right-24">
          <p className="text-[11px] font-semibold text-white/80">
            {listing.type || "Stay"} {listing.gender ? `for ${listing.gender}` : ""}
          </p>
          <h3 className="mt-0.5 line-clamp-1 text-lg font-black leading-tight text-white">
            {listing.name || "Unnamed stay"}
          </h3>
        </div>

        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1">
            {images.map((_, index) => (
              <span
                key={index}
                className={`h-1.5 rounded-full transition-all ${activeImageIndex === index
                  ? "w-5 bg-white"
                  : "w-1.5 bg-white/60"
                  }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start gap-2 text-slate-600">
          <MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" />
          <p className="line-clamp-2 text-sm leading-5">
            <span className="font-bold text-slate-700">
              {listing.area || "Area not added"}
            </span>
            {nearbyText ? (
              <span className="text-slate-500"> · Near {nearbyText}</span>
            ) : null}
          </p>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <MiniInfo
            icon={<BedDouble size={14} />}
            label="Seats"
            value={seatsLeft > 0 ? `${seatsLeft} left` : "Full"}
          />

          <MiniInfo
            icon={<Utensils size={14} />}
            label="Food"
            value={foodIncluded ? "Yes" : "No"}
          />

          <MiniInfo
            icon={<CalendarDays size={14} />}
            label="Move-in"
            value={availableFromText}
          />
        </div>

        {chips.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {chips.slice(0, 4).map((chip, index) => (
              <span
                key={`${chip}-${index}`}
                className="rounded-full bg-[#F6F1E8] px-2.5 py-1 text-xs font-bold text-slate-600"
              >
                {chip}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={onViewDetails}
            className="flex-1 rounded-2xl bg-[#070B1F] px-4 py-3 text-sm font-black text-white transition hover:opacity-95"
          >
            View details
          </button>

          <div className="w-14">
            <SaveListingButton listing={listing} showText={false} />
          </div>
        </div>
      </div>
    </article>
  );
}

function MiniInfo({ icon, label, value }) {
  return (
    <div className="rounded-2xl bg-[#F8F8F8] px-2.5 py-2.5">
      <div className="flex items-center gap-1 text-slate-400">
        {icon}
        <p className="text-[9px] font-black uppercase tracking-wide">
          {label}
        </p>
      </div>

      <p className="mt-1 line-clamp-1 text-xs font-black text-[#1F2933]">
        {value || "Ask"}
      </p>
    </div>
  );
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

function getNearbyText(listing) {
  if (
    Array.isArray(listing.nearbyInstitutions) &&
    listing.nearbyInstitutions.length > 0
  ) {
    return listing.nearbyInstitutions.join(", ");
  }

  return listing.nearbyInstitutionText || listing.nearbyCollege || "";
}

export default ListingCard;