"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  PlayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  ArrowsPointingOutIcon,
  MagnifyingGlassPlusIcon,
} from "@heroicons/react/24/outline";

/**
 * ImageGallery - Enhanced product image gallery with zoom, lightbox and video support
 */
const ImageGallery = ({ images = [], video = null }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const mainImageRef = useRef(null);
  const thumbnailsRef = useRef(null);

  const allMedia = [
    ...(video ? [{ type: "video", url: video }] : []),
    ...images.map((img) => ({
      type: "image",
      url:
        typeof img === "string"
          ? img
          : img.relativePath
          ? `${process.env.NEXT_PUBLIC_API_URL || ""}/uploads/${
              img.relativePath
            }`
          : "https://placehold.co/600x600/f3f4f6/9ca3af?text=No+Image",
    })),
  ];

  // If no media, show placeholder
  if (allMedia.length === 0) {
    allMedia.push({
      type: "image",
      url: "https://placehold.co/600x600/f3f4f6/9ca3af?text=No+Image",
    });
  }

  const currentMedia = allMedia[selectedIndex] || allMedia[0];

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showLightbox) {
        if (e.key === "Escape") setShowLightbox(false);
        if (e.key === "ArrowLeft") navigatePrev();
        if (e.key === "ArrowRight") navigateNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showLightbox, selectedIndex]);

  const navigateNext = () => {
    const nextIndex = (selectedIndex + 1) % allMedia.length;
    setSelectedIndex(nextIndex);
    setShowVideo(allMedia[nextIndex].type === "video");
  };

  const navigatePrev = () => {
    const prevIndex = (selectedIndex - 1 + allMedia.length) % allMedia.length;
    setSelectedIndex(prevIndex);
    setShowVideo(allMedia[prevIndex].type === "video");
  };

  // Handle zoom on hover (desktop)
  const handleMouseMove = (e) => {
    if (!mainImageRef.current) return;
    const rect = mainImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  // Scroll thumbnails into view
  const scrollThumbnails = (direction) => {
    if (!thumbnailsRef.current) return;
    const scrollAmount = 80;
    thumbnailsRef.current.scrollBy({
      left: direction === "next" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Main Display */}
        <div
          ref={mainImageRef}
          className="relative aspect-square w-full bg-gray-50 rounded-xl overflow-hidden border border-gray-100 group cursor-zoom-in"
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onMouseMove={handleMouseMove}
          onClick={() => !showVideo && setShowLightbox(true)}
        >
          {showVideo && video ? (
            <video
              controls
              autoPlay
              className="w-full h-full object-contain bg-black"
              src={video}
            />
          ) : (
            <>
              <Image
                src={currentMedia.url}
                alt="Product view"
                fill
                className={`object-contain transition-transform duration-200 ${
                  isZoomed ? "scale-150" : ""
                }`}
                style={
                  isZoomed
                    ? {
                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      }
                    : {}
                }
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />

              {/* Zoom hint */}
              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/60 text-white text-xs font-medium backdrop-blur-sm">
                  <MagnifyingGlassPlusIcon className="h-4 w-4" />
                  Click to enlarge
                </span>
              </div>

              {/* Fullscreen button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLightbox(true);
                }}
                className="absolute top-3 right-3 p-2 rounded-lg bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
              >
                <ArrowsPointingOutIcon className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Navigation Arrows */}
          {allMedia.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigatePrev();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow-lg text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateNext();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow-lg text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Image Counter */}
          {allMedia.length > 1 && (
            <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/60 text-white text-xs font-medium backdrop-blur-sm">
              {selectedIndex + 1} / {allMedia.length}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {allMedia.length > 1 && (
          <div className="relative">
            {/* Scroll buttons for many thumbnails */}
            {allMedia.length > 6 && (
              <>
                <button
                  onClick={() => scrollThumbnails("prev")}
                  className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-white shadow-md text-gray-600 hover:bg-gray-50"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => scrollThumbnails("next")}
                  className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-white shadow-md text-gray-600 hover:bg-gray-50"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </>
            )}

            <div
              ref={thumbnailsRef}
              className="flex gap-2 overflow-x-auto no-scrollbar px-1"
            >
              {allMedia.map((media, index) => (
                <button
                  key={index}
                  className={`
                    relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all
                    ${
                      selectedIndex === index
                        ? "border-indigo-500 ring-2 ring-indigo-500/20"
                        : "border-gray-200 hover:border-indigo-300"
                    }
                  `}
                  onClick={() => {
                    setSelectedIndex(index);
                    setShowVideo(media.type === "video");
                  }}
                >
                  {media.type === "video" ? (
                    <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                      <PlayIcon className="h-6 w-6 text-white" />
                    </div>
                  ) : (
                    <Image
                      src={media.url}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {showLightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setShowLightbox(false)}
        >
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          {/* Navigation */}
          {allMedia.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigatePrev();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <ChevronLeftIcon className="h-8 w-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <ChevronRightIcon className="h-8 w-8" />
              </button>
            </>
          )}

          {/* Image */}
          <div
            className="relative w-full h-full max-w-5xl max-h-[90vh] m-4"
            onClick={(e) => e.stopPropagation()}
          >
            {currentMedia.type === "video" ? (
              <video
                controls
                autoPlay
                className="w-full h-full object-contain"
                src={currentMedia.url}
              />
            ) : (
              <Image
                src={currentMedia.url}
                alt="Product view"
                fill
                className="object-contain"
                sizes="100vw"
              />
            )}
          </div>

          {/* Counter */}
          {allMedia.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium backdrop-blur-sm">
              {selectedIndex + 1} / {allMedia.length}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ImageGallery;
