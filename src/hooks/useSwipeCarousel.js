import { useRef } from "react";

export function useSwipeCarousel(images, activeImageIndex, setActiveImageIndex) {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const touchEndY = useRef(0);

  function handleTouchStart(event) {
    if (!Array.isArray(images) || images.length <= 1) return;
    if (!event.touches || event.touches.length === 0) return;

    touchStartX.current = event.touches[0].clientX;
    touchStartY.current = event.touches[0].clientY;
    touchEndX.current = event.touches[0].clientX;
    touchEndY.current = event.touches[0].clientY;
  }

  function handleTouchMove(event) {
    if (!Array.isArray(images) || images.length <= 1) return;
    if (!event.touches || event.touches.length === 0) return;

    touchEndX.current = event.touches[0].clientX;
    touchEndY.current = event.touches[0].clientY;
  }

  function handleTouchEnd() {
    if (!Array.isArray(images) || images.length <= 1) return;

    const horizontalDistance = touchStartX.current - touchEndX.current;
    const verticalDistance = touchStartY.current - touchEndY.current;

    const minimumSwipeDistance = 45;

    if (Math.abs(horizontalDistance) < minimumSwipeDistance) return;

    // Ignore diagonal swipes if vertical movement is larger than horizontal
    if (Math.abs(verticalDistance) > Math.abs(horizontalDistance)) return;

    if (horizontalDistance > 0) {
      // Swipe left -> next image
      setActiveImageIndex((previousIndex) =>
        previousIndex + 1 >= images.length ? 0 : previousIndex + 1
      );
    } else {
      // Swipe right -> previous image
      setActiveImageIndex((previousIndex) =>
        previousIndex === 0 ? images.length - 1 : previousIndex - 1
      );
    }
  }

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
}
