import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  AlertTriangle,
  ArrowLeft,
  BedDouble,
  CalendarDays,
  CheckCircle2,
  IndianRupee,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Utensils,
  User,
} from "lucide-react";

import Badge from "../../components/common/Badge";
import SaveListingButton from "../../components/student/SaveListingButton";
import ShareListingButton from "../../components/shared/ShareListingButton";
import StudentActionLoginPrompt from "../../components/student/StudentActionLoginPrompt";
import ProtectedContactActions from "../../components/public/ProtectedContactActions";

import { getListingById } from "../../firebase/listings";
import { submitListingReport } from "../../firebase/reports";
import { trackListingInteraction } from "../../firebase/analytics";
import { createStudentLead } from "../../firebase/studentLeads";
import { auth } from "../../firebase/config";
import { createWhatsAppLink } from "../../utils/whatsapp";
import { getCloudinaryOptimizedUrl } from "../../utils/cloudinaryImage";
import { getNearbyText, getTotalSeatsLeft } from "../../utils/listingHelpers";
import { useSwipeCarousel } from "../../hooks/useSwipeCarousel";

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
      <header className="sticky top-0 z-40 border-b border-[#E8DFD2] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-2xl border border-[#E8DFD2] bg-white px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-[#F6F1E8]"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <Link
            to="/"
            className="text-lg font-black tracking-tight text-[#070B1F]"
          >
            CampusStay
          </Link>

          <ShareListingButton listing={listing} />
        </div>
      </header>

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
          <div className="space-y-3">
            <div
              className="relative flex aspect-[4/3] w-full touch-pan-y items-center justify-center overflow-hidden rounded-[1.8rem] border border-[#E8DFD2] bg-[#F6F1E8] sm:aspect-[16/10]"
              onTouchStart={swipeHandlers.onTouchStart}
              onTouchMove={swipeHandlers.onTouchMove}
              onTouchEnd={swipeHandlers.onTouchEnd}
            >
              <img
                src={getCloudinaryOptimizedUrl(activeImage, {
                  width: 1200,
                  crop: "limit",
                  quality: "auto:good",
                })}
                alt={listing.name}
                loading="lazy"
                decoding="async"
                className="max-h-full max-w-full object-contain"
              />

              {images.length > 1 && (
                <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white">
                  {activeImageIndex + 1}/{images.length}
                </div>
              )}

              {pgNote && (
                <div className="absolute left-3 top-3 max-w-[80%] rounded-2xl bg-[#FFF3D6]/95 px-4 py-2 text-sm font-black text-[#92400E] shadow-sm backdrop-blur">
                  {pgNote}
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    className={`h-16 w-20 shrink-0 overflow-hidden rounded-2xl border-2 bg-[#F6F1E8] transition sm:h-20 sm:w-28 ${
                      activeImageIndex === index
                        ? "border-[#1E5B4F]"
                        : "border-[#E8DFD2] opacity-75 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={getCloudinaryOptimizedUrl(image, {
                        width: 180,
                        height: 120,
                        crop: "fill",
                        quality: "auto:eco",
                      })}
                      alt={`${listing.name} ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

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
            <SectionCard title="Room options">
              <div className="grid gap-3">
                {(listing.roomOptions || []).length > 0 ? (
                  listing.roomOptions.map((room) => (
                    <div
                      key={room.id || room.title}
                      className="rounded-3xl border border-[#E8DFD2] bg-[#FFF8EF] p-4"
                    >
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                        <div>
                          <h3 className="font-black text-[#1F2933]">
                            {room.title}
                          </h3>

                          <p className="mt-1 text-sm font-semibold text-slate-600">
                            Seats left: {room.availableUnits || 0}
                          </p>

                          {room.note && (
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                              {room.note}
                            </p>
                          )}
                        </div>

                        <div className="rounded-2xl bg-white px-4 py-3 text-right shadow-sm">
                          <p className="text-lg font-black text-[#1F2933]">
                            ₹{room.rent}
                          </p>
                          <p className="text-xs text-slate-500">per month</p>
                        </div>
                      </div>

                      <div className="mt-3 rounded-2xl bg-white px-3 py-2 text-sm font-bold text-slate-700">
                        Advance: ₹{room.deposit || 0}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    No room options added.
                  </p>
                )}
              </div>
            </SectionCard>

            <SectionCard title="Charges">
              <div className="grid gap-2 text-sm">
                <DetailRow
                  label="Electricity"
                  value={
                    listing.electricityIncluded
                      ? "Included"
                      : `₹${listing.electricityCharge || 0}`
                  }
                />
                <DetailRow
                  label="Other charges"
                  value={listing.otherCharges || "Not added"}
                />
              </div>
            </SectionCard>

            {listing.structuredRules && (
              <SectionCard title="Rules and safety">
                <div className="grid gap-2 text-sm">
                  <DetailRow
                    label="Entry time"
                    value={listing.structuredRules.entryTime}
                  />
                  <DetailRow
                    label="Visitors"
                    value={listing.structuredRules.visitorsAllowed}
                  />
                  <DetailRow
                    label="Parents"
                    value={listing.structuredRules.parentsAllowed}
                  />
                  <DetailRow
                    label="Smoking"
                    value={listing.structuredRules.smokingAllowed}
                  />
                  <DetailRow
                    label="Gents"
                    value={listing.structuredRules.gentsAllowed}
                  />
                  <DetailRow
                    label="Girls"
                    value={listing.structuredRules.girlsAllowed}
                  />
                  <DetailRow
                    label="ID proof"
                    value={listing.structuredRules.idProofRequired}
                  />
                </div>
              </SectionCard>
            )}
          </div>

          <div className="space-y-5">
            <SectionCard title="Food details">
              <p className="text-sm leading-6 text-slate-600">
                {listing.foodDetails ||
                  (foodIncluded ? "Food included" : "Food not included")}
              </p>
            </SectionCard>

            <SectionCard title="Facilities">
              {(listing.facilities || []).length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {listing.facilities.map((facility) => (
                    <span
                      key={facility}
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-700"
                    >
                      {facility}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No facilities added.</p>
              )}
            </SectionCard>

            {Array.isArray(listing.nearbyEssentials) &&
              listing.nearbyEssentials.length > 0 && (
                <SectionCard title="Nearby essentials">
                  <div className="flex flex-wrap gap-2">
                    {listing.nearbyEssentials.map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-700"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </SectionCard>
              )}

            <SectionCard title="Contact numbers">
              <ProtectedContactActions listing={listing} />
            </SectionCard>

            <SectionCard title="Location">
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
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#E8DFD2] bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-[#F6F1E8]"
              >
                <MapPin size={16} />
                Open Google Map
              </a>
            </SectionCard>

            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm leading-6 text-amber-800">
                CampusStay helps students find PGs and rooms. Please visit the
                place and verify all details before making any payment.
              </p>
            </div>
          </div>
        </div>

        {showReportForm && (
          <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-4">
            {reportSuccess ? (
              <div>
                <h3 className="text-lg font-black text-red-900">
                  Report submitted
                </h3>

                <p className="mt-2 text-sm leading-6 text-red-700">
                  Thanks for reporting this listing. The admin will check it.
                </p>

                <button
                  onClick={() => {
                    setShowReportForm(false);
                    setReportSuccess(false);
                  }}
                  className="mt-4 rounded-2xl bg-white px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100"
                >
                  Close report
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport}>
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <h3 className="text-lg font-black text-red-900">
                      Report wrong information
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-red-700">
                      Tell us what is wrong with this listing so the admin can
                      review it.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowReportForm(false)}
                    className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100"
                  >
                    Cancel
                  </button>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-red-900">
                      Reason
                    </label>

                    <select
                      value={reportReason}
                      onChange={(event) =>
                        setReportReason(event.target.value)
                      }
                      className="h-12 w-full rounded-2xl border border-red-200 bg-white px-4 text-sm outline-none"
                    >
                      <option>Wrong information</option>
                      <option>Wrong phone number</option>
                      <option>Fake listing</option>
                      <option>Rent is different</option>
                      <option>Location is wrong</option>
                      <option>Already full</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-red-900">
                      Your phone number optional
                    </label>

                    <input
                      value={reporterPhone}
                      onChange={(event) => setReporterPhone(event.target.value)}
                      placeholder="Only if admin needs to contact you"
                      className="h-12 w-full rounded-2xl border border-red-200 bg-white px-4 text-sm outline-none"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="mb-2 block text-sm font-bold text-red-900">
                    Explain the issue
                  </label>

                  <textarea
                    value={reportMessage}
                    onChange={(event) => setReportMessage(event.target.value)}
                    rows="4"
                    placeholder="Example: The owner said rent is ₹6000 but listing shows ₹4500."
                    className="w-full rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm outline-none"
                  />
                </div>

                <button
                  disabled={reportSubmitting}
                  className="mt-4 rounded-2xl bg-red-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {reportSubmitting ? "Submitting..." : "Submit report"}
                </button>
              </form>
            )}
          </div>
        )}
      </section>

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
            onClick={() => setShowReportForm(true)}
            className="hidden rounded-2xl bg-red-50 px-2 py-2.5 text-xs font-black text-red-700 sm:block"
          >
            Report
          </button>
        </div>
      </div>

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

function SectionCard({ title, children }) {
  return (
    <section className="rounded-[2rem] border border-[#E8DFD2] bg-white p-4 shadow-sm sm:p-5">
      <h2 className="text-lg font-black text-[#070B1F]">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
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

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-bold text-slate-800">
        {value || "Not added"}
      </span>
    </div>
  );
}

function ContactRow({ label, phone, onClick }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
      <span className="text-slate-500">{label}</span>
      <a
        href={auth.currentUser ? `tel:${phone}` : undefined}
        onClick={onClick}
        className="font-black text-[#1E5B4F]"
      >
        {phone || "Not added"}
      </a>
    </div>
  );
}

// Local helper duplicates replaced by imports from listingHelpers

export default ListingDetailsPage;
