import { useState } from "react";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Plus,
  Send,
  Trash2,
  UploadCloud,
} from "lucide-react";

import { addPendingListing } from "../../firebase/listings";
import { uploadImagesToCloudinary } from "../../cloudinary/uploadImages";
import { auth } from "../../firebase/config";

const initialFormData = {
  name: "",
  type: "PG",
  gender: "Boys",
  area: "",
  distance: "",
  food: "Yes",
  foodDetails: "",
  facilities: "",
  rules: "",
  ownerName: "",
  phone: "",
  mapLink: "",
};

const initialRoomOption = {
  title: "Single Room",
  rent: "",
  deposit: "",
  capacity: "1",
  availableUnits: "",
  note: "",
};

function generateTrackingId() {
  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `CS-${randomPart}`;
}

function SubmitListingForm() {
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
        capacity: "2",
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

    if (files.length > 10) {
      alert("You can upload maximum 10 images.");
      return;
    }

    setImageFiles(files);
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

    const cleanRoomOptions = roomOptions.map((room, index) => ({
      id: `room-${index + 1}`,
      title: room.title.trim(),
      rent: Number(room.rent || 0),
      deposit: Number(room.deposit || 0),
      capacity: Number(room.capacity || 1),
      availableUnits: Number(room.availableUnits || 0),
      available: Number(room.availableUnits || 0) > 0,
      note: room.note.trim(),
    }));

    const hasInvalidRoom = cleanRoomOptions.some(
      (room) => !room.title || !room.rent || !room.capacity
    );

    if (hasInvalidRoom) {
      alert("Please fill room type, rent, and capacity for every room option.");
      return;
    }

    const startingRent = Math.min(...cleanRoomOptions.map((room) => room.rent));

    const trackingId = generateTrackingId();

    const listingData = {
      ...formData,
      ownerId: auth.currentUser?.uid || "",
      ownerEmail: auth.currentUser?.email || "",
      food: formData.food === "Yes",
      facilities: formData.facilities
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      rules: formData.rules
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),

      roomOptions: cleanRoomOptions,
      startingRent,

      // Backward compatible fields
      rent: startingRent,
      deposit: cleanRoomOptions[0]?.deposit || 0,
      roomType: cleanRoomOptions.map((room) => room.title).join(" / "),

      approved: false,
      verified: false,
      available: cleanRoomOptions.some((room) => room.available),
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

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <button
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

            <button
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
      <div className="grid gap-4 md:grid-cols-2">
        <InputField
          label="PG/Room name"
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
        />

        <SelectField
          label="For"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          options={["Boys", "Girls", "Co-ed"]}
        />

        <InputField
          label="Area"
          name="area"
          value={formData.area}
          onChange={handleChange}
          placeholder="Example: Sotai"
          required
        />

        <InputField
          label="Distance from JIST"
          name="distance"
          value={formData.distance}
          onChange={handleChange}
          placeholder="Example: 1.2 km from JIST"
          required
        />

        <SelectField
          label="Food available?"
          name="food"
          value={formData.food}
          onChange={handleChange}
          options={["Yes", "No"]}
        />

        <InputField
          label="Phone / WhatsApp number"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="10 digit number"
          required
        />

        <InputField
          label="Google Maps link"
          name="mapLink"
          value={formData.mapLink}
          onChange={handleChange}
          placeholder="Paste map link"
        />
      </div>

      <section className="rounded-[2rem] border border-[#E8DFD2] bg-[#FFF8EF] p-4 sm:p-5">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-xl font-extrabold text-[#1F2933]">
              Room options
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Add single, double, triple, or other sharing options available in
              this PG.
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
                  label="Advance"
                  name="deposit"
                  type="number"
                  value={room.deposit}
                  onChange={(event) => handleRoomOptionChange(index, event)}
                  placeholder="Example: 1000"
                />

                <InputField
                  label="Capacity"
                  name="capacity"
                  type="number"
                  value={room.capacity}
                  onChange={(event) => handleRoomOptionChange(index, event)}
                  placeholder="Example: 2"
                  required
                />

                <InputField
                  label="Available rooms/seats"
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

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Food details
        </label>
        <textarea
          name="foodDetails"
          value={formData.foodDetails}
          onChange={handleChange}
          placeholder="Example: Breakfast and dinner included"
          rows="3"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-400"
        />
      </div>

      <InputField
        label="Facilities"
        name="facilities"
        value={formData.facilities}
        onChange={handleChange}
        placeholder="Example: WiFi, Bed, Table, Water, Parking"
        helper="Separate each facility using comma."
      />

      <InputField
        label="Rules"
        name="rules"
        value={formData.rules}
        onChange={handleChange}
        placeholder="Example: Entry before 9 PM, No smoking, ID proof required"
        helper="Separate each rule using comma."
      />

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Upload images
        </label>

        <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center transition hover:bg-slate-100">
          <UploadCloud size={28} className="text-slate-500" />

          <span className="mt-2 text-sm font-semibold text-slate-700">
            Upload up to 10 images
          </span>

          <span className="mt-1 text-xs text-slate-500">
            Room, outside view, bathroom, food area, common area
          </span>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="hidden"
          />
        </label>

        {imageFiles.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5">
            {imagePreviews.map((preview, index) => (
              <div
                key={preview}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
              >
                <img
                  src={preview}
                  alt={`Selected upload ${index + 1}`}
                  className="h-24 w-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

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

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
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