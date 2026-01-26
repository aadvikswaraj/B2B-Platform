"use client";

import { useState, useRef, useCallback } from "react";
import {
  CloudArrowUpIcon,
  XMarkIcon,
  DocumentIcon,
  PhotoIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

/**
 * Reusable File Upload Component
 * @param {Object} props
 * @param {Function} props.onUpload - Callback with the uploaded file object (or ID if integrated)
 * @param {string} props.accept - Accepted file types (e.g. "image/*, .pdf")
 * @param {string} props.label - Label for the upload area
 * @param {string} props.description - Helper text
 * @param {number} props.maxSizeMB - Max size in MB
 * @param {string} props.initialPreview - URL to show if file already exists
 * @param {boolean} props.disabled - Disable interaction
 * @param {string} props.className - Extra classes
 */
export default function FileUpload({
  onUpload,
  accept = "image/*",
  label = "Upload File",
  description = "Drag & drop or click to upload",
  maxSizeMB = 5,
  initialPreview = null,
  disabled = false,
  className = "",
}) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(initialPreview);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const inputRef = useRef(null);

  const handleDragOver = useCallback(
    (e) => {
      e.preventDefault();
      if (!disabled) setIsDragging(true);
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFile = (selectedFile) => {
    setError(null);

    // Check size
    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMB}MB limit.`);
      return false;
    }

    // Check type (simple check)
    if (
      accept !== "*" &&
      !accept.includes(selectedFile.type.split("/")[0]) &&
      !accept.includes(selectedFile.name.split(".").pop())
    ) {
      // Ideally we'd do more robust checking matching the 'accept' string logic
    }

    return true;
  };

  const uploadFile = async (selectedFile) => {
    if (!validateFile(selectedFile)) return;

    setUploading(true);
    setProgress(10); // Start progress

    try {
      // Create FormData
      const formData = new FormData();
      formData.append("file", selectedFile);

      const xhr = new XMLHttpRequest();
      xhr.open(
        "POST",
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/user/file/upload`,
        true,
      );
      xhr.setRequestHeader("x-folder", "store-assets");
      xhr.withCredentials = true; // Important for session cookies

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setProgress(Math.round(percentComplete));
        }
      };

      xhr.onload = () => {
        if (xhr.status === 201) {
          const response = JSON.parse(xhr.responseText);
          if (response.success) {
            const fileData = response.data;
            setFile(selectedFile);

            // Generate preview
            if (selectedFile.type.startsWith("image/")) {
              const reader = new FileReader();
              reader.onload = (e) => setPreview(e.target.result);
              reader.readAsDataURL(selectedFile);
            } else {
              setPreview(null);
            }

            onUpload(fileData); // Pass back the file object/ID
          } else {
            setError(response.message || "Upload failed");
          }
        } else {
          setError("Upload failed. Server error.");
        }
        setUploading(false);
      };

      xhr.onerror = () => {
        setError("Network error during upload.");
        setUploading(false);
      };

      xhr.send(formData);
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
      setUploading(false);
    }
  };

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        uploadFile(droppedFile);
      }
    },
    [disabled],
  );

  const handleChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      uploadFile(selectedFile);
    }
  };

  const clearFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setPreview(null);
    setError(null);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = "";
    onUpload(null);
  };

  return (
    <div className={`w-full ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`
          relative group cursor-pointer
          border-2 border-dashed rounded-xl p-6
          transition-all duration-200 ease-in-out
          flex flex-col items-center justify-center text-center
          ${isDragging ? "border-indigo-500 bg-indigo-50" : "border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100"}
          ${error ? "border-rose-300 bg-rose-50" : ""}
          ${disabled ? "opacity-60 cursor-not-allowed hover:bg-gray-50" : ""}
          ${preview ? "border-solid border-gray-200 p-0 overflow-hidden bg-white" : ""}
        `}
        style={{ minHeight: "160px" }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
          disabled={disabled || uploading}
        />

        {uploading ? (
          <div className="w-full max-w-xs px-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : preview ? (
          <div className="relative w-full h-full min-h-[160px] flex items-center justify-center bg-gray-100">
            {/* Show image preview if available */}
            {typeof preview === "string" && (
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            )}

            {/* Overlay actions */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <button
                onClick={clearFile}
                className="p-2 bg-white rounded-full shadow-sm text-gray-600 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0"
                title="Remove file"
                type="button"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
              Change
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="space-y-2 pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-500 mx-auto flex items-center justify-center">
              <CloudArrowUpIcon className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-900">
                {uploading ? "Uploading..." : "Click or drag file"}
              </p>
              <p className="text-xs text-gray-500">
                {description} (Max {maxSizeMB}MB)
              </p>
            </div>
            {error && (
              <div className="pt-2 flex items-center justify-center text-rose-600 text-xs gap-1">
                <ExclamationCircleIcon className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
