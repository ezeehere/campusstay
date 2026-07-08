import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  AlertTriangle,
  BedDouble,
  CalendarDays,
  IndianRupee,
  Loader2,
  MapPin,
  ShieldCheck,
  Utensils,
  User,
} from "lucide-react";

import Badge from "../../components/common/Badge";
import StudentActionLoginPrompt from "../../components/student/StudentActionLoginPrompt";
import ProtectedContactActions from "../../components/public/ProtectedContactActions";

import { getListingById } from "../../firebase/listings";
import { submitListingReport } from "../../firebase/reports";
import { trackListingInteraction } from "../../firebase/analytics";
import { createStudentLead } from "../../firebase/studentLeads";
import { auth } from "../../firebase/config";
import { createWhatsAppLink } from "../../utils/whatsapp";
import { getNearbyText, getTotalSeatsLeft } from "../../utils/listingHelpers";
import { useSwipeCarousel } from "../../hooks/useSwipeCarousel";

import ListingDetailsHeader from "../../features/listingDetails/components/ListingDetailsHeader";
import ListingImageGallery from "../../features/listingDetails/components/ListingImageGallery";
import ListingRoomOptions from "../../features/listingDetails/components/ListingRoomOptions";
import ListingFacilitiesSection from "../../features/listingDetails/components/ListingFacilitiesSection";
import ListingEssentialsSection from "../../features/listingDetails/components/ListingEssentialsSection";
import ListingRulesSection from "../../features/listingDetails/components/ListingRulesSection";
import ListingContactSection from "../../features/listingDetails/components/ListingContactSection";
import ListingReportSection from "../../features/listingDetails/components/ListingReportSection";
import ListingBottomActionBar from "../../features/listingDetails/components/ListingBottomActionBar";

