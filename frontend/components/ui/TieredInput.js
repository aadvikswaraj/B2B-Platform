"use client";
import React, { useState, useMemo } from "react";
import {
  PlusIcon,
  TrashIcon,
  InformationCircleIcon,
  ExclamationCircleIcon,
  ArrowsUpDownIcon,
} from "@heroicons/react/24/outline";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";

export default function TieredInput({
  // Toggle Props
  mode: controlledMode,
  onModeChange,
  renderSingle,
  singleLabel = "Single",
  slabLabel = "Slab",
  orderBy,

  // Slab Props
  value = [],
  onChange,
  columns = [],
  title,
  description,
  previewRenderer,
  validate,
  defaultSlab = {},
  renderSlabBottom,
  defaultMode = "single",

  // New Props for enhanced functionality
  required = false,
  minRows = 0,
  showSortButton = false,
  sortButtonLabel = "Sort by amount",
  previewConfig, // { label: (s, next) => string, value: (s) => node, orderBy: string }
}) {
  const [internalMode, setInternalMode] = useState(() => {
    // Auto-detect slab mode if value has items
    if (value && value.length > 0) return "slab";
    return defaultMode;
  });
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  const isControlled = controlledMode !== undefined;
  const mode = isControlled ? controlledMode : internalMode;

  const handleModeChange = (newMode) => {
    if (onModeChange) {
      onModeChange(newMode);
    }
    if (!isControlled) {
      setInternalMode(newMode);
    }
  };

  // Handlers for Slab Mode
  const addSlab = () => {
    onChange([...value, { ...defaultSlab }]);
  };

  const removeSlab = (index) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
  };

  const updateSlab = (index, key, val) => {
    const newValue = value.map((item, i) => {
      if (i === index) {
        return { ...item, [key]: val };
      }
      return item;
    });
    onChange(newValue);
  };

  // Sort slabs by orderBy column
  const sortSlabs = () => {
    if (!orderBy || value.length < 2) return;
    const sorted = [...value].sort((a, b) => {
      const aVal = parseFloat(a[orderBy]) || 0;
      const bVal = parseFloat(b[orderBy]) || 0;
      return aVal - bVal;
    });
    onChange(sorted);
  };

  // Check if already sorted
  const isSorted = useMemo(() => {
    if (!orderBy || value.length < 2) return true;
    for (let i = 1; i < value.length; i++) {
      const prev = parseFloat(value[i - 1]?.[orderBy]) || 0;
      const cur = parseFloat(value[i]?.[orderBy]) || 0;
      if (cur < prev) return false;
    }
    return true;
  }, [value, orderBy]);

  // Validation Logic
  let globalErrors = [];
  let rowErrors = {};

  if (mode !== "single") {
    // Check minimum rows requirement
    if (required && minRows > 0 && value.length < minRows) {
      globalErrors.push(
        `At least ${minRows} row${minRows > 1 ? "s" : ""} required`,
      );
    }

    if (validate) {
      const result =
        typeof validate === "function" ? validate(value) : validate;
      if (Array.isArray(result)) {
        globalErrors = [...globalErrors, ...result];
      } else if (result && typeof result === "object") {
        globalErrors = [...globalErrors, ...(result.global || [])];
        rowErrors = result.rows || {};
      }
    } else {
      // Internal Default Validation
      const rErrors = {};

      value.forEach((s, i) => {
        const currentErrors = {};
        const currentOrderVal = parseFloat(s[orderBy]);

        // Check required/numeric for all columns
        columns.forEach((col) => {
          const cellValue = s[col.key];

          // 1. Required check
          if (
            col.required &&
            (cellValue === "" || cellValue === null || cellValue === undefined)
          ) {
            currentErrors[col.key] = `Required`;
          }

          // 2. Numeric check
          if (
            col.type === "number" &&
            cellValue !== "" &&
            cellValue !== null &&
            cellValue !== undefined
          ) {
            const val = parseFloat(cellValue);
            if (isNaN(val)) {
              currentErrors[col.key] = `Invalid number`;
            } else if (col.min !== undefined && val < col.min) {
              currentErrors[col.key] = `Min ${col.min}`;
            } else if (col.max !== undefined && val > col.max) {
              currentErrors[col.key] = `Max ${col.max}`;
            }
          }
        });

        // Check OrderBy Increasing (only if orderBy value exists and is valid)
        if (orderBy && !currentErrors[orderBy]) {
          if (
            s[orderBy] !== "" &&
            s[orderBy] !== null &&
            s[orderBy] !== undefined
          ) {
            if (isNaN(currentOrderVal) || currentOrderVal < 0) {
              currentErrors[orderBy] = `Must be >= 0`;
            } else if (i > 0) {
              const prevOrderVal = parseFloat(value[i - 1][orderBy]);
              if (!isNaN(prevOrderVal) && currentOrderVal <= prevOrderVal) {
                currentErrors[orderBy] = `Must be > ${prevOrderVal}`;
              }
            }
          }
        }

        if (Object.keys(currentErrors).length > 0) {
          rErrors[i] = currentErrors;
        }
      });
      rowErrors = rErrors;
    }
  }

  // Filter out empty rows for preview
  const nonEmptySlabs = value.filter((s) =>
    Object.values(s).some((v) => v !== "" && v !== null && v !== undefined),
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header with Title and Toggle */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {title && (
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          )}
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center space-x-1 bg-gray-200/50 p-1 rounded-lg self-start sm:self-center shrink-0">
          <button
            type="button"
            onClick={() => handleModeChange("single")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              mode === "single"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {singleLabel}
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("slab")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              mode === "slab"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {slabLabel}
          </button>
        </div>
      </div>

      {/* Mode: Single */}
      {mode === "single" && <div className="p-6">{renderSingle}</div>}

      {/* Mode: Slab */}
      {mode !== "single" && (
        <div className="flex flex-col lg:flex-row">
          {/* Input Area */}
          <div className="flex-1 p-4 lg:p-6 lg:border-r border-gray-100">
            {/* Global Errors */}
            {globalErrors.length > 0 && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 space-y-1">
                {globalErrors.map((err, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <InformationCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{err}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3">
              {/* Header Row with Sort and Add Buttons */}
              <div className="flex items-center justify-between mb-2">
                <div className="hidden sm:flex gap-4 px-2 text-xs font-medium text-gray-500 uppercase tracking-wide flex-1">
                  {columns.map((col) => (
                    <div key={col.key} className="flex-1">
                      {col.label}
                      {col.required && (
                        <span className="text-red-500 ml-0.5">*</span>
                      )}
                    </div>
                  ))}
                  <div className="w-8"></div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {/* Sort Button */}
                  {showSortButton && orderBy && value.length >= 2 && (
                    <button
                      type="button"
                      onClick={sortSlabs}
                      disabled={isSorted}
                      className={clsx(
                        "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors",
                        isSorted
                          ? "border-gray-200 text-gray-400 cursor-not-allowed"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100",
                      )}
                      title={sortButtonLabel}
                    >
                      <ArrowsUpDownIcon className="h-3 w-3" />
                      {sortButtonLabel}
                    </button>
                  )}
                </div>
              </div>

              {/* Rows */}
              {value.map((slab, index) => {
                const rowError = rowErrors[index];
                return (
                  <div key={index} className="group relative">
                    <div
                      className={clsx(
                        "flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-2 rounded-lg transition-all",
                        "bg-gray-50 sm:bg-transparent border sm:border-0 border-gray-100",
                        rowError ? "sm:bg-red-50/30" : "hover:bg-gray-50",
                      )}
                    >
                      {columns.map((col) => (
                        <div key={col.key} className="flex-1 relative">
                          <span className="sm:hidden text-xs font-medium text-gray-500 mb-1 block">
                            {col.label}
                          </span>
                          <div className="relative">
                            {col.prefix && (
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">
                                  {col.prefix}
                                </span>
                              </div>
                            )}
                            <input
                              type={col.type || "text"}
                              value={slab[col.key]}
                              onChange={(e) =>
                                updateSlab(index, col.key, e.target.value)
                              }
                              placeholder={col.placeholder}
                              className={clsx(
                                "block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-1.5",
                                col.prefix && "pl-7",
                                col.suffix && "pr-8",
                                rowError?.[col.key] &&
                                  "border-red-300 focus:border-red-500 focus:ring-red-500",
                              )}
                              min={col.min}
                            />
                            {col.suffix && (
                              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">
                                  {col.suffix}
                                </span>
                              </div>
                            )}
                          </div>
                          {/* Inline Cell Error */}
                          {rowError?.[col.key] && (
                            <div className="absolute left-0 -bottom-5 text-[10px] text-red-600 font-medium z-10 hidden sm:block">
                              {rowError[col.key]}
                            </div>
                          )}
                          {/* Mobile Error */}
                          {rowError?.[col.key] && (
                            <p className="text-xs text-red-600 mt-1 sm:hidden">
                              {rowError[col.key]}
                            </p>
                          )}
                        </div>
                      ))}

                      <div className="flex justify-end sm:justify-start items-center sm:w-8 pt-2 sm:pt-0">
                        <button
                          type="button"
                          onClick={() => removeSlab(index)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Empty State */}
              {value.length === 0 && (
                <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                  <p className="text-sm text-gray-500">No slabs added yet.</p>
                  <button
                    type="button"
                    onClick={addSlab}
                    className="mt-2 text-sm text-blue-600 font-medium hover:text-blue-700"
                  >
                    + Add first slab
                  </button>
                </div>
              )}
            </div>

            {/* Add Button */}
            {value.length > 0 && (
              <button
                type="button"
                onClick={addSlab}
                className="mt-4 flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Add Row</span>
              </button>
            )}

            {/* Slab Bottom Content (e.g. Tax field) */}
            {renderSlabBottom && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                {renderSlabBottom}
              </div>
            )}
          </div>

          {/* Preview Area (Right/Bottom) */}
          {previewRenderer && (
            <div className="lg:w-72 bg-gray-50/50 lg:bg-transparent border-t lg:border-t-0 lg:border-l border-gray-100">
              {/* Mobile Accordion Toggle */}
              <button
                type="button"
                className="w-full flex items-center justify-between p-4 lg:cursor-default lg:pointer-events-none"
                onClick={() => setMobilePreviewOpen(!mobilePreviewOpen)}
              >
                <span className="text-sm font-medium text-gray-700">
                  Live Preview
                </span>
                <span className="lg:hidden">
                  {mobilePreviewOpen ? (
                    <ChevronUpIcon className="h-4 w-4" />
                  ) : (
                    <ChevronDownIcon className="h-4 w-4" />
                  )}
                </span>
              </button>

              {/* Preview Content */}
              <div
                className={clsx(
                  "px-4 pb-4 lg:block transition-all duration-200 ease-in-out overflow-hidden scrollbar-thin",
                  mobilePreviewOpen
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0 lg:max-h-full lg:opacity-100",
                )}
              >
                {nonEmptySlabs.length > 0 ? (
                  previewRenderer ? (
                    previewRenderer(nonEmptySlabs)
                  ) : previewConfig ? (
                    <div className="space-y-2">
                      {[...nonEmptySlabs]
                        .sort((a, b) => {
                          const key = previewConfig.orderBy;
                          if (!key) return 0;
                          return (
                            (parseFloat(a[key]) || 0) -
                            (parseFloat(b[key]) || 0)
                          );
                        })
                        .map((slab, i, arr) => {
                          const label = previewConfig.label(slab, arr[i + 1]);
                          const val = previewConfig.value(slab);
                          return (
                            <div
                              key={i}
                              className="flex justify-between items-center text-sm border-b border-gray-100 last:border-0 py-1"
                            >
                              <span className="text-gray-600 font-medium">
                                {label}
                              </span>
                              <span className="font-semibold">{val}</span>
                            </div>
                          );
                        })}
                    </div>
                  ) : null
                ) : (
                  <div className="text-xs text-gray-400 italic py-2">
                    Add data to see preview...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
