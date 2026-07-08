import { getCloudinaryOptimizedUrl } from "../../../utils/cloudinaryImage";

export default function ListingImageGallery({
  listing,
  images,
  activeImageIndex,
  setActiveImageIndex,
  swipeHandlers,
  pgNote,
}) {
  const activeImage = images[activeImageIndex] || images[0];

  return (
    <div className="space-y-3">
      <div
        className="relative flex aspect-[4/3] w-full touch-pan-y items-center justify-center overflow-hidden rounded-[1.8rem] border border-[#E8DFD2] bg-[#F6F1E8] sm:aspect-[16/10]"
        onTouchStart={swipeHandlers.onTouchStart}
        onTouchMove={swipeHandlers.onTouchMove}
        onTouchEnd={swipeHandlers.onTouchEnd}
      >
        <img
          src={getCloudinaryOptimizedUrl(activeImage, {
            width: 1200,
            crop: "limit",
            quality: "auto:good",
          })}
          alt={listing.name || "Stay preview"}
          loading="lazy"
          decoding="async"
          className="max-h-full max-w-full object-contain"
        />

        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white">
            {activeImageIndex + 1}/{images.length}
          </div>
        )}

        {pgNote && (
          <div className="absolute left-3 top-3 max-w-[80%] rounded-2xl bg-[#FFF3D6]/95 px-4 py-2 text-sm font-black text-[#92400E] shadow-sm backdrop-blur">
            {pgNote}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveImageIndex(index)}
              className={`h-16 w-20 shrink-0 overflow-hidden rounded-2xl border-2 bg-[#F6F1E8] transition sm:h-20 sm:w-28 ${
                activeImageIndex === index
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
                alt={`${listing.name || "Stay image"} ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
