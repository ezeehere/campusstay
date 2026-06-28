import {
  BedDouble,
  CalendarDays,
  MapPin,
  Utensils,
} from "lucide-react";
import SaveListingButton from "../student/SaveListingButton";

function ListingCard({ listing, onViewDetails }) {
  const image = listing.images?.[0] || "";
  const rent = listing.startingRent || listing.rent || 0;

  const roomTypeText =
    listing.roomType ||
    (listing.roomOptions?.length
      ? listing.roomOptions.map((item) => item.title).join(", ")
      : "Room details available");

  const foodText = listing.foodIncluded
    ? listing.foodDetails || "Included"
    : "Not included";

  const chips = [
    listing.type,
    listing.gender,
    ...(listing.facilities || []).slice(0, 3),
  ].filter(Boolean);

  const formattedDate = formatListingDate(listing.updatedAt || listing.createdAt);

  return (
    <article className="overflow-hidden rounded-[1.9rem] border border-[#E8DFD2] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      {/* Image section */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#F6F1E8] sm:aspect-[4/3]">
        {image ? (
          <img
            src={image}
            alt={listing.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-bold text-slate-400">
            No image available
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

        {/* Top badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {listing.verified && (
            <span className="rounded-full bg-[#E9FFF4] px-3 py-1 text-xs font-bold text-[#16845A]">
              Verified
            </span>
          )}

          {listing.available && (
            <span className="rounded-full bg-[#1E5B4F] px-3 py-1 text-xs font-bold text-white">
              Available
            </span>
          )}
        </div>

        {/* Rent pill */}
        <div className="absolute right-3 bottom-3 rounded-[1.4rem] bg-white/95 px-4 py-3 text-right shadow-sm backdrop-blur">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
            starts
          </p>
          <p className="text-xl font-extrabold leading-none text-[#111827]">
            ₹{rent}
          </p>
          <p className="mt-1 text-xs text-slate-500">month</p>
        </div>

        {/* Name on image */}
        <div className="absolute bottom-4 left-4 right-28">
          <p className="text-xs font-medium text-white/80">
            {listing.type || "Stay"} {listing.gender ? `for ${listing.gender}` : ""}
          </p>
          <h3 className="mt-1 line-clamp-2 text-[1.65rem] font-extrabold leading-tight text-white sm:text-[1.8rem]">
            {listing.name}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        {/* Location */}
        <div className="flex items-start gap-2 text-slate-600">
          <MapPin size={18} className="mt-0.5 shrink-0 text-slate-400" />
          <p className="text-[15px] leading-6">
            <span className="font-semibold text-slate-700">{listing.area}</span>
            {listing.distance ? (
              <span className="text-slate-500"> · {listing.distance} from JIST</span>
            ) : null}
          </p>
        </div>

        {/* Info boxes */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-[1.5rem] bg-[#F8F8F8] p-4">
            <div className="flex items-center gap-2 text-slate-400">
              <BedDouble size={17} />
              <p className="text-xs font-semibold uppercase tracking-wide">
                Room type
              </p>
            </div>
            <p className="mt-2 line-clamp-3 text-[15px] font-semibold leading-6 text-[#1F2933]">
              {roomTypeText}
            </p>
          </div>

          <div className="rounded-[1.5rem] bg-[#F8F8F8] p-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Utensils size={17} />
              <p className="text-xs font-semibold uppercase tracking-wide">
                Food
              </p>
            </div>
            <p className="mt-2 line-clamp-3 text-[15px] font-semibold leading-6 text-[#1F2933]">
              {foodText}
            </p>
          </div>
        </div>

        {/* Chips */}
        {chips.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {chips.map((chip, index) => (
              <span
                key={`${chip}-${index}`}
                className="rounded-full bg-[#F6F1E8] px-3 py-1.5 text-sm font-medium text-slate-600"
              >
                {chip}
              </span>
            ))}
          </div>
        )}

        {/* Updated */}
        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
          <CalendarDays size={16} className="text-slate-400" />
          <span>Last updated: {formattedDate}</span>
        </div>

        {/* Actions */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onViewDetails}
            className="rounded-[1.25rem] bg-[#070B1F] px-4 py-3.5 text-sm font-bold text-white transition hover:opacity-95"
          >
            View full details
          </button>

          <SaveListingButton listing={listing} />
        </div>
      </div>
    </article>
  );
}

function formatListingDate(timestamp) {
  if (!timestamp) return "Recently";

  try {
    const date =
      typeof timestamp?.toDate === "function"
        ? timestamp.toDate()
        : new Date(timestamp);

    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Recently";
  }
}

export default ListingCard;