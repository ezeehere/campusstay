import { Link } from "react-router";
import {
  Heart,
  Lock,
  MapPin,
  MessageCircle,
  Phone,
  Star,
  UserRound,
  X,
} from "lucide-react";
import {
  buildStudentLoginUrl,
  getCurrentReturnPath,
} from "../../utils/loginRedirect";

const actionConfig = {
  save: {
    text: "save this stay",
    description:
      "Sign in to save this PG and view it later from your student dashboard.",
    icon: Heart,
  },
  call: {
    text: "call the owner",
    description:
      "Sign in to view the owner contact number and call directly.",
    icon: Phone,
  },
  whatsapp: {
    text: "message the owner",
    description:
      "Sign in to view WhatsApp contact and message the owner directly.",
    icon: MessageCircle,
  },
  map: {
    text: "open the location",
    description:
      "Sign in to view the location details and map link.",
    icon: MapPin,
  },
  review: {
    text: "write a review",
    description:
      "Sign in to share your feedback and help other students.",
    icon: Star,
  },
  callback: {
    text: "request owner callback",
    description:
      "Sign in to request a callback from the owner.",
    icon: Phone,
  },
  continue: {
    text: "continue",
    description:
      "Sign in to continue using student features on CampusStay.",
    icon: UserRound,
  },
};

function StudentActionLoginPrompt({ listing, action = "continue", onClose }) {
  if (!listing) return null;

  const config = actionConfig[action] || actionConfig.continue;
  const ActionIcon = config.icon;

  const returnTo = getCurrentReturnPath({
    openListing: listing.id,
  });

  const loginUrl = buildStudentLoginUrl({
    returnTo,
    action,
    listingId: listing.id,
  });

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-[#070B1F]/55 px-4 py-6">
      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-[#E8DFD2] bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#E8DFD2] bg-white text-slate-500 transition hover:bg-[#F6F1E8]"
          aria-label="Close login prompt"
        >
          <X size={18} />
        </button>

        <div className="bg-[#FFF8EF] px-5 pb-5 pt-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1E5B4F] text-white">
            <ActionIcon size={22} />
          </div>

          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-[#1E5B4F]">
            Student login required
          </p>

          <h2 className="mt-1 pr-12 text-2xl font-extrabold leading-tight text-[#070B1F]">
            Sign in to {config.text}
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            {config.description}
          </p>
        </div>

        <div className="px-5 py-5">
          <div className="rounded-[1.4rem] border border-[#E8DFD2] bg-[#FFF8EF] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-base font-extrabold text-[#1F2933]">
                  {listing.name}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {listing.area} · ₹
                  {listing.startingRent || listing.rent || 0} starts
                </p>
              </div>

              {listing.verified && (
                <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  Verified
                </span>
              )}
            </div>
          </div>

          <div className="mt-5 rounded-[1.4rem] border border-[#E8DFD2] bg-white p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#F6F1E8] text-[#1E5B4F]">
                <Lock size={18} />
              </div>

              <div>
                <p className="text-sm font-extrabold text-[#1F2933]">
                  Why sign in?
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Login helps students save stays, contact owners, and get
                  better stay suggestions based on their preferences.
                </p>
              </div>
            </div>
          </div>

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