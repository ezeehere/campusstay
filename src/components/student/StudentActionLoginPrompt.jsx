import { Link } from "react-router";
import { Heart, MessageCircle, Phone, ShieldCheck, X } from "lucide-react";
import { buildStudentLoginUrl, getCurrentReturnPath } from "../../utils/loginRedirect";

function StudentActionLoginPrompt({ listing, action = "continue", onClose }) {
  if (!listing) return null;

  const returnTo = getCurrentReturnPath({
    openListing: listing.id,
  });

  const actionLabels = {
    save: "save this PG",
    call: "contact the owner",
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
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/50 px-4 py-4 sm:items-center">
      <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="w-fit rounded-full bg-[#FFF4D8] px-3 py-1 text-xs font-bold text-[#8A5A00]">
              Student login required
            </p>

            <h2 className="mt-4 text-2xl font-extrabold text-[#1F2933]">
              Sign in to {actionLabels[action] || "continue"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Create a free student account to save PGs, contact owners, get
              better matches, and write reviews later.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-[#E8DFD2] bg-white p-2 text-slate-500 transition hover:bg-[#F6F1E8]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 rounded-3xl border border-[#E8DFD2] bg-[#FFF8EF] p-4">
          <h3 className="font-extrabold text-[#1F2933]">{listing.name}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {listing.area} · Starts from ₹{listing.startingRent || listing.rent || 0}
          </p>
        </div>

        <div className="mt-5 grid gap-3">
          <div className="flex gap-3 rounded-3xl bg-[#F6F1E8] p-4">
            <Heart className="mt-0.5 text-[#1E5B4F]" size={20} />
            <div>
              <p className="text-sm font-bold text-[#1F2933]">Save and compare</p>
              <p className="mt-1 text-sm text-slate-500">
                Keep shortlisted PGs and rooms in one place.
              </p>
            </div>
          </div>

          <div className="flex gap-3 rounded-3xl bg-[#F6F1E8] p-4">
            <Phone className="mt-0.5 text-[#1E5B4F]" size={20} />
            <div>
              <p className="text-sm font-bold text-[#1F2933]">Contact owners</p>
              <p className="mt-1 text-sm text-slate-500">
                Call or WhatsApp owners after signing in.
              </p>
            </div>
          </div>

          <div className="flex gap-3 rounded-3xl bg-[#F6F1E8] p-4">
            <ShieldCheck className="mt-0.5 text-[#1E5B4F]" size={20} />
            <div>
              <p className="text-sm font-bold text-[#1F2933]">Safer activity</p>
              <p className="mt-1 text-sm text-slate-500">
                Student actions stay linked to real accounts, not random clicks.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            to={loginUrl}
            className="flex-1 rounded-2xl bg-[#1E5B4F] px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-[#123C35]"
          >
            Sign in as student
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-[#E8DFD2] bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-[#F6F1E8]"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentActionLoginPrompt;
