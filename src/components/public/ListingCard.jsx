import Badge from "../common/Badge";
import SaveListingButton from "../student/SaveListingButton";

function ListingCard({ listing, onViewDetails }) {
  const image = listing.images?.[0] || "";
  const rent = listing.startingRent || listing.rent || 0;

  return (
    <article className="overflow-hidden rounded-[1.5rem] border border-[#E8DFD2] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:rounded-[2rem]">
      <div className="relative aspect-[4/3] bg-[#F6F1E8]">
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

        {listing.verified && (
          <span className="absolute left-3 top-3 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            Verified
          </span>
        )}
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="line-clamp-1 text-lg font-extrabold text-[#1F2933]">
              {listing.name}
            </h3>
            <p className="mt-1 line-clamp-1 text-sm text-slate-500">
              {listing.area} · {listing.distance}
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

          {listing.food && (
            <span className="rounded-full bg-[#F6F1E8] px-3 py-1 text-xs font-bold text-slate-600">
              Food Included
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onViewDetails}
            className="rounded-2xl bg-[#1E5B4F] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#123C35]"
          >
            View details
          </button>

          <SaveListingButton listing={listing} />
        </div>
      </div>
    </article>
  );
}

export default ListingCard;