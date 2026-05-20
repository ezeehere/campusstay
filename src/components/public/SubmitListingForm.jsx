import { useState } from "react";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Send,
  UploadCloud,
} from "lucide-react";

import { addPendingListing } from "../../firebase/listings";
import { uploadImagesToCloudinary } from "../../cloudinary/uploadImages";

const initialFormData = {
  name: "",
  type: "PG",
  gender: "Boys",
  rent: "",
  deposit: "",
  area: "",
  distance: "",
  food: "Yes",
  foodDetails: "",
  roomType: "",
  facilities: "",
  rules: "",
  ownerName: "",
  phone: "",
  mapLink: "",
};

function generateTrackingId() {
  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `CS-${randomPart}`;
}

function SubmitListingForm() {
  const [formData, setFormData] = useState(initialFormData);
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

  function handleImageChange(event) {
    const files = Array.from(event.target.files);

    if (files.length > 5) {
      alert("You can upload maximum 5 images.");
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

    const trackingId = generateTrackingId();

    const listingData = {
      ...formData,
      rent: Number(formData.rent),
      deposit: Number(formData.deposit || 0),
      food: formData.food === "Yes",
      facilities: formData.facilities
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      rules: formData.rules
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      approved: false,
      verified: false,
      available: true,
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

            <h3 className="text-2xl font-black text-emerald-950">
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
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">
              Current status
            </p>
            <p className="mt-1 text-xl font-black text-amber-700">
              Pending Review
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <SuccessBox label="Tracking ID" value={submittedInfo.trackingId} />
          <SuccessBox label="Phone number" value={submittedInfo.phone} />
        </div>

        <div className="mt-4 rounded-3xl border border-emerald-200 bg-white p-4">
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">
            Tracking link
          </p>

          <p className="mt-2 break-all rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
            {submittedInfo.trackingLink}
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <button
              onClick={() => copyTrackingLink(submittedInfo.trackingLink)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
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
          label="Monthly rent"
          name="rent"
          type="number"
          value={formData.rent}
          onChange={handleChange}
          placeholder="Example: 4500"
          required
        />

        <InputField
          label="Deposit"
          name="deposit"
          type="number"
          value={formData.deposit}
          onChange={handleChange}
          placeholder="Example: 1000"
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
      
        <SelectField
          label="Room type"
          name="roomType"
          value={formData.roomType}
          onChange={handleChange}
          options={["Shared", "Single"]}
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
            Upload up to 5 images
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
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
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
        className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
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
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-lg font-black text-slate-950">
        {value}
      </p>
    </div>
  );
}

export default SubmitListingForm;