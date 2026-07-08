import { Link } from "react-router";
import { Lock, MessageCircle, Phone } from "lucide-react";
import { useAuthUser } from "../../hooks/useAuthUser";

function cleanPhoneNumber(phone) {
  return String(phone || "").replace(/\D/g, "");
}

function getWhatsappLink(phone, listingName) {
  const cleanPhone = cleanPhoneNumber(phone);
  const message = encodeURIComponent(
    `Hi, I found your listing "${listingName}" on CampusStay. Is it still available?`
  );

  return `https://wa.me/91${cleanPhone}?text=${message}`;
}

function ProtectedContactActions({ listing }) {
  const { isSignedIn, checkingAuth } = useAuthUser();

  if (checkingAuth) {
    return (
      <div className="rounded-2xl border border-[#E8DFD2] bg-[#F6F1E8] px-4 py-3 text-sm font-semibold text-slate-500">
        Checking sign-in...
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="rounded-2xl border border-[#E8DFD2] bg-[#FFF8EF] p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#1E5B4F] text-white">
            <Lock size={18} />
          </div>

          <div>
            <p className="text-sm font-extrabold text-[#1F2933]">
              Sign in to view owner contact
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Phone number and WhatsApp contact are visible only after sign in.
            </p>

            <Link
              to="/student/login"
              className="mt-3 inline-flex rounded-2xl bg-[#1E5B4F] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#123C35]"
            >
              Sign in to view
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const phone = cleanPhoneNumber(listing.phone);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <a
        href={`tel:${phone}`}
        className="flex items-center justify-center gap-2 rounded-2xl bg-[#1E5B4F] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#123C35]"
      >
        <Phone size={17} />
        Call Owner
      </a>

      <a
        href={getWhatsappLink(listing.phone, listing.name)}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
      >
        <MessageCircle size={17} />
        WhatsApp
      </a>

      <div className="sm:col-span-2 rounded-2xl border border-[#E8DFD2] bg-white px-4 py-3 text-sm">
        <span className="font-semibold text-slate-500">Phone: </span>
        <span className="font-extrabold text-[#1F2933]">{listing.phone}</span>
      </div>
    </div>
  );
}

export default ProtectedContactActions;
