import { useState } from "react";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Plus,
  Send,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

import { addPendingListing } from "../../firebase/listings";
import { uploadImagesToCloudinary } from "../../cloudinary/uploadImages";
import { auth } from "../../firebase/config";

const NEARBY_INSTITUTIONS = [
  "JIST",
  "JEC",
  "Kaziranga ITI",
  "Ayush Pharmacy",
];

const PREDEFINED_FACILITIES = [
  "Wi-Fi",
  "Food",
  "Attached Bathroom",
  "Parking",
  "Laundry",
  "Drinking Water",
  "Power Backup",
  "Study Table",
  "CCTV",
];

const MIN_IMAGES = 3;
const MAX_IMAGES = 15;

const NEARBY_ESSENTIALS = [
  "Market nearby",
  "Bus stop nearby",
  "Food shops nearby",
  "Pharmacy nearby",
  "Stationery nearby",
  "ATM nearby",
  "Medical store nearby",
  "Public transport nearby",
];

const YES_NO_OPTIONS = ["Yes", "No"];
const RULE_OPTIONS = ["Yes", "No", "With permission"];

const CONTACT_PERSON_OPTIONS = [
  "Owner",
  "Caretaker",
  "Manager",
  "Family member",
];

const initialFormData = {
  name: "",
  type: "PG",
  gender: "Boys",
  area: "",
  pgNote: "",
  nearbyInstitutions: [],
  food: "Yes",
  foodDetails: "",
  facilities: [],
  customFacility: "",
  rules: "",
  ownerName: "",
  phone: "",
  contactPerson: "Owner",
  alternatePhone: "",
  alternateContactPerson: "Caretaker",
  mapLink: "",

  availableFrom: "",
  moveInNote: "",

  electricityIncluded: "Yes",
  electricityCharge: "",
  otherCharges: "",

  entryTime: "",
  visitorsAllowed: "With permission",
  parentsAllowed: "Yes",
  smokingAllowed: "No",
  gentsAllowed: "No",
  girlsAllowed: "Yes",
  idProofRequired: "Yes",

  nearbyEssentials: [],
  customEssential: "",
};

const initialRoomOption = {
  title: "Single Room",
  rent: "",
  deposit: "",
  availableUnits: "",
  note: "",
};

function generateTrackingId() {
  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `CS-${randomPart}`;
}

