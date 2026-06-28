import { Link } from "react-router";
import { Heart, MessageCircle, Phone, X } from "lucide-react";
import {
  buildStudentLoginUrl,
  getCurrentReturnPath,
} from "../../utils/loginRedirect";

function StudentActionLoginPrompt({ listing, action = "continue", onClose }) {
  if (!listing) return null;

  const returnTo = getCurrentReturnPath({
    openListing: listing.id,
  });

  const actionText = {
    save: "save this stay",
    call: "call the owner",
    whatsapp: "message the owner",
    map: "open the location",
    review: "write a review",
    continue: "continue",
  };

  const loginUrl = buildStudentLoginUrl({
    returnTo,
    action,
    listingId: listing.id,
  });

  return (
    <div className="fixed inset-0 z-[999] flex items-end justify-center bg-[#070B1F]/45 px-3 pb-3 sm:items-center sm:p-4">
      <div className="w-full max-w-md overflow-hidden rounded-[1.8rem] border border-[#E8DFD2] bg-white shadow-2xl">
        <div className="border-b border-[#E8DFD2] bg-[#FFF8EF] px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#1E5B4F]">
                Student login
              </p>

              <h2 className="mt-1 text-xl font-extrabold leading-tight text-[#070B1F]">
                Sign in to {actionText[action] || "continue"}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#E8DFD2] bg-white text-slate-500 transition hover:bg-[#F6F1E8]"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="px-5 py-5">
          <div className="rounded-[1.4rem] border border-[#E8DFD2] bg-[#FFF8EF] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="line-clamp-1 text-base font-extrabold text-[#1F2933]">
                  {listing.name}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {listing.area} · ₹{listing.startingRent || listing.rent || 0} starts
                </p>
              </div>

              {listing.verified && (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  Verified
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-[#F6F1E8] p-3">
              <Heart className="mx-auto text-[#1E5B4F]" size={18} />
              <p className="mt-2 text-xs font-bold text-slate-700">Save</p>
            </div>

            <div className="rounded-2xl bg-[#F6F1E8] p-3">
              <Phone className="mx-auto text-[#1E5B4F]" size={18} />
              <p className="mt-2 text-xs font-bold text-slate-700">Call</p>
            </div>

            <div className="rounded-2xl bg-[#F6F1E8] p-3">
              <MessageCircle className="mx-auto text-[#1E5B4F]" size={18} />
              <p className="mt-2 text-xs font-bold text-slate-700">WhatsApp</p>
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-500">
            Login helps you save PGs, contact owners, and get better stay
            suggestions based on your preferences.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-[#E8DFD2] bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-[#F6F1E8]"
            >
              Not now
            </button>

            <Link
              to={loginUrl}
              className="rounded-2xl bg-[#1E5B4F] px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-[#123C35]"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentActionLoginPrompt;