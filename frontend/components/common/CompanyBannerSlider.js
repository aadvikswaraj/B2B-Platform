"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

export default function CompanyBannerSlider({
  images = [],
  autoPlay = true,
  interval = 5000,
  height = "h-64 sm:h-80 lg:h-96",
  showArrows = true,
  showDots = true,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const defaultImages = [
    { src: "/product-image.jpg", alt: "Store Banner 1" },
    { src: "/product-image.jpg", alt: "Store Banner 2" },
    { src: "/product-image.jpg", alt: "Store Banner 3" },
  ];

  const slides = images.length > 0 ? images : defaultImages;

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || isPaused || slides.length <= 1) return;
    const timer = setInterval(goToNext, interval);
    return () => clearInterval(timer);
  }, [autoPlay, isPaused, interval, goToNext, slides.length]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  if (slides.length === 0) return null;

  return (
    <div
      className={`relative w-full ${height} overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides */}
      <div
        className="flex h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={index} className="relative h-full w-full flex-shrink-0">
            <Image
              src={slide.src}
              alt={slide.alt || `Banner ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

            {/* Slide content (optional) */}
            {slide.title && (
              <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10">
                <h2 className="text-xl sm:text-3xl font-bold text-white drop-shadow-lg">
                  {slide.title}
                </h2>
                {slide.subtitle && (
                  <p className="mt-2 text-sm sm:text-base text-white/90 max-w-xl">
                    {slide.subtitle}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {showArrows && slides.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 backdrop-blur-sm text-gray-800 shadow-lg hover:bg-white hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Previous slide"
          >
            <ChevronLeftIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 backdrop-blur-sm text-gray-800 shadow-lg hover:bg-white hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Next slide"
          >
            <ChevronRightIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {showDots && slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white ${
                index === currentIndex
                  ? "w-6 bg-white"
                  : "w-2 bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
