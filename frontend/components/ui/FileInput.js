"use client";

import React, { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";


export default function FileInput({
	id,
	value,
	onChange,
	accept = "image/*,application/pdf",
	maxSizeMB = 5,
	maxSizeBytes,
	label,
	placeholder,
	helperText,
	error,
	disabled,
	className = "",
	viewUrl,
}) {
	const inputRef = useRef(null);
	const [previewOpen, setPreviewOpen] = useState(false);
	const [internalError, setInternalError] = useState(null);
  const [internalFile, setInternalFile] = useState(null);

	const currentFile = value ?? internalFile;

	const objectUrl = useMemo(() => {
		if (currentFile instanceof File) {
			try {
				return URL.createObjectURL(currentFile);
			} catch (e) {
				return null;
			}
		}
		return null;
	}, [currentFile]);

		const effectiveUrl = viewUrl || objectUrl;

		const isImage = useMemo(() => {
			if (currentFile) return currentFile.type?.startsWith("image/");
			if (effectiveUrl) return !/\.pdf($|\?|#)/i.test(effectiveUrl) && !/^data:application\/pdf/i.test(effectiveUrl);
			return false;
		}, [currentFile, effectiveUrl]);

		const isPdf = useMemo(() => {
			if (currentFile) return currentFile.type === "application/pdf";
			if (effectiveUrl) return /\.pdf($|\?|#)/i.test(effectiveUrl) || /^data:application\/pdf/i.test(effectiveUrl);
			return false;
		}, [currentFile, effectiveUrl]);

		const maxBytes = typeof maxSizeBytes === "number" ? maxSizeBytes : maxSizeMB * 1024 * 1024;

	const onInputChange = (e) => {
		setInternalError(null);
		const file = e.target.files?.[0] || null;
		if (!file) {
			// No selection; forward event as-is
			onChange?.(e);
			return;
		}
		if (file.size > maxBytes) {
			setInternalError(`File too large. Max ${maxSizeMB}MB`);
			// reset native input so user can re-pick
			if (inputRef.current) inputRef.current.value = "";
			return; // do not propagate invalid file
		}
		const typeOk = /(image\/.*|application\/pdf)/.test(file.type);
		if (!typeOk) {
			setInternalError("Only images or PDF are allowed");
			if (inputRef.current) inputRef.current.value = "";
			return; // do not propagate invalid file
		}
		// Valid: update internal state and forward native event to consumer
		setInternalFile(file);
		onChange?.(e);
	};

	const clearFile = () => {
		if (inputRef.current) {
			inputRef.current.value = "";
		}
			// clear internal state and emit an event-like object to keep legacy handlers safe (expecting e.target.files)
			setInternalFile(null);
			onChange?.({ target: { files: [] } });
		setInternalError(null);
	};

	return (
		<div className={className}>
			{label ? (
				<label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700">
					{label}
				</label>
			) : null}

						<div>
							{/* Hidden native input for accessibility and RHF */}
							<input
								ref={inputRef}
								id={id}
								type="file"
								accept={accept}
								onChange={onInputChange}
								disabled={disabled}
								className="sr-only"
							/>

							{/* Rectangular control matching Input size */}
							{!currentFile ? (
								<button
									type="button"
									onClick={() => !disabled && inputRef.current?.click()}
									className={`flex w-full items-center justify-between rounded-md border ${
										error || internalError ? "border-red-300" : "border-gray-300"
									} bg-white px-3 py-2.5 text-left text-sm shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 ${
										disabled ? "cursor-not-allowed opacity-70" : ""
									}`}
									aria-describedby={helperText ? `${id}-desc` : undefined}
								>
												<span className="truncate text-gray-400">{placeholder || `Choose file (images/PDF, up to ${maxSizeMB}MB)`}</span>
									<span className="ml-3 rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700">Browse</span>
								</button>
							) : (
								<div
									className={`flex w-full items-center justify-between rounded-md border ${
										error || internalError ? "border-red-300" : "border-gray-300"
									} bg-white px-3 py-2.5 text-sm shadow-sm`}
								>
									<div className="min-w-0 flex-1">
										<p className="truncate text-gray-700">{currentFile?.name || "Selected file"}</p>
										{currentFile ? (
											<p className="text-xs text-gray-500">{(currentFile.size / 1024 / 1024).toFixed(2)} MB</p>
										) : null}
									</div>
									<div className="ml-3 flex items-center gap-2">
										{/* Change (pick another file) */}
										<button
											type="button"
											onClick={() => !disabled && inputRef.current?.click()}
											className="inline-flex items-center justify-center rounded-md border border-gray-200 p-2 text-gray-700 hover:bg-gray-50"
											title="Change file"
										>
											<span className="sr-only">Change</span>
											<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
												<path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V7.414A2 2 0 0017.414 6L14 2.586A2 2 0 0012.586 2H4z" />
											</svg>
										</button>

										{/* Preview (only for images/PDF) */}
										{(isImage || isPdf) && effectiveUrl ? (
											<button
												type="button"
												onClick={() => setPreviewOpen(true)}
												className="inline-flex items-center justify-center rounded-md border border-gray-200 p-2 text-gray-700 hover:bg-gray-50"
												title="Preview"
											>
												<span className="sr-only">Preview</span>
												<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
													<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
													<circle cx="12" cy="12" r="3" />
												</svg>
											</button>
										) : null}
									</div>
								</div>
							)}

				{helperText && !error && !internalError ? (
					<p className="mt-2 text-xs text-gray-500">{helperText}</p>
				) : null}
				{error || internalError ? (
					<p className="mt-2 text-xs text-red-600">{error || internalError}</p>
				) : null}

								</div>

			{/* Modal Preview */}
			{previewOpen && effectiveUrl && (isImage || isPdf)
				? createPortal(
					<div className="fixed inset-0 z-[60]">
						<div className="absolute inset-0 bg-black/60" onClick={() => setPreviewOpen(false)} />
						<div className="absolute inset-0 flex items-center justify-center p-4">
							<div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-lg bg-white shadow-lg">
								<div className="flex items-center justify-between border-b border-gray-200 p-3">
									<h3 className="text-sm font-semibold text-gray-800">Preview</h3>
									<button
										type="button"
										onClick={() => setPreviewOpen(false)}
										className="rounded-md px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
									>
										Close
									</button>
								</div>
								<div className="max-h-[80vh] overflow-auto p-4">
									{isImage ? (
										// eslint-disable-next-line @next/next/no-img-element
										<img src={effectiveUrl} alt="Full Preview" className="mx-auto max-h-[70vh] w-auto" />
									) : (
										<iframe title="PDF Preview" src={effectiveUrl} className="h-[70vh] w-full" />
									)}
								</div>
							</div>
						</div>
					</div>,
					document.body
				)
				: null}
		</div>
	);
}

