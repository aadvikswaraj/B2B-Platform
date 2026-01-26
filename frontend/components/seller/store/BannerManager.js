"use client";

import { useState } from "react";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  TrashIcon,
  LinkIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import FileUpload from "@/components/common/FileUpload";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

/**
 * Banner Manager Component
 * Handles uploading, reordering, and editing banners
 * @param {Object} props
 * @param {Array} props.banners - Current banners array
 * @param {Function} props.onChange - Callback with new banners array
 */
export default function BannerManager({ banners = [], onChange }) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddBanner = (fileData) => {
    const newBanner = {
      file: fileData._id, // Store file ID
      url: fileData.url || fileData.path, // Use URL for display
      title: "",
      link: "",
      position: banners.length,
      isActive: true,
    };
    onChange([...banners, newBanner]);
    setIsAdding(false);
  };

  const removeBanner = (index) => {
    const newBanners = banners.filter((_, i) => i !== index);
    onChange(newBanners);
  };

  const moveBanner = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= banners.length) return;

    const newBanners = [...banners];
    const temp = newBanners[index];
    newBanners[index] = newBanners[newIndex];
    newBanners[newIndex] = temp;

    // Update positions
    const reordered = newBanners.map((b, i) => ({ ...b, position: i }));
    onChange(reordered);
  };

  const updateBanner = (index, updates) => {
    const newBanners = [...banners];
    newBanners[index] = { ...newBanners[index], ...updates };
    onChange(newBanners);
  };

  return (
    <div className="space-y-4">
      {/* Banner List */}
      <div className="grid gap-4 sm:grid-cols-1">
        {banners.map((banner, index) => (
          <div
            key={banner.file || index}
            className="flex flex-col sm:flex-row gap-4 p-3 rounded-xl bg-white border border-gray-200 shadow-sm relative group"
          >
            {/* Thumbnail */}
            <div className="relative w-full sm:w-48 aspect-[3/1] sm:aspect-[16/9] rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              {banner.url ? (
                <Image
                  src={banner.url}
                  alt={`Banner ${index + 1}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-gray-400">
                  No Image
                </div>
              )}
              <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                {index + 1}
              </div>
            </div>

            {/* Inputs */}
            <div className="flex-1 space-y-3 min-w-0">
              <div className="flex gap-2">
                <Input
                  placeholder="Banner Title (Optional)"
                  value={banner.title || ""}
                  onChange={(e) =>
                    updateBanner(index, { title: e.target.value })
                  }
                  className="flex-1 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <Input
                  placeholder="Link URL (e.g. /products/sku-123)"
                  value={banner.link || ""}
                  onChange={(e) =>
                    updateBanner(index, { link: e.target.value })
                  }
                  className="flex-1 text-sm h-9"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex sm:flex-col gap-1 sm:border-l sm:pl-3 border-gray-100 justify-end sm:justify-start">
              <button
                onClick={() => moveBanner(index, -1)}
                disabled={index === 0}
                className="p-1.5 rounded hover:bg-gray-100 text-gray-500 disabled:opacity-30 transition-colors"
                type="button"
              >
                <ArrowUpIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => moveBanner(index, 1)}
                disabled={index === banners.length - 1}
                className="p-1.5 rounded hover:bg-gray-100 text-gray-500 disabled:opacity-30 transition-colors"
                type="button"
              >
                <ArrowDownIcon className="h-4 w-4" />
              </button>
              <div className="flex-1 sm:h-2"></div>
              <button
                onClick={() => removeBanner(index)}
                className="p-1.5 rounded hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors"
                type="button"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Banner Area */}
      {isAdding ? (
        <div className="p-4 border-2 border-dashed border-indigo-200 rounded-xl bg-indigo-50/30">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-indigo-900">
              Upload New Banner
            </h4>
            <button
              onClick={() => setIsAdding(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
          <FileUpload
            onUpload={handleAddBanner}
            accept="image/*"
            label=""
            description="Recommended size: 1200x400px"
            maxSizeMB={5}
          />
        </div>
      ) : (
        banners.length < 5 && (
          <Button
            variant="outline"
            className="w-full py-4 border-dashed border-2 hover:bg-gray-50 text-gray-500"
            onClick={() => setIsAdding(true)}
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Banner
          </Button>
        )
      )}

      <p className="text-xs text-gray-400">
        You can add up to 5 banners. Drag/Move to change display order.
      </p>
    </div>
  );
}
