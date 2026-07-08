import { Link } from "react-router";
import {
  Phone,
  MessageCircle,
  MapPin,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { auth } from "../../../firebase/config";
import SaveListingButton from "../../../components/student/SaveListingButton";

export default function ListingBottomActionBar({
  listing,
  whatsappLink,
  mapLink,
  handleRequestCallback,
  callbackLoading,
  callbackSent,
  requireStudentLogin,
  handleAnalyticsClick,
  setShowReportForm,
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="mx-auto grid max-w-5xl grid-cols-4 gap-2 sm:grid-cols-6">
        <SaveListingButton listing={listing} showText={false} />

        {auth.currentUser ? (
          <>
            <a
              href={`tel:${listing.phone}`}
              onClick={() => handleAnalyticsClick("call_click", "callClicks")}
              className="inline-flex flex-col items-center justify-center gap-1 rounded-2xl bg-[#1E5B4F] px-2 py-2.5 text-xs font-black text-white"
            >
              <Phone size={16} />
              Call
            </a>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              onClick={() => handleAnalyticsClick("whatsapp_click", "whatsappClicks")}
              className="inline-flex flex-col items-center justify-center gap-1 rounded-2xl border border-[#E8DFD2] bg-white px-2 py-2.5 text-xs font-black text-slate-700"
            >
              <MessageCircle size={16} />
              WhatsApp
            </a>
          </>
        ) : (
          <Link
            to="/student/login"
            className="col-span-2 inline-flex items-center justify-center gap-1 rounded-2xl bg-[#1E5B4F] px-2 py-2.5 text-xs font-black text-white"
          >
            Sign in to view contact
          </Link>
        )}

        <button
          type="button"
          onClick={handleRequestCallback}
          disabled={callbackLoading || callbackSent}
          className="inline-flex flex-col items-center justify-center gap-1 rounded-2xl border border-[#DDECE7] bg-[#F1FAF7] px-2 py-2.5 text-xs font-black text-[#1E5B4F] disabled:opacity-60"
        >
          {callbackLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : callbackSent ? (
            <CheckCircle2 size={16} />
          ) : (
            <Phone size={16} />
          )}
          {callbackSent ? "Done" : "Callback"}
        </button>

        <a
          href={auth.currentUser ? mapLink : undefined}
          target={auth.currentUser ? "_blank" : undefined}
          rel={auth.currentUser ? "noreferrer" : undefined}
          onClick={(event) => {
            if (requireStudentLogin("map")) {
              event.preventDefault();
              return;
            }

            handleAnalyticsClick("map_click", "mapClicks");
          }}
          className="hidden flex-col items-center justify-center gap-1 rounded-2xl border border-[#E8DFD2] bg-white px-2 py-2.5 text-xs font-black text-slate-700 sm:inline-flex"
        >
          <MapPin size={16} />
          Map
        </a>

        <button
          type="button"
          onClick={() => setShowReportForm(true)}
          className="hidden rounded-2xl bg-red-50 px-2 py-2.5 text-xs font-black text-red-700 sm:block"
        >
          Report
        </button>
      </div>
    </div>
  );
}
