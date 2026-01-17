"use client";

import { useState, useRef } from "react";
import {
  XMarkIcon,
  ChevronDownIcon,
  CheckIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";

/**
 * SearchFilters - Advanced filter panel for search sidebar and mobile drawer
 */
const SearchFilters = ({
  filters = {},
  onChange,
  onReset,
  categories = [],
  className = "",
}) => {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    moq: false,
    features: true,
  });

  const toggleSection = (key) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateFilter = (key, value) => {
    onChange?.({ ...filters, [key]: value });
  };

  // Filter Section Component
  const FilterSection = ({ title, sectionKey, children }) => (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex items-center justify-between py-3 text-left"
      >
        <span className="text-sm font-semibold text-gray-800">{title}</span>
        <ChevronDownIcon
          className={`h-4 w-4 text-gray-400 transition-transform ${
            expandedSections[sectionKey] ? "rotate-180" : ""
          }`}
        />
      </button>
      {expandedSections[sectionKey] && (
        <div className="pb-4 animate-in fade-in duration-200">{children}</div>
      )}
    </div>
  );

  // Checkbox Option
  const CheckboxOption = ({ label, checked, onChange, count }) => (
    <label className="flex items-center justify-between py-1.5 cursor-pointer group">
      <div className="flex items-center gap-2">
        <div
          className={`
          h-4 w-4 rounded border transition-colors flex items-center justify-center
          ${
            checked
              ? "bg-indigo-600 border-indigo-600"
              : "border-gray-300 group-hover:border-indigo-400"
          }
        `}
        >
          {checked && <CheckIcon className="h-3 w-3 text-white" />}
        </div>
        <span className="text-sm text-gray-700">{label}</span>
      </div>
      {count !== undefined && (
        <span className="text-xs text-gray-400">({count})</span>
      )}
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={onChange}
      />
    </label>
  );

  return (
    <div className={`space-y-0 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-1">
        <div className="flex items-center gap-2">
          <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-600" />
          <h3 className="text-sm font-bold text-gray-800">Filters</h3>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Reset All
        </button>
      </div>

      {/* Price Range */}
      <FilterSection title="Price Range" sectionKey="price">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="text-[10px] text-gray-500 uppercase tracking-wide">
                Min
              </label>
              <div className="relative mt-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  ₹
                </span>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.priceMin || ""}
                  onChange={(e) => updateFilter("priceMin", e.target.value)}
                  className="w-full pl-7 pr-2 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="text-gray-300 mt-5">—</div>
            <div className="flex-1">
              <label className="text-[10px] text-gray-500 uppercase tracking-wide">
                Max
              </label>
              <div className="relative mt-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  ₹
                </span>
                <input
                  type="number"
                  placeholder="Any"
                  value={filters.priceMax || ""}
                  onChange={(e) => updateFilter("priceMax", e.target.value)}
                  className="w-full pl-7 pr-2 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
          {/* Quick Price Ranges */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: "Under ₹500", max: 500 },
              { label: "₹500-2000", min: 500, max: 2000 },
              { label: "₹2000-10000", min: 2000, max: 10000 },
              { label: "Over ₹10000", min: 10000 },
            ].map((range) => (
              <button
                key={range.label}
                onClick={() => {
                  updateFilter("priceMin", range.min || "");
                  updateFilter("priceMax", range.max || "");
                }}
                className="px-2 py-1 text-[11px] rounded-full border border-gray-200 text-gray-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-colors"
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </FilterSection>

      {/* MOQ Filter */}
      <FilterSection title="Minimum Order Qty" sectionKey="moq">
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: "1+ Units", value: 1 },
            { label: "10+ Units", value: 10 },
            { label: "50+ Units", value: 50 },
            { label: "100+ Units", value: 100 },
            { label: "500+ Units", value: 500 },
          ].map((option) => {
            const isActive = filters.moqMax === option.value;
            return (
              <button
                key={option.value}
                onClick={() =>
                  updateFilter("moqMax", isActive ? null : option.value)
                }
                className={`
                  px-2.5 py-1.5 text-[11px] rounded-lg border transition-colors
                  ${
                    isActive
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "border-gray-200 text-gray-600 hover:bg-indigo-50 hover:border-indigo-200"
                  }
                `}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Features */}
      <FilterSection title="Features" sectionKey="features">
        <div className="space-y-1">
          <CheckboxOption
            label="Verified Suppliers"
            checked={filters.verified || false}
            onChange={(e) => updateFilter("verified", e.target.checked)}
          />
          <CheckboxOption
            label="Free Shipping"
            checked={filters.freeShipping || false}
            onChange={(e) => updateFilter("freeShipping", e.target.checked)}
          />
          <CheckboxOption
            label="Payment Fee Covered"
            checked={filters.paymentSupport || false}
            onChange={(e) => updateFilter("paymentSupport", e.target.checked)}
          />
          <CheckboxOption
            label="Express Dispatch"
            checked={filters.expressDispatch || false}
            onChange={(e) => updateFilter("expressDispatch", e.target.checked)}
          />
        </div>
      </FilterSection>

      {/* Rating Filter */}
      <FilterSection title="Seller Rating" sectionKey="rating">
        <div className="space-y-1">
          {[4, 3, 2, 1].map((stars) => (
            <CheckboxOption
              key={stars}
              label={
                <span className="flex items-center gap-1">
                  {stars}+ <span className="text-amber-400">★</span>
                </span>
              }
              checked={filters.minRating === stars}
              onChange={() =>
                updateFilter(
                  "minRating",
                  filters.minRating === stars ? null : stars
                )
              }
            />
          ))}
        </div>
      </FilterSection>
    </div>
  );
};

export default SearchFilters;
