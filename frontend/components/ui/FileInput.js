"use client";

import React, { useRef, useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import FileAPI from "@/utils/api/user/file";

export default function FileInput({
  id,
  value, // fileId (string) or null
  onChange, // (fileId: string | null) => void
  accept = "image/*,application/pdf",
  maxSizeMB = 5,
  label,
  placeholder,
  helperText,
  error,
  disabled,
  className = "",
  folder = "uploads",
  children,
}) {
  const inputRef = useRef(null);
  const cancelRef = useRef(null);

  const [fileUrl, setFileUrl] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [localError, setLocalError] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Fetch URL when value (fileId) changes
  useEffect(() => {
    if (!value) {
      setFileUrl(null);
      setFileName(null);
      return;
    }

    // Don't fetch if value looks invalid (not a MongoDB ObjectId)
    if (typeof value !== "string" || value.length !== 24) {
      return;
    }

    let ignore = false;
    
    FileAPI.getUrl(value)
      .then((res) => {
        if (ignore) return;
        // Only process if we have a proper response object
        if (res && typeof res === "object" && res.success === true) {
          const file = res.data?.file;
          if (file) {
            setFileUrl(file.url || null);
            setFileName(file.originalName || "Uploaded file");
            setLocalError(null);
          }
        } else if (res && typeof res === "object" && res.success === false) {
          // Only set error for explicit failure
          setLocalError(res.message || "Failed to load file");
        }
      })
      .catch(() => {
        // Silent fail for fetch errors - file is still valid
        if (ignore) return;
      });

    return () => { ignore = true; };
  }, [value]);

  // Determine file type from URL
  const isPdf = fileUrl && /\.pdf($|\?|#)/i.test(fileUrl);
  const isVideo = fileUrl && /\.(mp4|webm|ogg|mov)($|\?|#)/i.test(fileUrl);
  const isImage = fileUrl && !isPdf && !isVideo;

  const handleFileSelect = async (e) => {
    setLocalError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setLocalError(`File too large. Max ${maxSizeMB}MB`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    // Validate type
    const rules = accept.split(",").map((s) => s.trim()).filter(Boolean);
    const isValidType = rules.some((rule) => {
      if (rule === "*" || rule === "*/*") return true;
      if (rule.startsWith(".")) return file.name.toLowerCase().endsWith(rule.toLowerCase());
      if (rule.endsWith("/*")) return file.type.startsWith(rule.slice(0, -1));
      return file.type.toLowerCase() === rule.toLowerCase();
    });

    if (!isValidType) {
      setLocalError("File type not allowed");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    // Store old fileId for deletion after successful upload
    const oldFileId = value;

    // Cancel any existing upload
    if (cancelRef.current) {
      cancelRef.current();
      cancelRef.current = null;
    }

    setIsUploading(true);
    setUploadPct(0);

    const { promise, cancel } = FileAPI.uploadWithProgress(file, {
      folder,
      onProgress: (pct) => setUploadPct(pct),
    });
    cancelRef.current = cancel;

    try {
      const fileDoc = await promise;

      console.log("Upload response:", fileDoc);
      
      // Validate response - must be an object with _id string
      if (!fileDoc || typeof fileDoc !== "object") {
        throw new Error("Invalid upload response");
      }
      
      if (!fileDoc._id || typeof fileDoc._id !== "string") {
        throw new Error("Invalid file ID in response");
      }
      
      const newFileId = fileDoc._id;

      // Clear any previous error
      setLocalError(null);
      
      // Update parent with new fileId
      onChange?.(newFileId);

      // NOTE: We no longer delete the old file here immediately.
      // File cleanup is now handled by the backend when the entity is saved.
      // This prevents data loss if the user uploads a new file but doesn't save.
    } catch (err) {
      // Don't show error for user-initiated cancel
      if (err?.message === "Upload cancelled") {
        return;
      }
      
      // Get error message safely
      let message = "Upload failed";
      if (err && typeof err === "object" && typeof err.message === "string") {
        message = err.message;
      } else if (typeof err === "string") {
        message = err;
      }
      
      // Ignore if message looks like an ObjectId (24 hex chars)
      if (/^[a-f0-9]{24}$/i.test(message)) {
        message = "Upload failed";
      }
      
      // Handle specific error types
      if (message.includes("401") || message.includes("Unauthorized")) {
        setLocalError("Please login to upload files");
      } else if (message.includes("413") || message.includes("too large")) {
        setLocalError(`File too large. Max ${maxSizeMB}MB`);
      } else if (message.includes("415") || message.includes("type")) {
        setLocalError("File type not supported");
      } else if (message.includes("network") || message.includes("Network")) {
        setLocalError("Network error. Please check your connection");
      } else {
        setLocalError(message);
      }
    } finally {
      setIsUploading(false);
      setUploadPct(0);
      cancelRef.current = null;
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleCancel = () => {
    if (cancelRef.current) {
      cancelRef.current();
      cancelRef.current = null;
    }
    setIsUploading(false);
    setUploadPct(0);
  };

  const handleClear = () => {
    handleCancel();
    
    // Clear state - just update the UI
    // File deletion is now handled by the backend when the entity is saved
    // This prevents data loss if user removes file but doesn't save
    onChange?.(null);
    setFileUrl(null);
    setFileName(null);
    setLocalError(null);
    if (inputRef.current) inputRef.current.value = "";
    
    // NOTE: We no longer delete files here.
    // Backend handles cleanup when entity is updated with null/different file ID.
  };

  const displayError = error || localError;

  // Render Prop Pattern - "Headless" mode
  // If children is a function, we expose the internal state and actions
  if (typeof children === 'function') {
      return (
        <div className={className}>
           <input
            ref={inputRef}
            id={id}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            disabled={disabled || isUploading}
            className="hidden"
          />
          
          {children({
            fileId: value,
            url: fileUrl,
            name: fileName,
            isUploading,
            progress: uploadPct,
            error: displayError,
            open: () => inputRef.current?.click(),
            remove: handleClear,
            setPreviewOpen
          })}

          <Modal
            open={previewOpen}
            onClose={() => setPreviewOpen(false)}
            title="Preview"
            size="3xl"
            mobileMode="fullscreen"
            center={true}
            showHeader={false}
            showCloseButton={false}
          >
             <div className="flex justify-center items-center h-full w-full bg-black/95 p-4 relative" onClick={() => setPreviewOpen(false)}>
                 {isImage && <img src={fileUrl} alt="Preview" className="max-h-[85vh] max-w-full object-contain rounded-sm" onClick={(e) => e.stopPropagation()} />}
                 {isVideo && <video controls src={fileUrl} className="max-h-[85vh] max-w-full rounded shadow-sm" onClick={(e) => e.stopPropagation()} />}
                 {isPdf && <iframe title="PDF" src={fileUrl} className="w-full h-[85vh] bg-white" onClick={(e) => e.stopPropagation()} />}
                 
                 <button 
                    onClick={() => setPreviewOpen(false)}
                    className="absolute top-4 right-4 bg-white/10 text-white rounded-full p-2 hover:bg-white/20 transition-colors backdrop-blur-sm z-50"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                 </button>
             </div>
          </Modal>
        </div>
      );
  }

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
        className="sr-only"
      />

      {/* Empty state - show browse button */}
      {!value && !isUploading && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className={`flex w-full items-center justify-between rounded-md border ${
            displayError ? "border-red-300" : "border-gray-300"
          } bg-white px-3 py-2.5 text-left text-sm shadow-sm hover:bg-gray-50 ${
            disabled ? "cursor-not-allowed opacity-70" : ""
          }`}
        >
          <span className="truncate text-gray-400">
            {placeholder || `Choose file (max ${maxSizeMB}MB)`}
          </span>
          <span className="ml-3 rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700">
            Browse
          </span>
        </button>
      )}

      {/* Uploading state */}
      {isUploading && (
        <div className={`rounded-md border ${displayError ? "border-red-300" : "border-gray-300"} bg-white px-3 py-2.5 shadow-sm`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Uploading…</span>
            <button
              type="button"
              onClick={handleCancel}
              className="text-red-600 hover:text-red-700 text-xs font-medium"
            >
              Cancel
            </button>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded bg-gray-200">
            <div
              className="h-full bg-indigo-600 transition-all duration-150"
              style={{ width: `${uploadPct}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 text-right">{uploadPct}%</p>
        </div>
      )}

      {/* File uploaded state */}
      {value && !isUploading && (
        <div className={`flex items-center justify-between rounded-md border ${
          displayError ? "border-red-300" : "border-gray-300"
        } bg-white px-3 py-2.5 shadow-sm`}>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-gray-700">{fileName || "Uploaded file"}</p>
            {fileUrl && (
              <span className="inline-flex items-center gap-1 mt-1 text-xs text-green-700 bg-green-50 border border-green-200 rounded px-2 py-0.5">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Uploaded
              </span>
            )}
          </div>
          <div className="ml-3 flex items-center gap-2">
            {/* Preview */}
            {fileUrl && (isImage || isPdf || isVideo) && (
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="p-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
                title="Preview"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            )}
            {/* Change */}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={disabled}
              className="p-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
              title="Change file"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V7.414A2 2 0 0017.414 6L14 2.586A2 2 0 0012.586 2H4z" />
              </svg>
            </button>
            {/* Remove */}
            <button
              type="button"
              onClick={handleClear}
              className="p-2 rounded-md border border-gray-200 text-red-600 hover:bg-red-50"
              title="Remove file"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-1 4v7m-6-7v7M5 7l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Helper/Error text */}
      {helperText && !displayError && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
      {displayError && (
        <p className="mt-1 text-xs text-red-600">{displayError}</p>
      )}

      {/* Preview Modal */}
      <Modal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="File Preview"
        size="3xl"
        mobileMode="fullscreen"
        center={true}
      >
        <div className="flex justify-center items-center h-full w-full bg-gray-50/50 p-1 rounded-lg">
          {isImage ? (
            <img src={fileUrl} alt="Preview" className="max-h-[70vh] w-auto object-contain shadow-sm rounded bg-white" />
          ) : isVideo ? (
            <video controls src={fileUrl} className="w-full max-h-[70vh] rounded shadow-sm bg-black" />
          ) : isPdf ? (
            <iframe title="PDF Preview" src={fileUrl} className="w-full h-[70vh] rounded border bg-white shadow-sm" />
          ) : (
            <div className="text-gray-500 py-10">Preview not available for this file type</div>
          )}
        </div>
      </Modal>
    </div>
  );
}
