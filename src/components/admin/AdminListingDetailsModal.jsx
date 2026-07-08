import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BedDouble,
  CalendarDays,
  Copy,
  ImagePlus,
  IndianRupee,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  PlusCircle,
  Save,
  ShieldCheck,
  Trash2,
  Utensils,
  User,
  X,
} from "lucide-react";

import { uploadImagesToCloudinary } from "../../cloudinary/uploadImages";
import { getListingScoreBreakdown } from "../../utils/listingScore";
import {
  NEARBY_INSTITUTIONS,
  STAY_TYPES,
  GENDER_OPTIONS,
  CONTACT_PERSON_OPTIONS,
} from "../../utils/constants";

const MAX_IMAGES = 14;

const DEFAULT_ROOM_OPTION = {
  title: "Single Room",
  rent: 0,
  deposit: 0,
  availableUnits: 0,
  available: false,
  note: "",
};

const ADMIN_NOTE_TEMPLATES = [
  {
    label: "Clearer room photos",
    status: "needs_changes",
    note: "Please upload clearer room photos. At least one room photo, one outside/building photo, and one bathroom/common area photo are needed.",
  },
  {
    label: "Bathroom/common photo missing",
    status: "needs_changes",
    note: "Please add a bathroom or common area photo so students can properly judge the stay.",
  },
  {
    label: "Rent/deposit unclear",
    status: "needs_changes",
    note: "Please correct the rent, deposit, or extra charges. The current pricing details are unclear.",
  },
  {
    label: "Phone not reachable",
    status: "needs_changes",
    note: "The submitted phone number is not reachable. Please provide a working owner contact number.",
  },
  {
    label: "Map link missing",
    status: "needs_changes",
    note: "Please add a correct Google Maps link so students can locate the PG/room easily.",
  },
  {
    label: "Seats left unclear",
    status: "needs_changes",
    note: "Please update the number of seats left for each room option. This helps students avoid calling fully booked stays.",
  },
  {
    label: "Food details unclear",
    status: "needs_changes",
    note: "Please clarify the food details, such as whether food is included, meal timing, or extra food charges.",
  },
  {
    label: "Rules unclear",
    status: "needs_changes",
    note: "Please clarify important rules like entry time, visitor rules, ID proof requirement, and restrictions.",
  },
  {
    label: "Nearby details missing",
    status: "needs_changes",
    note: "Please select nearby institution and nearby essentials like market, bus stop, pharmacy, or food shops if available.",
  },
  {
    label: "Possible duplicate",
    status: "needs_changes",
    note: "This listing looks similar to an existing listing. Please confirm whether this is a new PG/room or a duplicate submission.",
  },
];

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

  const scoreData = getListingScoreBreakdown(listing);

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

  function applyAdminTemplate(template) {
    setSelectedStatus(template.status);

    setAdminNote((previousNote) => {
      if (!previousNote.trim()) return template.note;

      return `${previousNote.trim()}\n\n${template.note}`;
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
              <AdminListingEditPanel
                listing={listing}
                onUpdate={onUpdate}
                saving={saving}
              />

              <RecommendationScoreBox scoreData={scoreData} />

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
                    <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <label className="block text-sm font-bold text-slate-700">
                        Admin note
                      </label>

                      {adminNote && (
                        <button
                          type="button"
                          onClick={() => setAdminNote("")}
                          className="w-fit rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-200"
                        >
                          Clear note
                        </button>
                      )}
                    </div>

                    <div className="mb-3 rounded-2xl border border-[#E8DFD2] bg-[#FFF8EF] p-3">
                      <p className="mb-2 text-xs font-black uppercase tracking-wide text-slate-500">
                        Quick templates
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {ADMIN_NOTE_TEMPLATES.map((template) => (
                          <button
                            key={template.label}
                            type="button"
                            onClick={() => applyAdminTemplate(template)}
                            className="rounded-full border border-[#E8DFD2] bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-[#1E5B4F] hover:text-[#1E5B4F]"
                          >
                            {template.label}
                          </button>
                        ))}
                      </div>
                    </div>

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
                    {saving ? "Saving..." : "Save status and note"}
                  </button>
                </div>

                <div className="mt-3 grid gap-2 text-sm text-slate-600">
                  <DetailRow label="Tracking ID" value={listing.trackingId} />
                  <DetailRow label="Type" value={listing.type} />
                  <DetailRow label="For" value={listing.gender} />
                  <DetailRow label="Nearby" value={getNearbyText(listing)} />
                  <DetailRow label="Area" value={listing.area} />
                  <DetailRow label="PG note" value={listing.pgNote} />
                  <DetailRow label="Photos" value={`${getImageCount(listing)} uploaded`} />
                  <DetailRow label="Map link" value={listing.mapLink} />
                  <DetailRow label="Available from" value={listing.availableFrom} />
                  <DetailRow label="Move-in note" value={listing.moveInNote} />
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

function AdminListingEditPanel({ listing, onUpdate, saving }) {
  const [open, setOpen] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [editData, setEditData] = useState({
    name: "",
    ownerName: "",
    phone: "",
    contactPerson: "Owner",
    alternatePhone: "",
    alternateContactPerson: "Caretaker",
    area: "",
    pgNote: "",
    type: "PG",
    gender: "Boys",
    availableFrom: "",
    moveInNote: "",
    nearbyInstitutions: [],
    food: "Yes",
    foodDetails: "",
    facilitiesText: "",
    rulesText: "",
    mapLink: "",
    images: [],
    roomOptions: [{ ...DEFAULT_ROOM_OPTION }],
  });

  useEffect(() => {
    setEditData({
      name: listing?.name || "",
      ownerName: listing?.ownerName || "",
      phone: listing?.phone || "",
      contactPerson: listing?.contactPerson || "Owner",
      alternatePhone: listing?.alternatePhone || "",
      alternateContactPerson: listing?.alternateContactPerson || "Caretaker",
      area: listing?.area || "",
      pgNote: listing?.pgNote || "",
      type: listing?.type || "PG",
      gender: listing?.gender || "Boys",
      availableFrom: listing?.availableFrom || "",
      moveInNote: listing?.moveInNote || "",
      nearbyInstitutions: Array.isArray(listing?.nearbyInstitutions)
        ? listing.nearbyInstitutions
        : listing?.nearbyCollege
          ? [listing.nearbyCollege]
          : [],
      food: listing?.foodIncluded || listing?.food ? "Yes" : "No",
      foodDetails: listing?.foodDetails || "",
      facilitiesText: Array.isArray(listing?.facilities)
        ? listing.facilities.join(", ")
        : "",
      rulesText: Array.isArray(listing?.rules) ? listing.rules.join(", ") : "",
      mapLink: listing?.mapLink || "",
      images: Array.isArray(listing?.images) ? listing.images : [],
      roomOptions:
        Array.isArray(listing?.roomOptions) && listing.roomOptions.length > 0
          ? listing.roomOptions
          : [
              {
                ...DEFAULT_ROOM_OPTION,
                title: listing?.roomType || "Single Room",
                rent: listing?.rent || listing?.startingRent || 0,
                deposit: listing?.deposit || 0,
                availableUnits: listing?.available ? 1 : 0,
                available: listing?.available || false,
              },
            ],
    });
  }, [listing]);

  function handleChange(event) {
    const { name, value } = event.target;

    setEditData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // Handle deposit label change from "Deposit" to "Advance" inside helper RoomEditInput
  // This satisfies the earlier change request cleanly for input labels.
  function toggleInstitution(institution) {
    setEditData((previous) => {
      const selected = previous.nearbyInstitutions.includes(institution);

      return {
        ...previous,
        nearbyInstitutions: selected
          ? previous.nearbyInstitutions.filter((item) => item !== institution)
          : [...previous.nearbyInstitutions, institution],
      };
    });
  }

  function updateRoomOption(index, field, value) {
    setEditData((previous) => ({
      ...previous,
      roomOptions: previous.roomOptions.map((room, roomIndex) =>
        roomIndex === index
          ? {
              ...room,
              [field]: value,
            }
          : room
      ),
    }));
  }

  function addRoomOption() {
    setEditData((previous) => ({
      ...previous,
      roomOptions: [
        ...previous.roomOptions,
        {
          ...DEFAULT_ROOM_OPTION,
          id: `room-${previous.roomOptions.length + 1}`,
        },
      ],
    }));
  }

  function removeRoomOption(index) {
    if (editData.roomOptions.length === 1) {
      alert("At least one room option is required.");
      return;
    }

    setEditData((previous) => ({
      ...previous,
      roomOptions: previous.roomOptions.filter(
        (_, roomIndex) => roomIndex !== index
      ),
    }));
  }

  function moveImage(index, direction) {
    const nextIndex = index + direction;

    if (nextIndex < 0 || nextIndex >= editData.images.length) return;

    const updatedImages = [...editData.images];
    const currentImage = updatedImages[index];

    updatedImages[index] = updatedImages[nextIndex];
    updatedImages[nextIndex] = currentImage;

    setEditData((previous) => ({
      ...previous,
      images: updatedImages,
    }));
  }

  function removeImage(index) {
    const confirmRemove = window.confirm("Remove this image from the listing?");
    if (!confirmRemove) return;

    setEditData((previous) => ({
      ...previous,
      images: previous.images.filter((_, imageIndex) => imageIndex !== index),
    }));
  }

  async function handleAddImages(event) {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    const totalAfterUpload = editData.images.length + files.length;

    if (totalAfterUpload > MAX_IMAGES) {
      alert(`Maximum ${MAX_IMAGES} images are allowed in one listing.`);
      event.target.value = "";
      return;
    }

    try {
      setUploadingImages(true);

      const uploadedUrls = await uploadImagesToCloudinary(files);

      setEditData((previous) => ({
        ...previous,
        images: [...previous.images, ...uploadedUrls],
      }));
    } catch (error) {
      console.error(error);
      alert("Could not upload images.");
    } finally {
      setUploadingImages(false);
      event.target.value = "";
    }
  }

  async function handleSaveEdits() {
    if (!editData.name.trim()) {
      alert("PG / Room name is required.");
      return;
    }

    if (!editData.phone.trim()) {
      alert("Owner phone is required.");
      return;
    }

    if (!editData.area.trim()) {
      alert("Area is required.");
      return;
    }

    if (editData.nearbyInstitutions.length === 0) {
      alert("Select at least one nearby institution.");
      return;
    }

    if (editData.images.length > MAX_IMAGES) {
      alert(`Maximum ${MAX_IMAGES} images are allowed.`);
      return;
    }

    const cleanedRoomOptions = editData.roomOptions.map((room, index) => {
      const rent = Number(room.rent || 0);
      const deposit = Number(room.deposit || 0);
      const availableUnits = Number(room.availableUnits || 0);

      return {
        id: room.id || `room-${index + 1}`,
        title: String(room.title || "Room").trim(),
        rent,
        deposit,
        availableUnits,
        available: availableUnits > 0,
        note: String(room.note || "").trim(),
      };
    });

    const hasInvalidRoom = cleanedRoomOptions.some(
      (room) => !room.title || room.rent <= 0
    );

    if (hasInvalidRoom) {
      alert("Each room option needs room type and valid rent.");
      return;
    }

    const startingRent = Math.min(
      ...cleanedRoomOptions.map((room) => Number(room.rent || 0))
    );

    const hasAvailableRoom = cleanedRoomOptions.some(
      (room) => Number(room.availableUnits || 0) > 0
    );

    const facilities = editData.facilitiesText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const rules = editData.rulesText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const updates = {
      name: editData.name.trim(),
      ownerName: editData.ownerName.trim(),
      phone: editData.phone.trim(),
      contactPerson: editData.contactPerson || "Owner",

      alternatePhone: editData.alternatePhone.trim(),
      alternateContactPerson: editData.alternatePhone.trim()
        ? editData.alternateContactPerson || "Caretaker"
        : "",
      area: editData.area.trim(),
      pgNote: editData.pgNote.trim(),
      type: editData.type,
      gender: editData.gender,

      nearbyInstitutions: editData.nearbyInstitutions,
      nearbyCollege: editData.nearbyInstitutions[0] || "",
      nearbyInstitutionText: editData.nearbyInstitutions.join(", "),

      food: editData.food === "Yes",
      foodIncluded: editData.food === "Yes",
      foodDetails: editData.foodDetails.trim(),
      availableFrom: editData.availableFrom,
      moveInNote: editData.moveInNote,

      facilities,
      rules,
      mapLink: editData.mapLink.trim(),

      images: editData.images,

      roomOptions: cleanedRoomOptions,
      startingRent,
      rent: startingRent,
      deposit: cleanedRoomOptions[0]?.deposit || 0,
      roomType: cleanedRoomOptions.map((room) => room.title).join(" / "),
      available: hasAvailableRoom,

      lastUpdated: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    };

    await onUpdate(listing.id, updates);
    alert("Listing details updated.");
    setOpen(false);
  }

  return (
    <div className="rounded-3xl border border-[#DDECE7] bg-[#F1FAF7] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-[#1E5B4F]">
            Admin edit tools
          </p>

          <h3 className="mt-1 text-lg font-black text-[#123C35]">
            Edit PG details and images
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            Correct owner mistakes, add images, remove bad images, and reorder
            photo priority. Limit: {MAX_IMAGES} images.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpen((previous) => !previous)}
          className="rounded-2xl bg-[#1E5B4F] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#123C35]"
        >
          {open ? "Close editor" : "Edit listing"}
        </button>
      </div>

      {open && (
        <div className="mt-5 grid gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminEditInput
              label="PG / Room name"
              name="name"
              value={editData.name}
              onChange={handleChange}
            />

            <AdminEditInput
              label="Owner name"
              name="ownerName"
              value={editData.ownerName}
              onChange={handleChange}
            />

            <AdminEditInput
              label="Phone"
              name="phone"
              value={editData.phone}
              onChange={handleChange}
            />

            <AdminEditSelect
              label="Primary contact person"
              name="contactPerson"
              value={editData.contactPerson}
              onChange={handleChange}
              options={CONTACT_PERSON_OPTIONS}
            />

            <AdminEditInput
              label="Second phone number"
              name="alternatePhone"
              value={editData.alternatePhone}
              onChange={handleChange}
              placeholder="Optional backup number"
            />

            <AdminEditSelect
              label="Second contact person"
              name="alternateContactPerson"
              value={editData.alternateContactPerson}
              onChange={handleChange}
              options={CONTACT_PERSON_OPTIONS}
            />

            <AdminEditInput
              label="Area"
              name="area"
              value={editData.area}
              onChange={handleChange}
            />

            <AdminEditInput
              label="PG note"
              name="pgNote"
              value={editData.pgNote}
              onChange={handleChange}
              placeholder="Example: Advance ₹5000"
            />

            <AdminEditSelect
              label="Type"
              name="type"
              value={editData.type}
              onChange={handleChange}
              options={STAY_TYPES}
            />

            <AdminEditSelect
              label="For"
              name="gender"
              value={editData.gender}
              onChange={handleChange}
              options={GENDER_OPTIONS}
            />

            <AdminEditSelect
              label="Food available?"
              name="food"
              value={editData.food}
              onChange={handleChange}
              options={["Yes", "No"]}
            />

            <AdminEditInput
              label="Food details"
              name="foodDetails"
              value={editData.foodDetails}
              onChange={handleChange}
            />

            <div className="md:col-span-2">
              <AdminEditInput
                label="Google Maps link"
                name="mapLink"
                value={editData.mapLink}
                onChange={handleChange}
              />
            </div>

            <AdminEditInput
              label="Available from"
              name="availableFrom"
              type="date"
              value={editData.availableFrom}
              onChange={handleChange}
            />

            <AdminEditSelect
              label="Move-in note"
              name="moveInNote"
              value={editData.moveInNote}
              onChange={handleChange}
              options={[
                "",
                "Available immediately",
                "Available within 1 week",
                "Available within 1 month",
                "Contact owner before visiting",
              ]}
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-bold text-slate-700">
              Nearby institutions
            </p>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {NEARBY_INSTITUTIONS.map((institution) => {
                const selected =
                  editData.nearbyInstitutions.includes(institution);

                return (
                  <button
                    key={institution}
                    type="button"
                    onClick={() => toggleInstitution(institution)}
                    className={`rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                      selected
                        ? "border-[#1E5B4F] bg-[#1E5B4F] text-white"
                        : "border-[#E8DFD2] bg-white text-slate-700"
                    }`}
                  >
                    {institution}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <AdminEditTextarea
              label="Facilities comma separated"
              name="facilitiesText"
              value={editData.facilitiesText}
              onChange={handleChange}
              placeholder="Wi-Fi, Food, Parking, Geyser"
            />

            <AdminEditTextarea
              label="Rules comma separated"
              name="rulesText"
              value={editData.rulesText}
              onChange={handleChange}
              placeholder="No smoking, Entry before 9 PM"
            />
          </div>

          <div className="rounded-3xl border border-[#E8DFD2] bg-white p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 className="text-base font-black text-[#1F2933]">
                  Images
                </h4>
                <p className="mt-1 text-sm text-slate-500">
                  {editData.images.length}/{MAX_IMAGES} images. First image is
                  used as cover photo.
                </p>
              </div>

              <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#1E5B4F] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#123C35]">
                {uploadingImages ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <ImagePlus size={16} />
                )}
                {uploadingImages ? "Uploading..." : "Add images"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAddImages}
                  disabled={uploadingImages}
                  className="hidden"
                />
              </label>
            </div>

            {editData.images.length === 0 ? (
              <div className="mt-4 rounded-3xl border border-dashed border-slate-300 p-6 text-center text-sm font-semibold text-slate-500">
                No images added.
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                {editData.images.map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                  >
                    <img
                      src={image}
                      alt={`Listing ${index + 1}`}
                      className="h-28 w-full object-cover"
                    />

                    <div className="grid grid-cols-3 gap-1 p-2">
                      <button
                        type="button"
                        onClick={() => moveImage(index, -1)}
                        disabled={index === 0}
                        className="rounded-xl bg-slate-100 px-2 py-2 text-xs font-bold text-slate-700 disabled:opacity-40"
                      >
                        <ArrowUp size={14} className="mx-auto" />
                      </button>

                      <button
                        type="button"
                        onClick={() => moveImage(index, 1)}
                        disabled={index === editData.images.length - 1}
                        className="rounded-xl bg-slate-100 px-2 py-2 text-xs font-bold text-slate-700 disabled:opacity-40"
                      >
                        <ArrowDown size={14} className="mx-auto" />
                      </button>

                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="rounded-xl bg-red-50 px-2 py-2 text-xs font-bold text-red-700"
                      >
                        <Trash2 size={14} className="mx-auto" />
                      </button>
                    </div>

                    {index === 0 && (
                      <p className="px-2 pb-2 text-center text-[11px] font-black uppercase tracking-wide text-[#1E5B4F]">
                        Cover image
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-[#E8DFD2] bg-white p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 className="text-base font-black text-[#1F2933]">
                  Room options
                </h4>
                <p className="mt-1 text-sm text-slate-500">
                  Fix rent, deposit, and available seats.
                </p>
              </div>

              <button
                type="button"
                onClick={addRoomOption}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1E5B4F] px-4 py-3 text-sm font-bold text-white"
              >
                <PlusCircle size={16} />
                Add room
              </button>
            </div>

            <div className="mt-4 grid gap-4">
              {editData.roomOptions.map((room, index) => (
                <div
                  key={room.id || index}
                  className="rounded-3xl border border-[#E8DFD2] bg-[#FFF8EF] p-4"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="font-black text-[#1F2933]">
                      Room option {index + 1}
                    </p>

                    <button
                      type="button"
                      onClick={() => removeRoomOption(index)}
                      className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <RoomEditInput
                      label="Room type"
                      value={room.title}
                      onChange={(value) =>
                        updateRoomOption(index, "title", value)
                      }
                    />

                    <RoomEditInput
                      label="Rent"
                      type="number"
                      value={room.rent}
                      onChange={(value) =>
                        updateRoomOption(index, "rent", value)
                      }
                    />

                    <RoomEditInput
                      label="Advance"
                      type="number"
                      value={room.deposit}
                      onChange={(value) =>
                        updateRoomOption(index, "deposit", value)
                      }
                    />



                    <RoomEditInput
                      label="Seats left"
                      type="number"
                      value={room.availableUnits}
                      onChange={(value) =>
                        updateRoomOption(index, "availableUnits", value)
                      }
                    />

                    <RoomEditInput
                      label="Note"
                      value={room.note || ""}
                      onChange={(value) =>
                        updateRoomOption(index, "note", value)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveEdits}
            disabled={saving || uploadingImages}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <Save size={17} />
            {saving ? "Saving..." : "Save edited listing"}
          </button>
        </div>
      )}
    </div>
  );
}

function AdminEditInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </span>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-12 w-full rounded-2xl border border-[#E8DFD2] bg-white px-4 text-sm font-semibold text-slate-700 outline-none focus:border-[#1E5B4F]"
      />
    </label>
  );
}

function AdminEditSelect({ label, name, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </span>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="h-12 w-full rounded-2xl border border-[#E8DFD2] bg-white px-4 text-sm font-semibold text-slate-700 outline-none focus:border-[#1E5B4F]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === "" ? "Ask owner" : option}
          </option>
        ))}
      </select>
    </label>
  );
}

function AdminEditTextarea({ label, name, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </span>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows="4"
        className="w-full rounded-2xl border border-[#E8DFD2] bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#1E5B4F]"
      />
    </label>
  );
}

function RoomEditInput({ label, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-2xl border border-[#E8DFD2] bg-white px-4 text-sm font-bold text-slate-700 outline-none focus:border-[#1E5B4F]"
      />
    </label>
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

function RecommendationScoreBox({ scoreData }) {
  return (
    <div className="rounded-3xl border border-[#E8DFD2] bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-[#1E5B4F]">
            Recommended ranking score
          </p>

          <h3 className="mt-1 text-2xl font-black text-[#070B1F]">
            {scoreData.total}/100
          </h3>

          <p className="mt-1 text-sm font-bold text-slate-600">
            {scoreData.label}
          </p>
        </div>

        <span className="w-fit rounded-full bg-[#F1FAF7] px-3 py-1.5 text-xs font-black text-[#1E5B4F]">
          Admin visibility check
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {scoreData.items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-2xl bg-[#FFF8EF] px-3 py-2 text-sm"
          >
            <span className="font-bold text-slate-700">{item.label}</span>
            <span className="font-black text-[#1E5B4F]">+{item.points}</span>
          </div>
        ))}
      </div>

      {scoreData.missing.length > 0 && (
        <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3">
          <p className="text-xs font-black uppercase tracking-wide text-amber-700">
            Improve visibility
          </p>

          <p className="mt-1 text-sm leading-6 text-amber-800">
            {scoreData.missing.slice(0, 4).join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}

export default AdminListingDetailsModal;