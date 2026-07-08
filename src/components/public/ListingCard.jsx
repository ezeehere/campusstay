import { useEffect, useRef, useState } from "react";
import {
  BedDouble,
  MapPin,
} from "lucide-react";

import SaveListingButton from "../student/SaveListingButton";
import ShareListingButton from "../shared/ShareListingButton";

function ListingCard({ listing, onViewDetails }) {
  const images = Array.isArray(listing.images) ? listing.images : [];
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const image = images[activeImageIndex] || "";
  const rent = listing.startingRent || listing.rent || 0;
  const seatsLeft = getTotalSeatsLeft(listing);
  const nearbyText = getNearbyText(listing);
  const pgNote = String(listing.pgNote || "").trim();
  const roomPreview = getRoomPreview(listing);
  const summary = buildPgSummary(listing);
  const shouldShowReadMore = summary.length > 145;

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
    touchStartX.current = event.touches[0].clientX;
    touchEndX.current = event.touches[0].clientX;
  }

  function handleTouchMove(event) {
    touchEndX.current = event.touches[0].clientX;
  }

  function handleTouchEnd() {
    const swipeDistance = touchStartX.current - touchEndX.current;
    const minimumSwipeDistance = 45;

    if (Math.abs(swipeDistance) < minimumSwipeDistance) return;

    if (swipeDistance > 0) {
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
            src={image}
            alt={listing.name}
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

        <div className="mt-3 rounded-3xl border border-[#E8DFD2] bg-[#FFF8EF] px-3.5 py-3">
          <p
            className={`text-sm leading-6 text-slate-700 ${summaryOpen ? "" : "line-clamp-3"
              }`}
          >
            {summary}
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

function buildPgSummary(listing) {
  const typeText = listing.type || "stay";
  const genderText = listing.gender ? `for ${listing.gender}` : "for students";
  const areaText = listing.area ? `in ${listing.area}` : "near campus";
  const nearbyText = getNearbyText(listing);
  const rent = listing.startingRent || listing.rent || 0;
  const seatsLeft = getTotalSeatsLeft(listing);

  const foodIncluded = listing.foodIncluded === true || listing.food === true;
  const facilities = Array.isArray(listing.facilities)
    ? listing.facilities.slice(0, 3)
    : [];

  const nearbyEssentials = Array.isArray(listing.nearbyEssentials)
    ? listing.nearbyEssentials.slice(0, 2)
    : [];

  const roomText = getRoomSummaryText(listing);
  const facilityText =
    facilities.length > 0
      ? `It offers ${facilities.join(", ")}`
      : "It has basic student-friendly facilities";

  const foodText = foodIncluded
    ? listing.foodDetails
      ? `Food is available, with details like ${listing.foodDetails}`
      : "Food is available for students"
    : "Food is not included, so students should confirm cooking or nearby food options";

  const nearbyEssentialText =
    nearbyEssentials.length > 0
      ? `Useful nearby places include ${nearbyEssentials.join(", ")}`
      : "";

  const priceText = rent
    ? `Rent starts from ₹${rent}/month`
    : "Rent details are available inside";

  const seatText =
    seatsLeft > 0
      ? `${seatsLeft} seat${seatsLeft === 1 ? "" : "s"} are currently left`
      : "It is currently marked full";

  return [
    `${typeText} ${genderText} ${areaText}${nearbyText ? ` near ${nearbyText}` : ""
    }.`,
    roomText,
    `${facilityText}.`,
    `${foodText}.`,
    nearbyEssentialText ? `${nearbyEssentialText}.` : "",
    `${priceText}, and ${seatText}.`,
  ]
    .filter(Boolean)
    .join(" ");
}

function getRoomSummaryText(listing) {
  if (!Array.isArray(listing.roomOptions) || listing.roomOptions.length === 0) {
    return "Room availability can be checked from the details page.";
  }

  const availableRooms = listing.roomOptions
    .filter((room) => Number(room.availableUnits || 0) > 0)
    .slice(0, 3)
    .map(
      (room) =>
        `${getShortRoomTitle(room.title)} room with ${Number(
          room.availableUnits || 0
        )} seat${Number(room.availableUnits || 0) === 1 ? "" : "s"} left`
    );

  if (availableRooms.length === 0) {
    return "No room option is currently marked available.";
  }

  return `Available options include ${availableRooms.join(", ")}.`;
}

export default ListingCard;