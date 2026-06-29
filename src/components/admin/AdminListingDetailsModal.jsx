import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BedDouble,
  CalendarDays,
  Copy,
  IndianRupee,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Utensils,
  User,
  X,
} from "lucide-react";

function formatDate(value) {
  if (!value) return "Not available";

  if (value.toDate) {
    return value.toDate().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return String(value);
}

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

function getFoodText(listing) {
  const hasFood = listing?.foodIncluded === true || listing?.food === true;

  if (!hasFood) return "Food not included";

  return listing?.foodDetails || "Food included";
}

function AdminListingDetailsModal({ listing, onClose, onUpdate, saving }) {
  if (!listing) return null;

  const [selectedStatus, setSelectedStatus] = useState(
    listing.status || (listing.approved ? "approved" : "pending")
  );
  const [adminNote, setAdminNote] = useState(listing.adminNote || "");

  useEffect(() => {
    setSelectedStatus(listing.status || (listing.approved ? "approved" : "pending"));
    setAdminNote(listing.adminNote || "");
  }, [listing]);

  async function handleSaveStatus() {
    const isApproved = selectedStatus === "approved";

    await onUpdate(listing.id, {
      status: selectedStatus,
      adminNote,
      approved: isApproved,
    });
  }

  async function copyTrackingId() {
    try {
      await navigator.clipboard.writeText(listing.trackingId || "");
      alert("Tracking ID copied.");
    } catch (error) {
      console.error("Copy failed:", error);
      alert("Could not copy Tracking ID.");
    }
  }

  const images =
    listing.images?.length > 0
      ? listing.images
      : [
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=900&auto=format&fit=crop",
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-3 py-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] bg-slate-50 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Listing details
            </p>

            <h2 className="mt-1 text-2xl font-black leading-tight text-slate-950">
              {listing.name || "Unnamed listing"}
            </h2>

            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
              <MapPin size={15} />
              {listing.area || "Area not added"} · Near {getNearbyText(listing)}
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
          >
            <X size={21} />
          </button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-5">
          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-4">
              <div className="overflow-hidden rounded-[1.7rem] bg-slate-200">
                <img
                  src={images[0]}
                  alt={listing.name}
                  className="h-72 w-full object-cover"
                />
              </div>

              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.slice(0, 4).map((image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className="overflow-hidden rounded-2xl bg-slate-200"
                    >
                      <img
                        src={image}
                        alt={`Listing ${index + 1}`}
                        className="h-20 w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <StatusBox
                  label="Approval"
                  value={listing.approved ? "Approved" : "Pending"}
                  tone={listing.approved ? "green" : "yellow"}
                />

                <StatusBox
                  label="Verification"
                  value={listing.verified ? "Verified" : "Not verified"}
                  tone={listing.verified ? "blue" : "gray"}
                />

                <StatusBox
                  label="Availability"
                  value={listing.available ? "Available" : "Full"}
                  tone={listing.available ? "green" : "red"}
                />

                <StatusBox
                  label="Featured"
                  value={listing.featured ? "Yes" : "No"}
                  tone={listing.featured ? "blue" : "gray"}
                />

                <StatusBox
                  label="Photos"
                  value={`${getImageCount(listing)} uploaded`}
                  tone={getImageCount(listing) >= 3 ? "green" : "red"}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">

                <div className="rounded-3xl border border-indigo-200 bg-indigo-50 p-4 sm:col-span-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-indigo-500">
                        Tracking ID
                      </p>

                      <p className="mt-2 break-all text-2xl font-black text-indigo-950">
                        {listing.trackingId || "Not generated"}
                      </p>

                      <p className="mt-2 text-sm leading-6 text-indigo-700">
                        Owner can use this Tracking ID with their submitted phone number to
                        check listing status.
                      </p>
                    </div>

                    <button
                      onClick={copyTrackingId}
                      disabled={!listing.trackingId}
                      className="flex shrink-0 items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-bold text-indigo-700 shadow-sm transition hover:bg-indigo-100 disabled:opacity-50"
                    >
                      <Copy size={15} />
                      Copy
                    </button>
                  </div>
                </div>
                <InfoBox
                  icon={<IndianRupee size={18} />}
                  title="Monthly rent"
                  value={`₹${listing.rent || 0}`}
                />

                <InfoBox
                  icon={<IndianRupee size={18} />}
                  title="Advance"
                  value={`₹${listing.deposit || 0}`}
                />

                <InfoBox
                  icon={<BedDouble size={18} />}
                  title="Room type"
                  value={listing.roomType}
                />

                <InfoBox
                  icon={<Utensils size={18} />}
                  title="Food"
                  value={getFoodText(listing)}
                />

                <InfoBox
                  icon={<User size={18} />}
                  title="Owner name"
                  value={listing.ownerName}
                />

                <InfoBox
                  icon={<Phone size={18} />}
                  title="Phone"
                  value={listing.phone}
                />

                <InfoBox
                  icon={<ShieldCheck size={18} />}
                  title="Verification level"
                  value={listing.verificationLevel}
                />

                <InfoBox
                  icon={<CalendarDays size={18} />}
                  title="Last updated"
                  value={listing.lastUpdated || formatDate(listing.updatedAt)}
                />
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <h3 className="text-base font-black text-slate-950">
                  Basic details
                </h3>

                <div className="rounded-3xl border border-slate-200 bg-white p-4">
                  <h3 className="text-base font-black text-slate-950">
                    Admin status control
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    This is what the owner will see on the Check Status page.
                  </p>

                  {getImageCount(listing) < 3 && (
                    <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                      This listing has fewer than 3 photos. Ask the owner to upload clearer photos before approving.
                    </div>
                  )}

                  {getNearbyInstitutions(listing).length === 0 && (
                    <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                      Nearby institution is missing. Add or correct it before approval.
                    </div>
                  )}

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Listing status
                      </label>

                      <select
                        value={selectedStatus}
                        onChange={(event) => setSelectedStatus(event.target.value)}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none focus:border-slate-400"
                      >
                        <option value="pending">Pending Review</option>
                        <option value="approved">Approved</option>
                        <option value="needs_changes">Needs Changes</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Public visibility
                      </label>

                      <div className="flex h-12 items-center rounded-2xl bg-slate-50 px-4 text-sm font-bold text-slate-700">
                        {selectedStatus === "approved"
                          ? "Visible on public homepage"
                          : "Hidden from public homepage"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Admin note
                    </label>

                    <textarea
                      value={adminNote}
                      onChange={(event) => setAdminNote(event.target.value)}
                      rows="4"
                      placeholder="Example: Please upload clearer room photos, or rent details need correction."
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400"
                    />
                  </div>

                  <button
                    onClick={handleSaveStatus}
                    disabled={saving}
                    className="mt-4 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save status"}
                  </button>
                </div>

                <div className="mt-3 grid gap-2 text-sm text-slate-600">
                  <DetailRow label="Tracking ID" value={listing.trackingId} />
                  <DetailRow label="Type" value={listing.type} />
                  <DetailRow label="For" value={listing.gender} />
                  <DetailRow label="Nearby" value={getNearbyText(listing)} />
                  <DetailRow label="Area" value={listing.area} />
                  <DetailRow label="Photos" value={`${getImageCount(listing)} uploaded`} />
                  <DetailRow label="Map link" value={listing.mapLink} />
                  <DetailRow label="Created at" value={formatDate(listing.createdAt)} />
                  <DetailRow label="Updated at" value={formatDate(listing.updatedAt)} />
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <h3 className="text-base font-extrabold text-slate-950">Room options</h3>

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
                              Capacity: {room.capacity} student
                              {Number(room.capacity) > 1 ? "s" : ""}
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

                        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                          <div className="rounded-2xl bg-white px-3 py-2">
                            Deposit: ₹{room.deposit || 0}
                          </div>

                          <div className="rounded-2xl bg-white px-3 py-2">
                            Available: {room.availableUnits || 0}
                          </div>

                          <div className="rounded-2xl bg-white px-3 py-2">
                            Status: {room.available ? "Available" : "Full"}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No room options added.</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
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
                        className="rounded-2xl bg-slate-50 px-4 py-2 text-sm text-slate-600"
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
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <a
                  href={`tel:${listing.phone}`}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <Phone size={16} />
                  Call owner
                </a>

                <a
                  href={`https://wa.me/91${listing.phone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                >
                  <MessageCircle size={16} />
                  WhatsApp
                </a>

                <a
                  href={listing.mapLink || "https://maps.google.com"}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                >
                  <MapPin size={16} />
                  Open map
                </a>
              </div>

              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex gap-2 text-sm leading-6 text-amber-800">
                  <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                  Check all details before approving. Once approved, the listing
                  becomes visible on the public homepage.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoBox({ icon, title, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-900">
        {icon}
        {title}
      </div>

      <p className="break-words text-sm leading-6 text-slate-600">
        {value || "Not added"}
      </p>
    </div>
  );
}

function StatusBox({ label, value, tone }) {
  const tones = {
    green: "bg-emerald-50 text-emerald-700",
    yellow: "bg-amber-50 text-amber-700",
    blue: "bg-indigo-50 text-indigo-700",
    red: "bg-red-50 text-red-700",
    gray: "bg-slate-100 text-slate-600",
  };

  return (
    <div className={`rounded-3xl p-4 ${tones[tone]}`}>
      <p className="text-xs font-bold uppercase tracking-wide opacity-80">
        {label}
      </p>
      <p className="mt-1 text-lg font-black">{value}</p>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="grid gap-2 rounded-2xl bg-slate-50 px-4 py-3 sm:grid-cols-[120px_1fr]">
      <p className="font-semibold text-slate-500">{label}</p>
      <p className="break-words font-medium text-slate-800">
        {value || "Not added"}
      </p>
    </div>
  );
}

export default AdminListingDetailsModal;