function ListingDetailsPage() {
  const { listingId } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notLive, setNotLive] = useState(false);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loginAction, setLoginAction] = useState("");

  const [callbackLoading, setCallbackLoading] = useState(false);
  const [callbackSent, setCallbackSent] = useState(false);

  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState("Wrong information");
  const [reportMessage, setReportMessage] = useState("");
  const [reporterPhone, setReporterPhone] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  useEffect(() => {
    async function loadListing() {
      try {
        setLoading(true);

        const data = await getListingById(listingId);

        if (!data || data.approved !== true) {
          setNotLive(true);
          return;
        }

        setListing(data);
        setActiveImageIndex(0);

        trackListingInteraction("view_details", data, "views").catch(
          (error) => {
            console.error("View analytics failed:", error);
          }
        );
      } catch (error) {
        console.error(error);
        setNotLive(true);
      } finally {
        setLoading(false);
      }
    }

    loadListing();
  }, [listingId]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFF8EF] px-4">
        <div className="rounded-[2rem] border border-[#E8DFD2] bg-white p-6 text-center shadow-sm">
          <Loader2 className="mx-auto animate-spin text-[#1E5B4F]" size={30} />
          <p className="mt-3 text-sm font-bold text-slate-600">
            Loading PG details...
          </p>
        </div>
      </main>
    );
  }

  if (notLive || !listing) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFF8EF] px-4">
        <div className="max-w-md rounded-[2rem] border border-[#E8DFD2] bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-black uppercase tracking-wide text-[#1E5B4F]">
            CampusStay
          </p>

          <h1 className="mt-3 text-2xl font-black text-slate-950">
            This listing is not live
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            This PG/room may be pending approval, removed, or unavailable
            publicly right now.
          </p>

          <Link
            to="/"
            className="mt-5 inline-flex rounded-2xl bg-[#1E5B4F] px-5 py-3 text-sm font-black text-white"
          >
            Browse live listings
          </Link>
        </div>
      </main>
    );
  }

  const fallbackImage =
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=900&auto=format&fit=crop";

  const images = listing.images?.length ? listing.images : [fallbackImage];
  const activeImage = images[activeImageIndex] || images[0];
  const swipeHandlers = useSwipeCarousel(images, activeImageIndex, setActiveImageIndex);

  const primaryContactPerson = listing.contactPerson || "Owner";
  const alternatePhone = listing.alternatePhone || "";
  const alternateContactPerson = listing.alternateContactPerson || "Caretaker";

  const nearbyText = getNearbyText(listing);
  const rent = listing.startingRent || listing.rent || 0;
  const seatsLeft = getTotalSeatsLeft(listing);
  const foodIncluded = listing.foodIncluded === true || listing.food === true;
  const whatsappLink = createWhatsAppLink(listing.phone, listing.name);
  const mapLink = listing.mapLink || "https://maps.google.com";
  const pgNote = String(listing.pgNote || "").trim();

  function handleAnalyticsClick(eventType, metricKey) {
    trackListingInteraction(eventType, listing, metricKey).catch((error) => {
      console.error("Analytics click failed:", error);
    });
  }

  function requireStudentLogin(action) {
    if (auth.currentUser) return false;

    setLoginAction(action);
    return true;
  }

  async function handleRequestCallback() {
    if (requireStudentLogin("callback")) return;

    const confirmShare = window.confirm(
      "Share your contact details with this PG/room owner so they can contact you about this listing?"
    );

    if (!confirmShare) return;

    try {
      setCallbackLoading(true);

      const result = await createStudentLead(listing);

      await trackListingInteraction(
        "callback_request",
        listing,
        "callbackRequests"
      ).catch((error) => {
        console.error("Callback analytics failed:", error);
      });

      setCallbackSent(true);

      if (result.alreadyExists) {
        alert("You already requested a callback for this listing.");
        return;
      }

      alert("Callback request sent. The owner can contact you now.");
    } catch (error) {
      console.error(error);
      alert(error.message || "Could not request callback.");
    } finally {
      setCallbackLoading(false);
    }
  }

  async function handleSubmitReport(event) {
    event.preventDefault();

    if (!reportMessage.trim()) {
      alert("Please explain the issue.");
      return;
    }

    try {
      setReportSubmitting(true);

      await submitListingReport({
        listingId: listing.id,
        listingName: listing.name || "",
        ownerPhone: listing.phone || "",
        reason: reportReason,
        message: reportMessage.trim(),
        reporterPhone: reporterPhone.trim(),
      });

      setReportSuccess(true);
      setReportMessage("");
      setReporterPhone("");
    } catch (error) {
      console.error("Report submit error:", error);
      alert("Could not submit report. Please try again.");
    } finally {
      setReportSubmitting(false);
    }
  }



  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FFF8EF] via-white to-[#F6F1E8] pb-28 text-slate-950">
      <ListingDetailsHeader listing={listing} />

      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-5">
          <div className="flex flex-wrap gap-2">
            {listing.verified ? (
              <Badge type="verified">
                <ShieldCheck size={13} />
                {listing.verificationLevel || "Verified"}
              </Badge>
            ) : (
              <Badge type="warning">
                <AlertTriangle size={13} />
                {listing.verificationLevel || "Not verified"}
              </Badge>
            )}

            {listing.available ? (
              <Badge type="dark">Available</Badge>
            ) : (
              <Badge>Currently full</Badge>
            )}

            <Badge>{listing.gender}</Badge>
            <Badge type="soft">{listing.type}</Badge>
          </div>

          <h1 className="mt-3 max-w-4xl text-3xl font-black leading-tight tracking-tight text-[#070B1F] sm:text-5xl">
            {listing.name || "Unnamed stay"}
          </h1>

          <p className="mt-2 flex flex-wrap items-center gap-1 text-sm font-semibold text-slate-500 sm:text-base">
            <MapPin size={17} />
            {listing.area || "Area not added"}
            {nearbyText ? ` · Near ${nearbyText}` : ""}
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <ListingImageGallery
            listing={listing}
            images={images}
            activeImageIndex={activeImageIndex}
            setActiveImageIndex={setActiveImageIndex}
            swipeHandlers={swipeHandlers}
            pgNote={pgNote}
          />

          <aside className="h-fit rounded-[2rem] border border-[#E8DFD2] bg-white p-4 shadow-sm sm:p-5 lg:sticky lg:top-24">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">
              Quick stay summary
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <SummaryBox
                label="Monthly rent"
                value={`₹${rent}`}
                icon={<IndianRupee size={18} />}
              />

              <SummaryBox
                label="Advance"
                value={`₹${listing.deposit || 0}`}
                icon={<IndianRupee size={18} />}
              />

              <SummaryBox
                label="Seats"
                value={seatsLeft > 0 ? `${seatsLeft} left` : "Full"}
                icon={<BedDouble size={18} />}
              />

              <SummaryBox
                label="Food"
                value={foodIncluded ? "Included" : "Not included"}
                icon={<Utensils size={18} />}
              />

              <SummaryBox
                label="Move-in"
                value={listing.moveInNote || listing.availableFrom || "Ask"}
                icon={<CalendarDays size={18} />}
              />

              <SummaryBox
                label="Owner"
                value={listing.ownerName || "Not added"}
                icon={<User size={18} />}
              />
            </div>

            {pgNote && (
              <div className="mt-4 rounded-3xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-amber-700">
                  PG note
                </p>
                <p className="mt-1 text-sm font-bold leading-6 text-amber-900">
                  {pgNote}
                </p>
              </div>
            )}

            <div className="mt-4">
              <ProtectedContactActions listing={listing} />
            </div>
          </aside>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <ListingRoomOptions listing={listing} />
            <ListingRulesSection listing={listing} />
          </div>

          <div className="space-y-5">
            <ListingFacilitiesSection listing={listing} foodIncluded={foodIncluded} />
            <ListingEssentialsSection listing={listing} />
            <ListingContactSection
              listing={listing}
              mapLink={mapLink}
              requireStudentLogin={requireStudentLogin}
              handleAnalyticsClick={handleAnalyticsClick}
            />
          </div>
        </div>

        <ListingReportSection
          showReportForm={showReportForm}
          setShowReportForm={setShowReportForm}
          reportSuccess={reportSuccess}
          setReportSuccess={setReportSuccess}
          reportReason={reportReason}
          setReportReason={setReportReason}
          reporterPhone={reporterPhone}
          setReporterPhone={setReporterPhone}
          reportMessage={reportMessage}
          setReportMessage={setReportMessage}
          reportSubmitting={reportSubmitting}
          handleSubmitReport={handleSubmitReport}
        />
      </section>

      <ListingBottomActionBar
        listing={listing}
        whatsappLink={whatsappLink}
        mapLink={mapLink}
        handleRequestCallback={handleRequestCallback}
        callbackLoading={callbackLoading}
        callbackSent={callbackSent}
        requireStudentLogin={requireStudentLogin}
        handleAnalyticsClick={handleAnalyticsClick}
        setShowReportForm={setShowReportForm}
      />

      {loginAction && (
        <StudentActionLoginPrompt
          listing={listing}
          action={loginAction}
          onClose={() => setLoginAction("")}
        />
      )}
    </main>
  );
}

function SummaryBox({ icon, label, value }) {
  return (
    <div className="rounded-3xl bg-[#FFF8EF] p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500">
        {icon}
        {label}
      </div>
      <p className="line-clamp-2 text-sm font-black text-[#1F2933]">
        {value || "Ask"}
      </p>
    </div>
  );
}

export default ListingDetailsPage;
