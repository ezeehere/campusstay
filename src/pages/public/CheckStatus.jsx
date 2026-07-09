import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Home as HomeIcon,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
  XCircle,
  AlertTriangle,
} from "lucide-react";

import { getListingByTrackingIdAndPhone } from "../../firebase/listings";

const statusContent = {
  pending: {
    label: "Pending Review",
    tone: "bg-amber-50 text-amber-700 border-amber-200",
    icon: <Clock size={18} />,
    message:
      "Your listing has been submitted and is waiting for admin review.",
  },
  approved: {
    label: "Approved",
    tone: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: <CheckCircle2 size={18} />,
    message: "Your listing is approved and visible on CampusStay.",
  },
  rejected: {
    label: "Rejected",
    tone: "bg-red-50 text-red-700 border-red-200",
    icon: <XCircle size={18} />,
    message: "Your listing was not approved. Check the admin note below.",
  },
  needs_changes: {
    label: "Needs Changes",
    tone: "bg-orange-50 text-orange-700 border-orange-200",
    icon: <AlertTriangle size={18} />,
    message: "Some details need correction before approval.",
  },
};

function getNearbyInstitutions(listing) {
  if (
    Array.isArray(listing?.nearbyInstitutions) &&
    listing.nearbyInstitutions.length > 0
  ) {
    return listing.nearbyInstitutions;
  }

  if (listing?.nearbyCollege) {
    return [listing.nearbyCollege];
  }

  if (listing?.nearbyInstitutionText) {
    return String(listing.nearbyInstitutionText)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function getNearbyText(listing) {
  const institutions = getNearbyInstitutions(listing);
  return institutions.length > 0 ? institutions.join(", ") : "Not selected";
}

function getImageCount(listing) {
  return Array.isArray(listing?.images) ? listing.images.length : 0;
}

function isFoodIncluded(listing) {
  return listing?.foodIncluded === true || listing?.food === true;
}

function getFacilities(listing) {
  return Array.isArray(listing?.facilities) ? listing.facilities : [];
}

function CheckStatus() {
  const [searchParams] = useSearchParams();
  const [trackingId, setTrackingId] = useState("");
  const [phone, setPhone] = useState("");
  const [listing, setListing] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  async function checkListingStatus(trackingValue, phoneValue) {
    try {
      setLoading(true);
      setNotFound(false);
      setListing(null);

      const cleanedTrackingId = trackingValue.trim().toUpperCase();
      const cleanedPhone = phoneValue.trim();

      const data = await getListingByTrackingIdAndPhone(
        cleanedTrackingId,
        cleanedPhone
      );

      if (!data) {
        setNotFound(true);
        return;
      }

      setListing(data);
    } catch (error) {
      console.error("Status check error:", error);
      alert("Could not check status. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckStatus(event) {
    event.preventDefault();
    await checkListingStatus(trackingId, phone);
  }

  useEffect(() => {
    const trackingFromUrl = searchParams.get("trackingId") || "";
    const phoneFromUrl = searchParams.get("phone") || "";

    if (trackingFromUrl && phoneFromUrl) {
      setTrackingId(trackingFromUrl);
      setPhone(phoneFromUrl);
      checkListingStatus(trackingFromUrl, phoneFromUrl);
    }
  }, [searchParams]);

  const currentStatus = listing?.status || "pending";
  const statusInfo = statusContent[currentStatus] || statusContent.pending;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FFF8EF] via-white to-[#F6F1E8] text-slate-950">
      <header className="border-b border-[#E8DFD2] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1E5B4F] text-white shadow-sm">
              <HomeIcon size={22} />
            </div>

            <div>
              <h1 className="text-xl font-black tracking-tight">CampusStay</h1>
              <p className="text-xs text-slate-500">Listing status</p>
            </div>
          </Link>

          <Link
            to="/"
            className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-[#FFF8EF]"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid items-start gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[2rem] bg-[#1E5B4F] p-6 text-white shadow-xl sm:p-8">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
              <ShieldCheck size={16} />
              Track your listing
            </div>

            <h2 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl">
              Check your PG or room listing status.
            </h2>

            <p className="mt-4 leading-7 text-slate-300">
              Enter the Tracking ID you received after submission and your phone
              number to see whether your listing is pending, approved, or needs
              changes.
            </p>

            <div className="mt-6 grid gap-3">
              <InfoLine label="Step 1" value="Submit your listing" />
              <InfoLine label="Step 2" value="Save your Tracking ID" />
              <InfoLine label="Step 3" value="Check status anytime" />
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#E8DFD2] bg-white p-5 shadow-sm sm:p-7">
            <form onSubmit={handleCheckStatus} className="grid gap-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Tracking ID
                </label>

                <input
                  value={trackingId}
                  onChange={(event) => setTrackingId(event.target.value)}
                  placeholder="Example: CS-A8F4K"
                  required
                  className="h-13 w-full rounded-2xl border border-[#E8DFD2] bg-[#FFF8EF] px-4 py-3 text-base uppercase outline-none focus:border-slate-400"
                />

                <p className="mt-2 text-xs text-slate-500">
                  You received this ID after submitting your listing.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Phone number
                </label>

                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Enter the submitted phone number"
                  required
                  className="h-13 w-full rounded-2xl border border-[#E8DFD2] bg-[#FFF8EF] px-4 py-3 text-base outline-none focus:border-slate-400"
                />
              </div>

              <button
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-2xl bg-[#1E5B4F] px-6 py-4 text-sm font-black text-white transition hover:bg-[#123C35] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Search size={18} />
                )}
                {loading ? "Checking..." : "Check status"}
              </button>
            </form>

            {notFound && (
              <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-5">
                <div className="flex gap-3">
                  <XCircle className="mt-0.5 shrink-0 text-red-700" size={22} />

                  <div>
                    <h3 className="font-black text-red-800">
                      No listing found
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-red-700">
                      Check your Tracking ID and phone number. Make sure the
                      phone number is the same one used during submission.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {listing && (
              <div className="mt-6 overflow-hidden rounded-[2rem] border border-[#E8DFD2] bg-[#FFF8EF]">
                <div className="p-4 sm:p-5">
                  <div
                    className={`mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-black ${statusInfo.tone}`}
                  >
                    {statusInfo.icon}
                    {statusInfo.label}
                  </div>

                  <h3 className="text-2xl font-black text-slate-950">
                    {listing.name || "Unnamed listing"}
                  </h3>

                  <p className="mt-2 flex items-center gap-1 text-sm text-slate-500">
                    <MapPin size={15} />
                    {listing.area || "Area not added"} · Near {getNearbyText(listing)}
                  </p>

                  <p className="mt-4 rounded-3xl bg-white p-4 text-sm leading-6 text-slate-600">
                    {statusInfo.message}
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <SmallBox label="Tracking ID" value={listing.trackingId} />

                    <SmallBox
                      label="Rent"
                      value={`₹${listing.startingRent || listing.rent || 0}/month`}
                    />

                    <SmallBox
                      label="For"
                      value={`${listing.type || "Stay"} · ${listing.gender || "Not added"}`}
                    />

                    <SmallBox
                      label="Nearby Institution"
                      value={getNearbyText(listing)}
                    />

                    <SmallBox
                      label="Photos Uploaded"
                      value={`${getImageCount(listing)} photo${getImageCount(listing) === 1 ? "" : "s"}`}
                    />

                    <SmallBox
                      label="Food"
                      value={isFoodIncluded(listing) ? "Food included" : "Food not included"}
                    />

                    <SmallBox
                      label="Availability"
                      value={listing.available ? "Available" : "Full"}
                    />

                    <SmallBox
                      label="Room Type"
                      value={listing.roomType || "Not added"}
                    />
                  </div>
                  <div className="mt-4 rounded-3xl bg-white p-4">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                      Facilities
                    </p>

                    {getFacilities(listing).length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {getFacilities(listing).map((facility) => (
                          <span
                            key={facility}
                            className="rounded-full bg-[#F6F1E8] px-3 py-1.5 text-xs font-bold text-slate-700"
                          >
                            {facility}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm font-semibold text-slate-500">
                        No facilities added.
                      </p>
                    )}
                  </div>
                  {getImageCount(listing) < 3 && (
                    <div className="mt-4 rounded-3xl border border-orange-200 bg-orange-50 p-4">
                      <p className="text-sm font-bold text-orange-800">
                        Photo requirement not complete
                      </p>
                      <p className="mt-1 text-sm leading-6 text-orange-700">
                        At least 3 clear photos are recommended before approval: room, outside/building,
                        and bathroom/common area.
                      </p>
                    </div>
                  )}

                  {listing.adminNote && (
                    <div className="mt-4 rounded-3xl border border-amber-200 bg-amber-50 p-4">
                      <p className="text-xs font-black uppercase tracking-wide text-amber-700">
                        Admin note
                      </p>
                      <p className="mt-2 text-sm leading-6 text-amber-800">
                        {listing.adminNote}
                      </p>
                    </div>
                  )}

                  {listing.approved && (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <a
                        href="/"
                        className="rounded-2xl bg-[#1E5B4F] px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-[#123C35]"
                      >
                        View public listings
                      </a>

                      <a
                        href={`https://wa.me/91${listing.phone}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:bg-[#FFF8EF]"
                      >
                        <MessageCircle size={16} />
                        WhatsApp contact
                      </a>
                    </div>
                  )}

                  {!listing.approved && (
                    <div className="mt-4 rounded-3xl border border-[#E8DFD2] bg-white p-4">
                      <p className="text-sm leading-6 text-slate-600">
                        Your listing is not public yet. Once the admin approves it,
                        students will be able to see it on CampusStay. If admin requested
                        changes, update the details and submit again or contact support.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoLine({ label, value }) {
  return (
    <div className="rounded-3xl bg-white/10 p-4">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 font-bold text-white">{value}</p>
    </div>
  );
}

function SmallBox({ label, value }) {
  return (
    <div className="rounded-3xl bg-white p-4">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-bold text-slate-800">
        {value || "Not added"}
      </p>
    </div>
  );
}

export default CheckStatus;