function SubmitListingForm({ ownerMode = false }) {
  const [formData, setFormData] = useState(initialFormData);
  const [roomOptions, setRoomOptions] = useState([{ ...initialRoomOption }]);
  const [imageFiles, setImageFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submittedInfo, setSubmittedInfo] = useState(null);
  const [copied, setCopied] = useState(false);

  const imagePreviews = imageFiles.map((file) => URL.createObjectURL(file));

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  function toggleNearbyInstitution(institution) {
    setFormData((previousData) => {
      const selected = previousData.nearbyInstitutions.includes(institution);

      return {
        ...previousData,
        nearbyInstitutions: selected
          ? previousData.nearbyInstitutions.filter((item) => item !== institution)
          : [...previousData.nearbyInstitutions, institution],
      };
    });
  }

  function toggleFacility(facility) {
    setFormData((previousData) => {
      const selected = previousData.facilities.includes(facility);

      return {
        ...previousData,
        facilities: selected
          ? previousData.facilities.filter((item) => item !== facility)
          : [...previousData.facilities, facility],
      };
    });
  }

  function addCustomFacility() {
    const cleanFacility = formData.customFacility.trim();

    if (!cleanFacility) return;

    if (formData.facilities.includes(cleanFacility)) {
      setFormData((previousData) => ({
        ...previousData,
        customFacility: "",
      }));
      return;
    }

    setFormData((previousData) => ({
      ...previousData,
      facilities: [...previousData.facilities, cleanFacility],
      customFacility: "",
    }));
  }

  function removeFacility(facility) {
    setFormData((previousData) => ({
      ...previousData,
      facilities: previousData.facilities.filter((item) => item !== facility),
    }));
  }

  function toggleNearbyEssential(essential) {
    setFormData((previousData) => {
      const selected = previousData.nearbyEssentials.includes(essential);

      return {
        ...previousData,
        nearbyEssentials: selected
          ? previousData.nearbyEssentials.filter((item) => item !== essential)
          : [...previousData.nearbyEssentials, essential],
      };
    });
  }

  function addCustomEssential() {
    const cleanEssential = formData.customEssential.trim();

    if (!cleanEssential) return;

    if (formData.nearbyEssentials.includes(cleanEssential)) {
      setFormData((previousData) => ({
        ...previousData,
        customEssential: "",
      }));
      return;
    }

    setFormData((previousData) => ({
      ...previousData,
      nearbyEssentials: [...previousData.nearbyEssentials, cleanEssential],
      customEssential: "",
    }));
  }

  function removeNearbyEssential(essential) {
    setFormData((previousData) => ({
      ...previousData,
      nearbyEssentials: previousData.nearbyEssentials.filter(
        (item) => item !== essential
      ),
    }));
  }

  function handleRoomOptionChange(index, event) {
    const { name, value } = event.target;

    setRoomOptions((previousOptions) =>
      previousOptions.map((room, roomIndex) =>
        roomIndex === index
          ? {
            ...room,
            [name]: value,
          }
          : room
      )
    );
  }

  function addRoomOption() {
    setRoomOptions((previousOptions) => [
      ...previousOptions,
      {
        title: "Double Sharing",
        rent: "",
        deposit: "",
        availableUnits: "",
        note: "",
      },
    ]);
  }

  function removeRoomOption(index) {
    if (roomOptions.length === 1) {
      alert("At least one room option is required.");
      return;
    }

    setRoomOptions((previousOptions) =>
      previousOptions.filter((_, roomIndex) => roomIndex !== index)
    );
  }

  function handleImageChange(event) {
    const files = Array.from(event.target.files);

    if (files.length > MAX_IMAGES) {
      alert(`You can upload maximum ${MAX_IMAGES} images.`);
      return;
    }

    setImageFiles(files);
  }

  function removeImage(index) {
    setImageFiles((previousFiles) =>
      previousFiles.filter((_, fileIndex) => fileIndex !== index)
    );
  }

  async function copyTrackingLink(link) {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Copy failed:", error);
      alert("Could not copy link. Please copy it manually.");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (formData.nearbyInstitutions.length === 0) {
      alert("Please select at least one nearby institution.");
      return;
    }

    if (imageFiles.length < MIN_IMAGES) {
      alert(`Please upload at least ${MIN_IMAGES} clear photos.`);
      return;
    }

    if (!formData.facilities.length) {
      alert("Please select at least one facility.");
      return;
    }

    const cleanRoomOptions = roomOptions.map((room, index) => ({
      id: `room-${index + 1}`,
      title: room.title.trim(),
      rent: Number(room.rent || 0),
      deposit: Number(room.deposit || 0),
      availableUnits: Number(room.availableUnits || 0),
      available: Number(room.availableUnits || 0) > 0,
      note: room.note.trim(),
    }));

    const hasInvalidRoom = cleanRoomOptions.some(
      (room) => !room.title || !room.rent
    );

    if (hasInvalidRoom) {
      alert("Please fill room type and rent for every room option.");
      return;
    }

    const startingRent = Math.min(...cleanRoomOptions.map((room) => room.rent));
    const hasAvailableRoom = cleanRoomOptions.some((room) => room.available);
    const trackingId = generateTrackingId();

    const listingData = {
      name: formData.name.trim(),
      type: formData.type,
      gender: formData.gender,
      area: formData.area.trim(),
      pgNote: formData.pgNote.trim(),

      nearbyInstitutions: formData.nearbyInstitutions,
      nearbyCollege: formData.nearbyInstitutions[0] || "",
      nearbyInstitutionText: formData.nearbyInstitutions.join(", "),

      food: formData.food === "Yes",
      foodIncluded: formData.food === "Yes",
      foodDetails: formData.foodDetails.trim(),

      facilities: formData.facilities,
      rules: formData.rules
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),

      ownerName: formData.ownerName.trim(),
      phone: formData.phone.trim(),
      contactPerson: formData.contactPerson || "Owner",

      alternatePhone: formData.alternatePhone.trim(),
      alternateContactPerson: formData.alternatePhone.trim()
        ? formData.alternateContactPerson || "Caretaker"
        : "",
      mapLink: formData.mapLink.trim(),

      ownerId: auth.currentUser?.uid || "",
      ownerEmail: auth.currentUser?.email || "",

      availableFrom: formData.availableFrom,
      moveInNote: formData.moveInNote.trim(),

      electricityIncluded: formData.electricityIncluded === "Yes",
      electricityCharge: Number(formData.electricityCharge || 0),
      otherCharges: formData.otherCharges.trim(),

      structuredRules: {
        entryTime: formData.entryTime.trim(),
        visitorsAllowed: formData.visitorsAllowed,
        parentsAllowed: formData.parentsAllowed,
        smokingAllowed: formData.smokingAllowed,
        gentsAllowed: formData.gentsAllowed,
        girlsAllowed: formData.girlsAllowed,
        idProofRequired: formData.idProofRequired,
      },

      nearbyEssentials: formData.nearbyEssentials,

      roomOptions: cleanRoomOptions,
      startingRent,

      rent: startingRent,
      deposit: cleanRoomOptions[0]?.deposit || 0,
      roomType: cleanRoomOptions.map((room) => room.title).join(" / "),

      approved: false,
      verified: false,
      available: hasAvailableRoom,
      status: "pending",
      trackingId,
      adminNote: "",
      submittedAt: new Date().toISOString(),
    };

    try {
      setSubmitting(true);

      const imageUrls = await uploadImagesToCloudinary(imageFiles);

      const listingId = await addPendingListing({
        ...listingData,
        images: imageUrls,
      });

      const trackingLink = `${window.location.origin}/check-status?trackingId=${trackingId}&phone=${listingData.phone}`;

      setSubmittedInfo({
        listingId,
        trackingId,
        phone: listingData.phone,
        trackingLink,
        listingName: listingData.name,
      });

      setFormData(initialFormData);
      setRoomOptions([{ ...initialRoomOption }]);
      setImageFiles([]);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("Error submitting listing:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submittedInfo) {
    return (
      <div className="mt-8 rounded-[2rem] border border-emerald-200 bg-emerald-50 p-5 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-600 text-white">
              <CheckCircle2 size={28} />
            </div>

            <h3 className="text-2xl font-extrabold text-emerald-950">
              Your listing is submitted and under review.
            </h3>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-800">
              We received your listing for{" "}
              <span className="font-bold">{submittedInfo.listingName}</span>.
              It is not public yet. Admin will review it, and you can check the
              status anytime using the tracking details below.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-4 shadow-sm lg:min-w-72">
            <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">
              Current status
            </p>
            <p className="mt-1 text-xl font-extrabold text-amber-700">
              Pending Review
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <SuccessBox label="Tracking ID" value={submittedInfo.trackingId} />
          <SuccessBox label="Phone number" value={submittedInfo.phone} />
        </div>

        <div className="mt-4 rounded-3xl border border-emerald-200 bg-white p-4">
          <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">
            Tracking link
          </p>

          <p className="mt-2 break-all rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
            {submittedInfo.trackingLink}
          </p>

          <div className={`mt-4 grid gap-3 ${ownerMode ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3"}`}>
            <button
              type="button"
              onClick={() => copyTrackingLink(submittedInfo.trackingLink)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#1E5B4F] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#123C35]"
            >
              <Copy size={16} />
              {copied ? "Copied" : "Copy link"}
            </button>

            <a
              href={submittedInfo.trackingLink}
              className="flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
            >
              <ExternalLink size={16} />
              Check status
            </a>

            {ownerMode && (
              <a
                href="/owner/dashboard"
                className="flex items-center justify-center gap-2 rounded-2xl bg-[#1E5B4F] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#123C35]"
              >
                Go to Owner Dashboard
              </a>
            )}

            <button
              type="button"
              onClick={() => setSubmittedInfo(null)}
              className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
            >
              Submit another
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-3xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm leading-6 text-amber-800">
            Save your Tracking ID and phone number. You will need both to check
            your listing status later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
      <section className="rounded-[2rem] border border-[#E8DFD2] bg-white p-4 shadow-sm sm:p-5">
        <h3 className="text-xl font-extrabold text-[#1F2933]">
          Basic listing details
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Add clear details so students can trust your PG or room.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <InputField
            label="PG / Room name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Example: Green View Boys PG"
            required
          />

          <InputField
            label="Owner name"
            name="ownerName"
            value={formData.ownerName}
            onChange={handleChange}
            placeholder="Owner name"
            required
          />

          <SelectField
            label="Type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            options={["PG", "Room", "Hostel"]}
            required
          />

          <SelectField
            label="For"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            options={["Boys", "Girls", "Co-ed"]}
            required
          />

          <InputField
            label="Area / Locality"
            name="area"
            value={formData.area}
            onChange={handleChange}
            placeholder="Example: Sotai, JIST Gate, Tarajan"
            required
          />

          <InputField
            label="PG note optional"
            name="pgNote"
            value={formData.pgNote}
            onChange={handleChange}
            placeholder="Example: Advance ₹5000, Self-cooking allowed"
            helper="Short note shown on the listing card. Keep it under 40 characters."
          />

          <InputField
            label="Phone / WhatsApp number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="10 digit number"
            required
          />

          <SelectField
            label="Who will answer primary number?"
            name="contactPerson"
            value={formData.contactPerson}
            onChange={handleChange}
            options={CONTACT_PERSON_OPTIONS}
          />

          <InputField
            label="Second phone number optional"
            name="alternatePhone"
            value={formData.alternatePhone}
            onChange={handleChange}
            placeholder="Example: caretaker or manager number"
          />

          <SelectField
            label="Who will answer second number?"
            name="alternateContactPerson"
            value={formData.alternateContactPerson}
            onChange={handleChange}
            options={CONTACT_PERSON_OPTIONS}
          />

          <SelectField
            label="Food available?"
            name="food"
            value={formData.food}
            onChange={handleChange}
            options={["Yes", "No"]}
            required
          />

          <InputField
            label="Google Maps link"
            name="mapLink"
            value={formData.mapLink}
            onChange={handleChange}
            placeholder="Paste map link"
          />

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Nearby institution <span className="text-red-600">*</span>
            </label>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {NEARBY_INSTITUTIONS.map((institution) => {
                const selected =
                  formData.nearbyInstitutions.includes(institution);

                return (
                  <button
                    key={institution}
                    type="button"
                    onClick={() => toggleNearbyInstitution(institution)}
                    className={`rounded-2xl border px-4 py-3 text-sm font-bold transition ${selected
                      ? "border-[#1E5B4F] bg-[#1E5B4F] text-white"
                      : "border-[#E8DFD2] bg-[#FFF8EF] text-slate-700 hover:bg-[#F6F1E8]"
                      }`}
                  >
                    {institution}
                  </button>
                );
              })}
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Select one or more institutions this stay is useful for.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-[#E8DFD2] bg-[#FFF8EF] p-4 sm:p-5">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-xl font-extrabold text-[#1F2933]">
              Room options
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Add single, double, triple, or other sharing options available.
            </p>
          </div>

          <button
            type="button"
            onClick={addRoomOption}
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#1E5B4F] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#123C35]"
          >
            <Plus size={16} />
            Add room option
          </button>
        </div>

        <div className="grid gap-4">
          {roomOptions.map((room, index) => (
            <div
              key={index}
              className="rounded-3xl border border-[#E8DFD2] bg-white p-4 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <h4 className="font-bold text-[#1F2933]">
                  Room option {index + 1}
                </h4>

                <button
                  type="button"
                  onClick={() => removeRoomOption(index)}
                  className="flex items-center gap-1 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100"
                >
                  <Trash2 size={14} />
                  Remove
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <SelectField
                  label="Room type"
                  name="title"
                  value={room.title}
                  onChange={(event) => handleRoomOptionChange(index, event)}
                  options={[
                    "Single Room",
                    "Double Sharing",
                    "Triple Sharing",
                    "Four Sharing",
                    "Dormitory",
                    "Other",
                  ]}
                  required
                />

                <InputField
                  label="Monthly rent"
                  name="rent"
                  type="number"
                  value={room.rent}
                  onChange={(event) => handleRoomOptionChange(index, event)}
                  placeholder="Example: 4500"
                  required
                />

                <InputField
                  label="Advance / Deposit"
                  name="deposit"
                  type="number"
                  value={room.deposit}
                  onChange={(event) => handleRoomOptionChange(index, event)}
                  placeholder="Example: 1000"
                />

                <InputField
                  label="Seats left"
                  name="availableUnits"
                  type="number"
                  value={room.availableUnits}
                  onChange={(event) => handleRoomOptionChange(index, event)}
                  placeholder="Example: 3"
                />

                <InputField
                  label="Note"
                  name="note"
                  value={room.note}
                  onChange={(event) => handleRoomOptionChange(index, event)}
                  placeholder="Example: Two students per room"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-[#E8DFD2] bg-white p-4 shadow-sm sm:p-5">
        <h3 className="text-xl font-extrabold text-[#1F2933]">
          Availability and charges
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Help students understand when they can move in and what extra costs exist.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <InputField
            label="Available from"
            name="availableFrom"
            type="date"
            value={formData.availableFrom}
            onChange={handleChange}
          />

          <InputField
            label="Move-in note"
            name="moveInNote"
            value={formData.moveInNote}
            onChange={handleChange}
            placeholder="Example: Available immediately"
          />

          <SelectField
            label="Electricity included?"
            name="electricityIncluded"
            value={formData.electricityIncluded}
            onChange={handleChange}
            options={YES_NO_OPTIONS}
          />

          <InputField
            label="Electricity charge"
            name="electricityCharge"
            type="number"
            value={formData.electricityCharge}
            onChange={handleChange}
            placeholder="Example: 500"
          />

          <div className="md:col-span-2">
            <InputField
              label="Other charges"
              name="otherCharges"
              value={formData.otherCharges}
              onChange={handleChange}
              placeholder="Example: Gas ₹300/month, maintenance ₹200"
            />
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-[#E8DFD2] bg-white p-4 shadow-sm sm:p-5">
        <h3 className="text-xl font-extrabold text-[#1F2933]">
          Food and facilities
        </h3>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Food details
          </label>
          <textarea
            name="foodDetails"
            value={formData.foodDetails}
            onChange={handleChange}
            placeholder={
              formData.food === "Yes"
                ? "Example: Breakfast and dinner included"
                : "Example: No food provided"
            }
            rows="3"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-400"
          />
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Facilities <span className="text-red-600">*</span>
          </label>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {PREDEFINED_FACILITIES.map((facility) => {
              const selected = formData.facilities.includes(facility);

              return (
                <button
                  key={facility}
                  type="button"
                  onClick={() => toggleFacility(facility)}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm font-bold transition ${selected
                    ? "border-[#1E5B4F] bg-[#1E5B4F] text-white"
                    : "border-[#E8DFD2] bg-[#FFF8EF] text-slate-700 hover:bg-[#F6F1E8]"
                    }`}
                >
                  {facility}
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              name="customFacility"
              value={formData.customFacility}
              onChange={handleChange}
              placeholder="Add custom facility e.g. Geyser, Balcony"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-slate-400"
            />

            <button
              type="button"
              onClick={addCustomFacility}
              className="rounded-2xl bg-[#1E5B4F] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#123C35]"
            >
              Add facility
            </button>
          </div>

          {formData.facilities.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {formData.facilities.map((facility) => (
                <button
                  key={facility}
                  type="button"
                  onClick={() => removeFacility(facility)}
                  className="inline-flex items-center gap-1 rounded-full bg-[#F6F1E8] px-3 py-1.5 text-xs font-bold text-slate-700"
                >
                  {facility}
                  <X size={12} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-5">
          <InputField
            label="Rules"
            name="rules"
            value={formData.rules}
            onChange={handleChange}
            placeholder="Example: Entry before 9 PM, No smoking, ID proof required"
            helper="Separate each rule using comma."
          />
        </div>
      </section>

      <section className="rounded-[2rem] border border-[#E8DFD2] bg-white p-4 shadow-sm sm:p-5">
        <h3 className="text-xl font-extrabold text-[#1F2933]">
          Rules and safety
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Structured rules reduce unnecessary calls and confusion.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <InputField
            label="Entry time"
            name="entryTime"
            value={formData.entryTime}
            onChange={handleChange}
            placeholder="Example: 10:00 PM"
          />

          <SelectField
            label="Visitors allowed?"
            name="visitorsAllowed"
            value={formData.visitorsAllowed}
            onChange={handleChange}
            options={RULE_OPTIONS}
          />

          <SelectField
            label="Parents allowed?"
            name="parentsAllowed"
            value={formData.parentsAllowed}
            onChange={handleChange}
            options={YES_NO_OPTIONS}
          />

          <SelectField
            label="Smoking allowed?"
            name="smokingAllowed"
            value={formData.smokingAllowed}
            onChange={handleChange}
            options={YES_NO_OPTIONS}
          />

          <SelectField
            label="Gents allowed?"
            name="gentsAllowed"
            value={formData.gentsAllowed}
            onChange={handleChange}
            options={RULE_OPTIONS}
          />

          <SelectField
            label="Girls allowed?"
            name="girlsAllowed"
            value={formData.girlsAllowed}
            onChange={handleChange}
            options={RULE_OPTIONS}
          />

          <SelectField
            label="ID proof required?"
            name="idProofRequired"
            value={formData.idProofRequired}
            onChange={handleChange}
            options={YES_NO_OPTIONS}
          />
        </div>
      </section>

      <section className="rounded-[2rem] border border-[#E8DFD2] bg-white p-4 shadow-sm sm:p-5">
        <h3 className="text-xl font-extrabold text-[#1F2933]">
          Nearby essentials
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Add useful nearby places students care about.
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {NEARBY_ESSENTIALS.map((essential) => {
            const selected = formData.nearbyEssentials.includes(essential);

            return (
              <button
                key={essential}
                type="button"
                onClick={() => toggleNearbyEssential(essential)}
                className={`rounded-2xl border px-4 py-3 text-left text-sm font-bold transition ${
                  selected
                    ? "border-[#1E5B4F] bg-[#1E5B4F] text-white"
                    : "border-[#E8DFD2] bg-[#FFF8EF] text-slate-700 hover:bg-[#F6F1E8]"
                }`}
              >
                {essential}
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            name="customEssential"
            value={formData.customEssential}
            onChange={handleChange}
            placeholder="Add custom nearby place e.g. Gym nearby"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-slate-400"
          />

          <button
            type="button"
            onClick={addCustomEssential}
            className="rounded-2xl bg-[#1E5B4F] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#123C35]"
          >
            Add
          </button>
        </div>

        {formData.nearbyEssentials.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {formData.nearbyEssentials.map((essential) => (
              <button
                key={essential}
                type="button"
                onClick={() => removeNearbyEssential(essential)}
                className="inline-flex items-center gap-1 rounded-full bg-[#F6F1E8] px-3 py-1.5 text-xs font-bold text-slate-700"
              >
                {essential}
                <X size={12} />
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-[2rem] border border-[#E8DFD2] bg-white p-4 shadow-sm sm:p-5">
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Upload images <span className="text-red-600">*</span>
        </label>

        <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center transition hover:bg-slate-100">
          <UploadCloud size={28} className="text-slate-500" />

          <span className="mt-2 text-sm font-semibold text-slate-700">
            Upload 3 to 15 images
          </span>

          <span className="mt-1 text-xs text-slate-500">
            At least 3 clear photos are required: room, outside/building, and
            bathroom/common area.
          </span>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="hidden"
          />
        </label>

        <p
          className={`mt-2 text-sm font-bold ${imageFiles.length >= MIN_IMAGES ? "text-[#1E5B4F]" : "text-red-600"
            }`}
        >
          {imageFiles.length}/{MIN_IMAGES} required photos uploaded
        </p>

        {imageFiles.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {imagePreviews.map((preview, index) => (
              <div
                key={preview}
                className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
              >
                <img
                  src={preview}
                  alt={`Selected upload ${index + 1}`}
                  className="h-28 w-full object-cover"
                />

                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-600 shadow-sm"
                >
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <button
        type="submit"
        disabled={submitting}
        className="flex items-center justify-center gap-2 rounded-2xl bg-[#1E5B4F] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#123C35] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Send size={17} />
        {submitting ? "Submitting..." : "Submit for review"}
      </button>
    </form>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  helper,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-600">*</span>}
      </label>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-slate-400"
      />

      {helper && <p className="mt-1 text-xs text-slate-500">{helper}</p>}
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-600">*</span>}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

function SuccessBox({ label, value }) {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm">
      <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-lg font-extrabold text-slate-950">
        {value}
      </p>
    </div>
  );
}

export default SubmitListingForm;
