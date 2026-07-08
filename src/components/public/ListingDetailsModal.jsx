import { useEffect, useState } from "react";
import {
  AlertTriangle,
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
  X,
} from "lucide-react";
import { getCloudinaryOptimizedUrl } from "../../utils/cloudinaryImage";
import ProtectedContactActions from "./ProtectedContactActions";
import Badge from "../common/Badge";
import { createWhatsAppLink } from "../../utils/whatsapp";
import { submitListingReport } from "../../firebase/reports";
import SaveListingButton from "../student/SaveListingButton";
import ShareListingButton from "../shared/ShareListingButton";
import { trackListingInteraction } from "../../firebase/analytics";
import { auth } from "../../firebase/config";
import { createStudentLead } from "../../firebase/studentLeads";
import StudentActionLoginPrompt from "../student/StudentActionLoginPrompt";

function InfoBox({ icon, title, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-900">
        {icon}
        {title}
      </div>
      <p className="text-sm leading-6 text-slate-600">{value || "Not added"}</p>
    </div>
  );
}

function ListingDetailsModal({ listing, onClose }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const primaryContactPerson = listing?.contactPerson || "Owner";
  const alternatePhone = listing?.alternatePhone || "";
  const alternateContactPerson = listing?.alternateContactPerson || "Caretaker";
  // const imageCount = Array.isArray(listing?.images) ? listing.images.length : 0;

  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState("Wrong information");
  const [reportMessage, setReportMessage] = useState("");
  const [reporterPhone, setReporterPhone] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const [loginAction, setLoginAction] = useState("");

  const [callbackLoading, setCallbackLoading] = useState(false);
  const [callbackSent, setCallbackSent] = useState(false);

  useEffect(() => {
    setActiveImageIndex(0);
    setCallbackSent(false);
    setLoginAction("");
  }, [listing?.id]);



  useEffect(() => {
    if (!listing?.id) return;

    trackListingInteraction("view_details", listing, "views").catch((error) => {
      console.error("View analytics failed:", error);
    });
  }, [listing?.id]);

  if (!listing) return null;

  const whatsappLink = createWhatsAppLink(listing.phone, listing.name);

  const fallbackImage =
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=900&auto=format&fit=crop";

  const images = listing.images?.length ? listing.images : [fallbackImage];
  const activeImage = images[activeImageIndex] || images[0];

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
    if (requireStudentLogin("callback")) {
      return;
    }

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-3 py-4 backdrop-blur-sm">
      <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-[1.5rem] bg-slate-50 shadow-2xl sm:rounded-[2rem]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <h2 className="text-2xl font-black leading-tight text-slate-950">
              {listing.name}
            </h2>

            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
              <MapPin size={15} />
              {listing.area}
              {getNearbyText(listing) ? ` · Near ${getNearbyText(listing)}` : ""}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <ShareListingButton listing={listing} />

            <button
              onClick={onClose}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
              aria-label="Close details"
            >
              <X size={21} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-4 pb-28 sm:p-5">
          <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="relative flex aspect-4/3 w-full items-center justify-center overflow-hidden rounded-[1.7rem] border border-[#E8DFD2] bg-[#F6F1E8] sm:aspect-[16/10]">
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
                </div>

                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {images.map((image, index) => (
                      <button
                        key={`${image}-${index}`}
                        onClick={() => setActiveImageIndex(index)}
                        className={`h-16 w-20 shrink-0 overflow-hidden rounded-2xl border-2 bg-[#F6F1E8] transition sm:h-20 sm:w-24 ${activeImageIndex === index
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

              <div className="flex flex-wrap gap-2">
                {listing.verified ? (
                  <Badge type="verified">
                    <ShieldCheck size={13} />
                    {listing.verificationLevel || "Verified"}
                  </Badge>
                ) : (
                  <Badge type="warning">
                    <AlertTriangle size={13} />
                    {listing.verificationLevel || "Not Verified"}
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

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-3xl bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Monthly rent
                  </p>
                  <p className="mt-2 flex items-center text-2xl font-black text-slate-950">
                    <IndianRupee size={20} />
                    {listing.startingRent || listing.rent || 0}
                  </p>
                </div>

                <div className="rounded-3xl bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Advance
                  </p>
                  <p className="mt-2 flex items-center text-2xl font-black text-slate-950">
                    <IndianRupee size={20} />
                    {listing.deposit || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoBox
                  icon={<BedDouble size={18} />}
                  title="Room type"
                  value={listing.roomType}
                />

                <InfoBox
                  icon={<Utensils size={18} />}
                  title="Food"
                  value={listing.foodDetails}
                />

                <InfoBox
                  icon={<User size={18} />}
                  title="Owner"
                  value={listing.ownerName}
                />

                <InfoBox
                  icon={<CalendarDays size={18} />}
                  title="Last updated"
                  value={listing.lastUpdated}
                />
              </div>

              {listing.pgNote && (
                <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4">
                  <h3 className="text-base font-black text-amber-950">
                    PG note
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-amber-800">
                    {listing.pgNote}
                  </p>
                </div>
              )}

              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <h3 className="text-base font-extrabold text-slate-950">
                  Room options
                </h3>

                <div className="mt-3 grid gap-3">
                  {(listing.roomOptions || []).length > 0 ? (
                    listing.roomOptions.map((room) => (
                      <div
                        key={room.id || room.title}
                        className="rounded-3xl border border-[#E8DFD2] bg-[#FFF8EF] p-4"
                      >
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                          <div>
                            <h4 className="font-extrabold text-[#1F2933]">
                              {room.title}
                            </h4>

                            <p className="mt-1 text-sm text-slate-600">
                              Seats left: {room.availableUnits || 0}
                            </p>

                            {room.note && (
                              <p className="mt-2 text-sm leading-6 text-slate-600">
                                {room.note}
                              </p>
                            )}
                          </div>

                          <div className="rounded-2xl bg-white px-4 py-3 text-right shadow-sm">
                            <p className="text-lg font-extrabold text-[#1F2933]">
                              ₹{room.rent}
                            </p>
                            <p className="text-xs text-slate-500">per month</p>
                          </div>
                        </div>

                        <div className="mt-3 text-sm">
                          <div className="rounded-2xl bg-white px-3 py-2">
                            Advance: ₹{room.deposit || 0}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">
                      No room options added.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <h3 className="text-base font-black text-slate-950">
                  Move-in availability
                </h3>

                <div className="mt-3 grid gap-2 text-sm">
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    Available from:{" "}
                    <span className="font-bold">
                      {listing.availableFrom || "Ask owner"}
                    </span>
                  </div>

                  {listing.moveInNote && (
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      {listing.moveInNote}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <h3 className="text-base font-black text-slate-950">
                  Charges
                </h3>

                <div className="mt-3 grid gap-2 text-sm">
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    Electricity:{" "}
                    <span className="font-bold">
                      {listing.electricityIncluded
                        ? "Included"
                        : `₹${listing.electricityCharge || 0}`}
                    </span>
                  </div>

                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    Other charges:{" "}
                    <span className="font-bold">
                      {listing.otherCharges || "Not added"}
                    </span>
                  </div>
                </div>
              </div>

              {listing.structuredRules && (
                <div className="rounded-3xl border border-slate-200 bg-white p-4">
                  <h3 className="text-base font-black text-slate-950">
                    Rules and safety
                  </h3>

                  <div className="mt-3 grid gap-2 text-sm">
                    <RuleRow label="Entry time" value={listing.structuredRules.entryTime} />
                    <RuleRow label="Visitors" value={listing.structuredRules.visitorsAllowed} />
                    <RuleRow label="Parents" value={listing.structuredRules.parentsAllowed} />
                    <RuleRow label="Smoking" value={listing.structuredRules.smokingAllowed} />
                    <RuleRow label="Gents" value={listing.structuredRules.gentsAllowed} />
                    <RuleRow label="Girls" value={listing.structuredRules.girlsAllowed} />
                    <RuleRow label="ID proof" value={listing.structuredRules.idProofRequired} />
                  </div>
                </div>
              )}

              {Array.isArray(listing.nearbyEssentials) &&
                listing.nearbyEssentials.length > 0 && (
                  <div className="rounded-3xl border border-slate-200 bg-white p-4">
                    <h3 className="text-base font-black text-slate-950">
                      Nearby essentials
                    </h3>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {listing.nearbyEssentials.map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <h3 className="text-base font-black text-slate-950 mb-3">
                  Contact info
                </h3>
                <ProtectedContactActions listing={listing} />
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <h3 className="text-base font-black text-slate-950">
                  Facilities
                </h3>

                <div className="mt-3 flex flex-wrap gap-2">
                  {(listing.facilities || []).map((facility) => (
                    <span
                      key={facility}
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700"
                    >
                      {facility}
                    </span>
                  ))}
                </div>

                {(!listing.facilities || listing.facilities.length === 0) && (
                  <p className="mt-3 text-sm text-slate-500">
                    No facilities added.
                  </p>
                )}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <h3 className="text-base font-black text-slate-950">Rules</h3>

                <div className="mt-3 grid gap-2">
                  {(listing.rules || []).map((rule) => (
                    <div
                      key={rule}
                      className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600"
                    >
                      {rule}
                    </div>
                  ))}
                </div>

                {(!listing.rules || listing.rules.length === 0) && (
                  <p className="mt-3 text-sm text-slate-500">
                    No rules added.
                  </p>
                )}
              </div>

              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm leading-6 text-amber-800">
                  CampusStay helps students find PGs and rooms. Please visit the
                  place and verify all details before making any payment.
                </p>
              </div>
            </div>
          </div>
        </div>

        {showReportForm && (
          <div className="border-t border-slate-200 bg-white p-4">
            <div className="rounded-3xl border border-red-200 bg-red-50 p-4">
              {reportSuccess ? (
                <div>
                  <h3 className="text-lg font-extrabold text-red-900">
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
                      <h3 className="text-lg font-extrabold text-red-900">
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
                        onChange={(event) =>
                          setReporterPhone(event.target.value)
                        }
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
                      onChange={(event) =>
                        setReportMessage(event.target.value)
                      }
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
          </div>
        )}

        <div className="sticky bottom-0 z-20 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur sm:p-4">
          {/* Mobile compact action bar */}
          <div className="grid grid-cols-3 gap-2 sm:hidden">
            <a
              href={auth.currentUser ? `tel:${listing.phone}` : undefined}
              onClick={(event) => {
                if (requireStudentLogin("call")) {
                  event.preventDefault();
                  return;
                }

                handleAnalyticsClick("call_click", "callClicks");
              }}
              className="inline-flex flex-col items-center justify-center gap-1 rounded-2xl bg-[#1E5B4F] px-2 py-3 text-xs font-black text-white"
            >
              <Phone size={17} />
              Call {primaryContactPerson}
            </a>

            {alternatePhone ? (
              <a
                href={auth.currentUser ? `tel:${alternatePhone}` : undefined}
                onClick={(event) => {
                  if (requireStudentLogin("call")) {
                    event.preventDefault();
                    return;
                  }

                  handleAnalyticsClick("alternate_call_click", "callClicks");
                }}
                className="inline-flex flex-col items-center justify-center gap-1 rounded-2xl border border-[#E8DFD2] bg-white px-2 py-3 text-xs font-black text-[#1E5B4F]"
              >
                <Phone size={17} />
                Call {alternateContactPerson}
              </a>
            ) : (
              <a
                href={auth.currentUser ? whatsappLink : undefined}
                target={auth.currentUser ? "_blank" : undefined}
                rel={auth.currentUser ? "noreferrer" : undefined}
                onClick={(event) => {
                  if (requireStudentLogin("whatsapp")) {
                    event.preventDefault();
                    return;
                  }

                  handleAnalyticsClick("whatsapp_click", "whatsappClicks");
                }}
                className="inline-flex flex-col items-center justify-center gap-1 rounded-2xl border border-[#E8DFD2] bg-white px-2 py-3 text-xs font-black text-slate-700"
              >
                <MessageCircle size={17} />
                WhatsApp
              </a>
            )}

            <button
              type="button"
              onClick={handleRequestCallback}
              disabled={callbackLoading || callbackSent}
              className="inline-flex flex-col items-center justify-center gap-1 rounded-2xl border border-[#DDECE7] bg-[#F1FAF7] px-2 py-3 text-xs font-black text-[#1E5B4F] disabled:opacity-60"
            >
              {callbackLoading ? (
                <Loader2 size={17} className="animate-spin" />
              ) : callbackSent ? (
                <CheckCircle2 size={17} />
              ) : (
                <Phone size={17} />
              )}
              {callbackSent ? "Requested" : "Callback"}
            </button>
          </div>

          {/* Mobile secondary actions */}
          <div className="mt-2 grid grid-cols-3 gap-2 sm:hidden">
            {alternatePhone ? (
              <a
                href={auth.currentUser ? whatsappLink : undefined}
                target={auth.currentUser ? "_blank" : undefined}
                rel={auth.currentUser ? "noreferrer" : undefined}
                onClick={(event) => {
                  if (requireStudentLogin("whatsapp")) {
                    event.preventDefault();
                    return;
                  }

                  handleAnalyticsClick("whatsapp_click", "whatsappClicks");
                }}
                className="inline-flex flex-col items-center justify-center gap-1 rounded-2xl border border-[#E8DFD2] bg-white px-2 py-2 text-xs font-bold text-slate-700"
              >
                <MessageCircle size={15} />
                WhatsApp
              </a>
            ) : (
              <SaveListingButton listing={listing} showText={false} />
            )}

            {alternatePhone ? (
              <SaveListingButton listing={listing} showText={false} />
            ) : (
              <a
                href={auth.currentUser ? listing.mapLink : undefined}
                target={auth.currentUser ? "_blank" : undefined}
                rel={auth.currentUser ? "noreferrer" : undefined}
                onClick={(event) => {
                  if (requireStudentLogin("map")) {
                    event.preventDefault();
                    return;
                  }

                  handleAnalyticsClick("map_click", "mapClicks");
                }}
                className="inline-flex items-center justify-center gap-1 rounded-2xl border border-[#E8DFD2] bg-white px-2 py-2.5 text-xs font-bold text-slate-700"
              >
                <MapPin size={15} />
                Map
              </a>
            )}

            {alternatePhone ? (
              <a
                href={auth.currentUser ? listing.mapLink : undefined}
                target={auth.currentUser ? "_blank" : undefined}
                rel={auth.currentUser ? "noreferrer" : undefined}
                onClick={(event) => {
                  if (requireStudentLogin("map")) {
                    event.preventDefault();
                    return;
                  }

                  handleAnalyticsClick("map_click", "mapClicks");
                }}
                className="inline-flex items-center justify-center gap-1 rounded-2xl border border-[#E8DFD2] bg-white px-2 py-2 text-xs font-bold text-slate-700"
              >
                <MapPin size={15} />
                Map
              </a>
            ) : (
              <button
                onClick={() => setShowReportForm(true)}
                className="rounded-2xl bg-red-50 px-2 py-2.5 text-xs font-bold text-red-700"
              >
                Report
              </button>
            )}
          </div>

          {alternatePhone && (
            <div className="mt-2 grid grid-cols-1 sm:hidden">
              <button
                onClick={() => setShowReportForm(true)}
                className="rounded-2xl bg-red-50 px-2 py-2 text-xs font-bold text-red-700"
              >
                Report issue
              </button>
            </div>
          )}

          {/* Desktop action grid */}
          <div className="hidden gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-3">
            <SaveListingButton listing={listing} />

            <a
              href={auth.currentUser ? `tel:${listing.phone}` : undefined}
              onClick={(event) => {
                if (requireStudentLogin("call")) {
                  event.preventDefault();
                  return;
                }

                handleAnalyticsClick("call_click", "callClicks");
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1E5B4F] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#123C35]"
            >
              <Phone size={16} />
              Call {primaryContactPerson}
            </a>

            {alternatePhone && (
              <a
                href={auth.currentUser ? `tel:${alternatePhone}` : undefined}
                onClick={(event) => {
                  if (requireStudentLogin("call")) {
                    event.preventDefault();
                    return;
                  }

                  handleAnalyticsClick("alternate_call_click", "callClicks");
                }}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#E8DFD2] bg-white px-4 py-3 text-sm font-bold text-[#1E5B4F] transition hover:bg-[#F6F1E8]"
              >
                <Phone size={16} />
                Call {alternateContactPerson}
              </a>
            )}

            <a
              href={auth.currentUser ? whatsappLink : undefined}
              target={auth.currentUser ? "_blank" : undefined}
              rel={auth.currentUser ? "noreferrer" : undefined}
              onClick={(event) => {
                if (requireStudentLogin("whatsapp")) {
                  event.preventDefault();
                  return;
                }

                handleAnalyticsClick("whatsapp_click", "whatsappClicks");
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#E8DFD2] bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-[#F6F1E8]"
            >
              <MessageCircle size={16} />
              WhatsApp
            </a>

            <button
              type="button"
              onClick={handleRequestCallback}
              disabled={callbackLoading || callbackSent}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#DDECE7] bg-[#F1FAF7] px-4 py-3 text-sm font-bold text-[#1E5B4F] transition hover:bg-[#E5F4EF] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {callbackLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : callbackSent ? (
                <CheckCircle2 size={16} />
              ) : (
                <Phone size={16} />
              )}
              {callbackLoading
                ? "Sending..."
                : callbackSent
                  ? "Callback requested"
                  : "Request Callback"}
            </button>

            <a
              href={auth.currentUser ? listing.mapLink : undefined}
              target={auth.currentUser ? "_blank" : undefined}
              rel={auth.currentUser ? "noreferrer" : undefined}
              onClick={(event) => {
                if (requireStudentLogin("map")) {
                  event.preventDefault();
                  return;
                }

                handleAnalyticsClick("map_click", "mapClicks");
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#E8DFD2] bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-[#F6F1E8]"
            >
              <MapPin size={16} />
              Open Map
            </a>

            <button
              onClick={() => setShowReportForm(true)}
              className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
            >
              Report issue
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
      </div>
    </div>
  );
}

function RuleRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-bold text-slate-800">
        {value || "Not added"}
      </span>
    </div>
  );
}

function getNearbyText(listing) {
  if (Array.isArray(listing.nearbyInstitutions) && listing.nearbyInstitutions.length > 0) {
    return listing.nearbyInstitutions.join(", ");
  }

  return listing.nearbyInstitutionText || listing.nearbyCollege || "";
}

export default ListingDetailsModal;