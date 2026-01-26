"use client";

import FileInput from "@/components/ui/FileInput";
import { CameraIcon, PencilIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

/**
 * Profile photo uploader with clear edit affordance
 */
export default function ProfilePhotoUploader({
  value,
  onChange,
  name = "",
  size = "lg",
  disabled = false,
  className = "",
}) {
  const initials =
    name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  const sizeClasses = {
    sm: "h-12 w-12 text-sm",
    md: "h-16 w-16 text-base",
    lg: "h-20 w-20 text-lg",
    xl: "h-24 w-24 text-xl",
  };

  return (
    <FileInput
      value={value}
      onChange={onChange}
      accept="image/*"
      maxSizeMB={5}
      folder="avatars"
      disabled={disabled}
      className={className}
    >
      {({ url, isUploading, progress, open, error }) => (
        <div className="flex flex-col items-center gap-1.5">
          {/* Avatar with edit badge */}
          <button
            type="button"
            onClick={open}
            disabled={disabled || isUploading}
            className={clsx(
              "relative group",
              disabled && "opacity-50 cursor-not-allowed",
            )}
          >
            {/* Avatar circle */}
            <div
              className={clsx(
                "rounded-full overflow-hidden",
                "ring-2 ring-gray-200 shadow-sm",
                "flex items-center justify-center",
                "bg-gradient-to-br from-slate-100 to-gray-200",
                "group-hover:ring-indigo-300 transition-all",
                sizeClasses[size],
              )}
            >
              {url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={url}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="font-medium text-slate-500">{initials}</span>
              )}
            </div>

            {/* Edit badge - always visible */}
            <div
              className={clsx(
                "absolute -bottom-0.5 -right-0.5",
                "h-6 w-6 rounded-full",
                "bg-indigo-600 text-white",
                "flex items-center justify-center",
                "shadow-sm ring-2 ring-white",
                "group-hover:bg-indigo-700 transition-colors",
              )}
            >
              <PencilIcon className="h-3 w-3" />
            </div>

            {/* Upload progress overlay */}
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                <span className="text-white text-xs font-medium">
                  {progress}%
                </span>
              </div>
            )}
          </button>

          {/* Label */}
          <span
            className={clsx(
              "text-xs font-medium",
              error ? "text-rose-600" : "text-gray-600",
            )}
          >
            {error || "Profile Photo"}
          </span>
        </div>
      )}
    </FileInput>
  );
}
