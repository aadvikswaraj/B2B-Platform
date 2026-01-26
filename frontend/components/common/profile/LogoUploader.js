"use client";

import FileInput from "@/components/ui/FileInput";
import { BuildingOffice2Icon, PencilIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

/**
 * Company logo uploader with clear edit affordance
 */
export default function LogoUploader({
  value,
  onChange,
  companyName = "",
  disabled = false,
  className = "",
}) {
  const initial = companyName?.[0]?.toUpperCase() || "?";

  return (
    <FileInput
      value={value}
      onChange={onChange}
      accept="image/*"
      maxSizeMB={5}
      folder="logos"
      disabled={disabled}
      className={className}
    >
      {({ url, isUploading, progress, open, error }) => (
        <div className="flex flex-col items-center gap-1.5">
          {/* Logo with edit badge */}
          <button
            type="button"
            onClick={open}
            disabled={disabled || isUploading}
            className={clsx(
              "relative group",
              disabled && "opacity-50 cursor-not-allowed",
            )}
          >
            {/* Logo container */}
            <div
              className={clsx(
                "h-16 w-16 rounded-lg overflow-hidden",
                "ring-2 ring-gray-200 shadow-sm",
                "bg-slate-50",
                "flex items-center justify-center p-2",
                "group-hover:ring-indigo-300 transition-all",
              )}
            >
              {url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={url}
                  alt="Company logo"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <BuildingOffice2Icon className="h-8 w-8 text-slate-400" />
              )}
            </div>

            {/* Edit badge - always visible */}
            <div
              className={clsx(
                "absolute -bottom-0.5 -right-0.5",
                "h-5 w-5 rounded-full",
                "bg-indigo-600 text-white",
                "flex items-center justify-center",
                "shadow-sm ring-2 ring-white",
                "group-hover:bg-indigo-700 transition-colors",
              )}
            >
              <PencilIcon className="h-2.5 w-2.5" />
            </div>

            {/* Upload progress overlay */}
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                <span className="text-xs text-white font-medium">
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
            {error || "Company Logo"}
          </span>
        </div>
      )}
    </FileInput>
  );
}
