import { useState } from "react";
import FileInput from "@/components/ui/FileInput";
import {
  PhotoIcon,
  XMarkIcon,
  PlusIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";

export default function MediaDocs({
  images,
  setImages,
  videoFile,
  setVideoFile,
  pdfFile,
  setPdfFile,
  error,
  register,
}) {
  // Handle removing a specific image ID from the list
  const handleUpdate = (idx, newId) => {
    // If newId is null (deleted), remove from array
    if (!newId) {
      setImages((prev) => prev.filter((_, i) => i !== idx));
    } else {
      // Update ID (replace)
      setImages((prev) => {
        const clone = [...prev];
        clone[idx] = newId;
        return clone;
      });
    }
  };

  const handleAdd = (newId) => {
    if (newId) {
      setImages((prev) => [...prev, newId]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Images */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Product Images <span className="text-red-500">*</span>
        </label>

        {/* Visually hidden but focusable input for RHF validation & scroll */}
        {register && (
          <input
            className="sr-only"
            tabIndex={-1}
            {...register("productImages", {
              required: "At least 1 image is required",
            })}
          />
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-3">
          {/* Existing Images */}
          {images.map((imgId, idx) => (
            <FileInput
              key={idx} // Use index to persist component instance for internal upload tracking
              value={imgId}
              onChange={(val) => handleUpdate(idx, val)}
              deleteMode="edit" // Clean up new uploads if deleted
              folder="products/images"
              accept="image/*"
              className="h-full"
            >
              {({
                url,
                isUploading,
                progress,
                error,
                remove,
                open,
                setPreviewOpen,
              }) => (
                <div className="relative group">
                  {/* Main Image Container */}
                  <div
                    className="relative aspect-square rounded-2xl overflow-hidden shadow-md ring-1 ring-black/10 bg-gradient-to-br from-gray-100 to-gray-50 cursor-pointer"
                    onClick={() => url && !isUploading && setPreviewOpen(true)}
                  >
                    {url ? (
                      <img
                        src={url}
                        className={`w-full h-full object-cover ${isUploading ? "opacity-50 blur-[1px]" : ""}`}
                        alt="Product"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PhotoIcon className="w-12 h-12 text-gray-300" />
                      </div>
                    )}

                    {/* Uploading State */}
                    {isUploading && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                        <div className="relative w-14 h-14 mb-2">
                          <svg
                            className="w-full h-full -rotate-90"
                            viewBox="0 0 36 36"
                          >
                            <circle
                              cx="18"
                              cy="18"
                              r="16"
                              fill="none"
                              className="stroke-gray-200"
                              strokeWidth="3"
                            />
                            <circle
                              cx="18"
                              cy="18"
                              r="16"
                              fill="none"
                              className="stroke-blue-500"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeDasharray={`${progress} 100`}
                            />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-blue-600">
                            {progress}%
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Desktop: Hover Overlay (hidden by default) */}
                    {url && !isUploading && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 hidden md:flex items-center justify-center">
                        <div className="bg-white/20 backdrop-blur-md rounded-full p-3 border border-white/30">
                          <ArrowsPointingOutIcon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    )}

                    {/* Desktop: Hover Action Buttons (hidden by default) */}
                    {url && !isUploading && (
                      <div className="absolute top-2 right-2 hidden md:flex gap-1.5 opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            open();
                          }}
                          className="bg-white text-gray-700 rounded-full p-2 hover:bg-gray-100 shadow-lg transition-all hover:scale-110"
                          title="Replace"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            remove();
                          }}
                          className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg transition-all hover:scale-110"
                          title="Delete"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Mobile: Small Circular Icon Buttons (always visible) */}
                    {url && !isUploading && (
                      <div className="absolute top-1.5 right-1.5 flex gap-1 md:hidden z-10">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            open();
                          }}
                          className="bg-white/95 text-gray-700 rounded-full p-1.5 shadow-md active:scale-90 transition-transform"
                        >
                          <PencilSquareIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            remove();
                          }}
                          className="bg-red-500 text-white rounded-full p-1.5 shadow-md active:scale-90 transition-transform"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Main Badge - Top Left */}
                    {idx === 0 && url && !isUploading && (
                      <div className="absolute top-1.5 left-1.5 z-10">
                        <span className="inline-flex items-center gap-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-lg">
                          <svg
                            className="w-2.5 h-2.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          Main
                        </span>
                      </div>
                    )}

                    {/* Error State */}
                    {error && (
                      <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 backdrop-blur-sm">
                        <div className="bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
                          {error}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </FileInput>
          ))}

          {/* Add Button */}
          {images.length < 8 && (
            <FileInput
              key={`adder-${images.length}`} // Force reset on list change
              value={null}
              onChange={handleAdd}
              deleteMode="edit"
              folder="products/images"
              accept="image/*"
              className="h-full"
            >
              {({ open, isUploading, progress, error }) => {
                if (isUploading) {
                  return (
                    <div className="aspect-square relative flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed border-blue-300 rounded-2xl shadow-sm">
                      <div className="relative w-14 h-14 mb-3">
                        <svg
                          className="w-full h-full -rotate-90"
                          viewBox="0 0 36 36"
                        >
                          <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            className="stroke-blue-200"
                            strokeWidth="3"
                          />
                          <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            className="stroke-blue-500"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray={`${progress} 100`}
                            style={{ transition: "stroke-dasharray 0.3s ease" }}
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-blue-600">
                          {progress}%
                        </span>
                      </div>
                      <span className="text-xs font-medium text-blue-500">
                        Uploading...
                      </span>
                    </div>
                  );
                }
                return (
                  <div
                    className="relative aspect-square flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-2xl hover:border-blue-400 hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 cursor-pointer group overflow-hidden shadow-sm hover:shadow-md"
                    onClick={open}
                  >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity duration-300">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <PhotoIcon className="w-20 h-20 text-gray-200 group-hover:text-blue-200 transition-colors duration-300" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center justify-center">
                      <div className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-md mb-3 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300 ring-1 ring-black/5 group-hover:ring-blue-400/30">
                        <PlusIcon className="w-6 h-6 text-gray-500 group-hover:text-blue-600 transition-colors duration-300" />
                      </div>
                      <span className="text-sm font-semibold text-gray-500 group-hover:text-blue-600 transition-colors duration-300">
                        Add Image
                      </span>
                      <span className="text-xs font-medium text-gray-400 group-hover:text-blue-400 mt-0.5 transition-colors duration-300">
                        {8 - images.length} remaining
                      </span>
                    </div>

                    {/* Error */}
                    {error && (
                      <div className="absolute bottom-3 left-2 right-2 text-center">
                        <span className="text-[10px] bg-red-500 text-white px-2 py-1 rounded-full shadow-sm font-medium">
                          {error}
                        </span>
                      </div>
                    )}
                  </div>
                );
              }}
            </FileInput>
          )}
        </div>
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      </div>

      {/* Video & PDF Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Video (Optional) */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
            Product Video
          </label>
          <div className="relative">
            <FileInput
              value={videoFile}
              onChange={setVideoFile}
              deleteMode="edit"
              accept="video/mp4,video/*"
              placeholder="Upload Video (MP4)"
              folder="products/videos"
            />
          </div>
        </div>

        {/* PDF (Optional) */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
            Tech Spec Sheet
          </label>
          <div className="relative">
            <FileInput
              value={pdfFile}
              onChange={setPdfFile}
              deleteMode="edit"
              accept="application/pdf"
              placeholder="Upload PDF"
              folder="products/docs"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
