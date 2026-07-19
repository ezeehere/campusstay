import { useEffect, useRef, useState } from "react";
import {
  BedDouble,
  MapPin,
} from "lucide-react";

import SaveListingButton from "../student/SaveListingButton";
import ShareListingButton from "../shared/ShareListingButton";
import { getCloudinaryOptimizedUrl } from "../../utils/cloudinaryImage";

function ListingCard({ listing, onViewDetails }) {
  const images = Array.isArray(listing.images) ? listing.images : [];
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const touchEndY = useRef(0);

  const image = images[activeImageIndex] || "";
  const rent = listing.startingRent || listing.rent || 0;
  const seatsLeft = getTotalSeatsLeft(listing);
  const nearbyText = getNearbyText(listing);
  const pgNote = String(listing.pgNote || "").trim();
  const roomPreview = getRoomPreview(listing);
  const summary = buildHumanPgSummary(listing);
  const shouldShowReadMore = summary.fullText.length > 155;

  useEffect(() => {
    setActiveImageIndex(0);
    setSummaryOpen(false);
  }, [listing.id]);

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setActiveImageIndex((previousIndex) =>
        previousIndex + 1 >= images.length ? 0 : previousIndex + 1
      );
    }, 4000);

    return () => clearInterval(timer);
  }, [images.length]);

  function goToPreviousImage() {
    if (images.length <= 1) return;

    setActiveImageIndex((previousIndex) =>
      previousIndex === 0 ? images.length - 1 : previousIndex - 1
    );
  }

  function goToNextImage() {
    if (images.length <= 1) return;

    setActiveImageIndex((previousIndex) =>
      previousIndex + 1 >= images.length ? 0 : previousIndex + 1
    );
  }

  function handleTouchStart(event) {
    if (!event.touches || event.touches.length === 0) return;

    touchStartX.current = event.touches[0].clientX;
    touchStartY.current = event.touches[0].clientY;
    touchEndX.current = event.touches[0].clientX;
    touchEndY.current = event.touches[0].clientY;
  }

  function handleTouchMove(event) {
    if (!event.touches || event.touches.length === 0) return;

    touchEndX.current = event.touches[0].clientX;
    touchEndY.current = event.touches[0].clientY;
  }

  function handleTouchEnd() {
    const horizontalDistance = touchStartX.current - touchEndX.current;
    const verticalDistance = touchStartY.current - touchEndY.current;

    const minimumSwipeDistance = 45;

    if (Math.abs(horizontalDistance) < minimumSwipeDistance) return;

    if (Math.abs(verticalDistance) > Math.abs(horizontalDistance)) return;

    if (horizontalDistance > 0) {
      goToNextImage();
    } else {
      goToPreviousImage();
    }
  }

  return (
    <article className="overflow-hidden rounded-[1.5rem] border border-[#E8DFD2] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div
        className="relative h-40 overflow-hidden bg-[#F6F1E8] sm:h-44"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {image ? (
          <img
            src={getCloudinaryOptimizedUrl(image, {
              width: 600,
              height: 400,
              crop: "fill",
              quality: "auto:eco",
            })}
            alt={listing.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-bold text-slate-400">
            No image
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {listing.verified && (
            <span className="rounded-full bg-[#E9FFF4] px-2.5 py-1 text-[11px] font-black text-[#16845A]">
              Verified
            </span>
          )}

          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-black ${listing.available
              ? "bg-[#1E5B4F] text-white"
              : "bg-red-50 text-red-700"
              }`}
          >
            {listing.available ? "Available" : "Full"}
          </span>
        </div>

        {pgNote && (
          <div className="absolute right-3 top-3 max-w-[52%] rounded-2xl bg-[#FFF3D6]/95 px-3 py-1.5 text-right text-[11px] font-black leading-4 text-[#92400E] shadow-sm backdrop-blur">
            <span className="line-clamp-2">{pgNote}</span>
          </div>
        )}

        <div className="absolute bottom-3 right-3 rounded-2xl bg-white/95 px-3 py-2 text-right shadow-sm backdrop-blur">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
            starts
          </p>
          <p className="text-lg font-black leading-none text-[#111827]">
            ₹{rent}
          </p>
          <p className="text-[10px] font-semibold text-slate-500">month</p>
        </div>

        <div className="absolute bottom-3 left-3 right-24">
          <p className="text-[11px] font-semibold text-white/80">
            {listing.type || "Stay"} {listing.gender ? `for ${listing.gender}` : ""}
          </p>
          <h3 className="mt-0.5 line-clamp-1 text-lg font-black leading-tight text-white">
            {listing.name || "Unnamed stay"}
          </h3>
        </div>

        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveImageIndex(index)}
                aria-label={`Show image ${index + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  activeImageIndex === index
                    ? "w-5 bg-white"
                    : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start gap-2 text-slate-600">
          <MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" />
          <p className="line-clamp-2 text-sm leading-5">
            <span className="font-bold text-slate-700">
              {listing.area || "Area not added"}
            </span>
            {nearbyText ? (
              <span className="text-slate-500"> · Near {nearbyText}</span>
            ) : null}
          </p>
        </div>

        <div className="mt-3 rounded-3xl bg-[#F8F8F8] p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-slate-500">
              <BedDouble size={15} />
              <p className="text-[10px] font-black uppercase tracking-wide">
                Room availability
              </p>
            </div>

            <p className="text-xs font-black text-[#1E5B4F]">
              {seatsLeft > 0 ? `${seatsLeft} total left` : "Currently full"}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {roomPreview.map((room) => (
              <RoomMini
                key={room.key}
                title={room.title}
                seats={room.seats}
              />
            ))}
          </div>

          {getExtraRoomCount(listing) > 0 && (
            <p className="mt-2 text-xs font-bold text-slate-500">
              +{getExtraRoomCount(listing)} more room option available inside details.
            </p>
          )}
        </div>

        <FacilityPreview facilities={listing.facilities || []} />

        <div className="mt-3 rounded-3xl border border-[#E8DFD2] bg-[#FFF8EF] px-3.5 py-3">
          <p
            className={`text-sm leading-6 text-slate-700 ${
              summaryOpen ? "" : "line-clamp-2"
            }`}
          >
            {summary.parts.map((part, index) =>
              part.highlight ? (
                <span
                  key={`${part.text}-${index}`}
                  className="font-black text-[#1E5B4F]"
                >
                  {part.text}
                </span>
              ) : (
                <span key={`${part.text}-${index}`}>{part.text}</span>
              )
            )}
          </p>

          {shouldShowReadMore && (
            <button
              type="button"
              onClick={() => setSummaryOpen((previous) => !previous)}
              className="mt-1 text-xs font-black text-[#1E5B4F]"
            >
              {summaryOpen ? "Show less" : "Read more"}
            </button>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={onViewDetails}
            className="flex-1 rounded-2xl bg-[#070B1F] px-4 py-3 text-sm font-black text-white transition hover:opacity-95"
          >
            View details
          </button>

          <ShareListingButton listing={listing} />

          <div className="w-14">
            <SaveListingButton listing={listing} showText={false} />
          </div>
        </div>
      </div>
    </article>
  );
}

function FacilityPreview({ facilities }) {
  if (!Array.isArray(facilities) || facilities.length === 0) {
    return null;
  }

  const visibleFacilities = facilities.slice(0, 3);
  const extraCount = Math.max(facilities.length - visibleFacilities.length, 0);

  return (
    <div className="mt-3">
      <p className="mb-2 text-[10px] font-black uppercase tracking-wide text-slate-400">
        Facilities
      </p>

      <div className="flex flex-wrap gap-1.5">
        {visibleFacilities.map((facility) => (
          <span
            key={facility}
            className="rounded-full bg-[#F6F1E8] px-2.5 py-1 text-xs font-black text-slate-600"
          >
            {facility}
          </span>
        ))}

        {extraCount > 0 && (
          <span className="rounded-full bg-[#E9FFF4] px-2.5 py-1 text-xs font-black text-[#1E5B4F]">
            +{extraCount} more
          </span>
        )}
      </div>
    </div>
  );
}

function RoomMini({ title, seats }) {
  return (
    <div className="rounded-2xl bg-white px-2.5 py-2.5 shadow-sm">
      <p className="line-clamp-1 text-[10px] font-black uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-xs font-black text-[#1F2933]">
        {seats > 0 ? `${seats} left` : "Full"}
      </p>
    </div>
  );
}

function getRoomPreview(listing) {
  const roomOptions = Array.isArray(listing.roomOptions)
    ? listing.roomOptions
    : [];

  if (roomOptions.length === 0) {
    return [
      {
        key: "total-seats",
        title: "Seats",
        seats: listing.available ? 1 : 0,
      },
    ];
  }

  return roomOptions.slice(0, 3).map((room, index) => ({
    key: room.id || `${room.title}-${index}`,
    title: getShortRoomTitle(room.title),
    seats: Number(room.availableUnits || 0),
  }));
}

function getExtraRoomCount(listing) {
  if (!Array.isArray(listing.roomOptions)) return 0;

  return Math.max(listing.roomOptions.length - 3, 0);
}

function getShortRoomTitle(title = "") {
  const cleanTitle = String(title).toLowerCase();

  if (cleanTitle.includes("single")) return "Single";
  if (cleanTitle.includes("double")) return "Double";
  if (cleanTitle.includes("triple")) return "Triple";
  if (cleanTitle.includes("four")) return "Four";
  if (cleanTitle.includes("dorm")) return "Dorm";

  return title || "Room";
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

function buildHumanPgSummary(listing) {
  const typeText = listing.type || "stay";
  const genderText = listing.gender
    ? `${listing.gender} students`
    : "students";

  const areaText = listing.area || "near campus";
  const nearbyText = getNearbyText(listing);
  const rent = listing.startingRent || listing.rent || 0;
  const seatsLeft = getTotalSeatsLeft(listing);

  const roomText = getAvailableRoomTypesText(listing);
  const essentialsText = getEssentialsText(listing);

  const parts = [];

  addPart(parts, "Good for ");
  addPart(parts, genderText, true);
  addPart(parts, nearbyText ? " looking near " : " looking for a stay near campus. ");
  if (nearbyText) {
    addPart(parts, nearbyText, true);
    addPart(parts, ". ");
  }

  addPart(parts, "Located in ");
  addPart(parts, areaText, true);
  addPart(parts, `, this ${typeText} `);

  if (roomText) {
    addPart(parts, "has ");
    addPart(parts, roomText, true);
    addPart(parts, " available");
  } else {
    addPart(parts, "has room options available");
  }

  if (seatsLeft > 0) {
    addPart(parts, " with ");
    addPart(
      parts,
      `${seatsLeft} seat${seatsLeft === 1 ? "" : "s"} left`,
      true
    );
    addPart(parts, ". ");
  } else {
    addPart(parts, " and is currently marked ");
    addPart(parts, "full", true);
    addPart(parts, ". ");
  }

  if (essentialsText) {
    addPart(parts, "Nearby places like ");
    addPart(parts, essentialsText, true);
    addPart(parts, " make daily student life easier. ");
  }

  if (rent) {
    addPart(parts, "Rent starts from ");
    addPart(parts, `₹${rent}/month`, true);
    addPart(parts, ".");
  }

  return {
    parts,
    fullText: parts.map((part) => part.text).join(""),
  };
}

function addPart(parts, text, highlight = false) {
  if (!text) return;

  parts.push({
    text,
    highlight,
  });
}

function getAvailableRoomTypesText(listing) {
  if (!Array.isArray(listing.roomOptions) || listing.roomOptions.length === 0) {
    return "";
  }

  const availableRooms = listing.roomOptions
    .filter((room) => Number(room.availableUnits || 0) > 0)
    .map((room) => getShortRoomTitle(room.title));

  const uniqueRooms = Array.from(new Set(availableRooms)).slice(0, 3);

  if (uniqueRooms.length === 0) return "";

  if (uniqueRooms.length === 1) return `${uniqueRooms[0]} room`;

  if (uniqueRooms.length === 2) {
    return `${uniqueRooms[0]} and ${uniqueRooms[1]} rooms`;
  }

  return `${uniqueRooms.slice(0, -1).join(", ")} and ${
    uniqueRooms[uniqueRooms.length - 1]
  } rooms`;
}



function getEssentialsText(listing) {
  if (
    !Array.isArray(listing.nearbyEssentials) ||
    listing.nearbyEssentials.length === 0
  ) {
    return "";
  }

  return listing.nearbyEssentials.slice(0, 2).join(" and ");
}

export default ListingCard;