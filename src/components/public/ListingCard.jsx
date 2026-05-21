import {
  AlertTriangle,
  BedDouble,
  Home as HomeIcon,
  IndianRupee,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Utensils,
  CalendarDays,
} from "lucide-react";

import Badge from "../common/Badge";
import { createWhatsAppLink } from "../../utils/whatsapp";

function ListingCard({ listing, onViewDetails }) {
  const whatsappLink = createWhatsAppLink(listing.phone, listing.name);
  const startingRent = listing.startingRent || listing.rent || 0;

const roomSummary =
  listing.roomOptions?.length > 0
    ? listing.roomOptions.map((room) => room.title).join(", ")
    : listing.roomType || "Room options";
  const coverImage =
  listing.images?.[0] ||
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=600&auto=format&fit=crop";

  return (
    <article className="overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-44 overflow-hidden bg-slate-100">
        <img
            src={coverImage}
            alt={listing.name}
            className="h-full w-full object-cover"
        />

        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/70 to-transparent" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {listing.verified ? (
            <Badge type="verified">
              <ShieldCheck size={13} />
              Verified
            </Badge>
          ) : (
            <Badge type="warning">
              <AlertTriangle size={13} />
              Not verified
            </Badge>
          )}

          {listing.available ? (
            <Badge type="dark">Available</Badge>
          ) : (
            <Badge>Full</Badge>
          )}
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3 text-white">
          <div>
            <p className="text-xs font-medium text-white/80">
              {listing.type} for {listing.gender}
            </p>
            <h3 className="line-clamp-1 text-lg font-black">
              {listing.name}
            </h3>
          </div>

          <div className="rounded-2xl bg-white/95 px-3 py-2 text-right text-slate-950">
            <p className="flex items-center justify-end text-sm font-extrabold">
  <IndianRupee size={14} />
  {startingRent}
</p>
<p className="text-[11px] text-slate-500">starts</p>
            <p className="text-[11px] text-slate-500">month</p>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-4 grid gap-3">
          <p className="flex items-start gap-2 text-sm text-slate-600">
            <MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" />
            <span>
              <span className="font-semibold text-slate-800">
                {listing.area}
              </span>
              <span className="text-slate-400"> · </span>
              {listing.distance}
            </span>
          </p>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-slate-50 px-3 py-3">
              <p className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <BedDouble size={14} />
                Room type
              </p>
              <p className="mt-1 text-sm font-bold text-slate-900">
                {roomSummary}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 px-3 py-3">
              <p className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <Utensils size={14} />
                Food
              </p>
              <p className="mt-1 text-sm font-bold text-slate-900">
                {listing.food ? "Included" : "Not included"}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <Badge type="soft">
            <HomeIcon size={13} />
            {listing.type}
          </Badge>

          <Badge>{listing.gender}</Badge>

          {listing.facilities.slice(0, 3).map((item) => (
            <span
              key={item}
              className="rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
            >
              {item}
            </span>
          ))}
        </div>

        <div className="mb-5 flex items-center gap-2 text-xs text-slate-500">
          <CalendarDays size={14} />
          Last updated: {listing.lastUpdated}
        </div>

        <button
          onClick={() => onViewDetails(listing)}
          className="mb-3 w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          View full details
        </button>

        <div className="grid grid-cols-2 gap-3">
          <a
            href={`tel:${listing.phone}`}
            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            <Phone size={16} />
            Call
          </a>

          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            <MessageCircle size={16} />
            WhatsApp
          </a>

          
        </div>
      </div>
    </article>
  );
}

export default ListingCard;