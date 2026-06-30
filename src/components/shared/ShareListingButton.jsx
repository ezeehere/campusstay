import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { trackListingInteraction } from "../../firebase/analytics";

function ShareListingButton({
  listing,
  variant = "icon",
  className = "",
  label = "Share",
}) {
  const [copied, setCopied] = useState(false);

  if (!listing?.id) return null;

  const shareUrl = `${window.location.origin}/listing/${listing.id}`;
  const shareText = buildShareText(listing);

  async function handleShare(event) {
    event?.stopPropagation?.();

    try {
      await trackListingInteraction("share_click", listing, "shareClicks");
    } catch (error) {
      console.error("Share analytics failed:", error);
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: listing.name || "CampusStay listing",
          text: shareText,
          url: shareUrl,
        });
        return;
      }

      await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (error) {
      console.error("Share failed:", error);
    }
  }

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={handleShare}
        className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1E5B4F] px-4 py-3 text-sm font-black text-white transition hover:bg-[#123C35] ${className}`}
      >
        {copied ? <Check size={17} /> : <Share2 size={17} />}
        {copied ? "Copied" : label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#E8DFD2] bg-white text-[#1E5B4F] shadow-sm transition hover:bg-[#F6F1E8] ${className}`}
      title="Share listing"
    >
      {copied ? <Check size={18} /> : <Share2 size={18} />}
    </button>
  );
}

function buildShareText(listing) {
  const rent = listing.startingRent || listing.rent || 0;
  const seatsLeft = getTotalSeatsLeft(listing);
  const nearbyText = getNearbyText(listing);

  return [
    "Check this PG/Room on CampusStay:",
    "",
    listing.name || "PG/Room listing",
    listing.area ? `Area: ${listing.area}` : "",
    rent ? `Rent starts from ₹${rent}/month` : "",
    seatsLeft > 0 ? `Seats left: ${seatsLeft}` : "Currently fully booked",
    nearbyText ? `Near: ${nearbyText}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function getTotalSeatsLeft(listing) {
  if (!Array.isArray(listing.roomOptions)) return listing.available ? 1 : 0;

  return listing.roomOptions.reduce(
    (sum, room) => sum + Number(room.availableUnits || 0),
    0
  );
}

function getNearbyText(listing) {
  if (
    Array.isArray(listing.nearbyInstitutions) &&
    listing.nearbyInstitutions.length > 0
  ) {
    return listing.nearbyInstitutions.join(", ");
  }

  return listing.nearbyInstitutionText || listing.nearbyCollege || "";
}

export default ShareListingButton;
