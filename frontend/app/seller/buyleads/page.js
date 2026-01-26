"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { getBuyLeads } from "@/utils/api/seller/buyleads";
import { useDebounce } from "@/hooks/useDebounce"; // Assuming this hook exists, or I'll implement a simple one
// If useDebounce doesn't exist, I'll use a local implementation or setTimeout.
import { useRouter } from "next/navigation";

// Utility for formatting currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function BuyLeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filters
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [city, setCity] = useState("");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");

  const debouncedQuery = useDebounce(query, 500);
  const debouncedCity = useDebounce(city, 500);
  const debouncedMinBudget = useDebounce(minBudget, 500);
  const debouncedMaxBudget = useDebounce(maxBudget, 500);

  const fetchLeads = useCallback(
    async (reset = false) => {
      try {
        setLoading(true);
        const currentPage = reset ? 1 : page;
        const response = await getBuyLeads({
          page: currentPage,
          limit: 10,
          search: debouncedQuery,
          city: debouncedCity,
          tags: selectedTags,
          minBudget: debouncedMinBudget,
          maxBudget: debouncedMaxBudget,
        });

        if (response.success) {
          setLeads((prev) =>
            reset ? response.data.leads : [...prev, ...response.data.leads],
          );
          setTotalPages(response.data.totalPages);
          if (reset) setPage(1);
        }
      } catch (error) {
        console.error("Failed to fetch buy leads", error);
      } finally {
        setLoading(false);
      }
    },
    [
      page,
      debouncedQuery,
      debouncedCity,
      selectedTags,
      debouncedMinBudget,
      debouncedMaxBudget,
    ],
  );

  useEffect(() => {
    fetchLeads(true);
  }, [
    debouncedQuery,
    debouncedCity,
    selectedTags,
    debouncedMinBudget,
    debouncedMaxBudget,
  ]);

  const loadMore = () => {
    if (page < totalPages && !loading) {
      setPage((prev) => prev + 1);
    }
  };

  // Effects for pagination
  useEffect(() => {
    if (page > 1) {
      fetchLeads(false);
    }
  }, [page]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 md:py-4 md:px-8 flex justify-between items-center transition-all duration-300">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
            Buy Leads
          </h1>
          <p className="text-xs md:text-sm text-gray-500 font-medium">
            Verified requirements from buyers
          </p>
        </div>
        <button
          onClick={() => setFiltersOpen(true)}
          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors md:hidden"
        >
          <FunnelIcon className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="flex gap-8">
          {/* Desktop Filter Sidebar */}
          <div className="hidden md:block w-72 shrink-0">
            <div className="sticky top-24 space-y-6">
              <FilterContent
                query={query}
                setQuery={setQuery}
                city={city}
                setCity={setCity}
                minBudget={minBudget}
                setMinBudget={setMinBudget}
                maxBudget={maxBudget}
                setMaxBudget={setMaxBudget}
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
              />
            </div>
          </div>

          {/* Lead List */}
          <div className="flex-1 space-y-4">
            {/* Mobile Filter Sheet */}
            {filtersOpen && (
              <div className="fixed inset-0 z-50 flex justify-end md:hidden">
                <div
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                  onClick={() => setFiltersOpen(false)}
                />
                <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl p-6 overflow-y-auto animate-slide-in-right">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold">Filters</h2>
                    <button onClick={() => setFiltersOpen(false)}>
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>
                  <FilterContent
                    query={query}
                    setQuery={setQuery}
                    city={city}
                    setCity={setCity}
                    minBudget={minBudget}
                    setMinBudget={setMinBudget}
                    maxBudget={maxBudget}
                    setMaxBudget={setMaxBudget}
                    selectedTags={selectedTags}
                    setSelectedTags={setSelectedTags}
                  />
                </div>
              </div>
            )}

            {leads.length === 0 && !loading ? (
              <div className="text-center py-20">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-gray-900 font-medium text-lg">
                  No leads found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your filters or search terms.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {leads.map((lead) => (
                  <LeadCard key={lead._id} lead={lead} />
                ))}
              </div>
            )}

            {loading && (
              <div className="py-10 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-indigo-600"></div>
              </div>
            )}

            {!loading && page < totalPages && (
              <div className="text-center pt-4">
                <button
                  onClick={loadMore}
                  className="bg-white border border-gray-200 text-gray-700 px-6 py-2 rounded-full shadow-sm hover:bg-gray-50 font-medium transition-all text-sm"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterContent({
  query,
  setQuery,
  city,
  setCity,
  minBudget,
  setMinBudget,
  maxBudget,
  setMaxBudget,
  selectedTags,
  setSelectedTags,
}) {
  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-semibold text-gray-700 mb-2 block">
          Search
        </label>
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-700 mb-2 block">
          Location
        </label>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city..."
          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-700 mb-2 block">
          Budget Range
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            value={minBudget}
            onChange={(e) => setMinBudget(e.target.value)}
            placeholder="Min"
            className="w-1/2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
          <input
            type="number"
            value={maxBudget}
            onChange={(e) => setMaxBudget(e.target.value)}
            placeholder="Max"
            className="w-1/2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Placeholder for Tags - can be fetched from API later */}
      <div>
        <label className="text-sm font-semibold text-gray-700 mb-2 block">
          Tags
        </label>
        <div className="flex flex-wrap gap-2">
          {["Bulk", "Urgent", "Export", "Verified"].map((tag) => (
            <button
              key={tag}
              onClick={() => {
                if (selectedTags.includes(tag)) {
                  setSelectedTags(selectedTags.filter((t) => t !== tag));
                } else {
                  setSelectedTags([...selectedTags, tag]);
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedTags.includes(tag)
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function LeadCard({ lead }) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div>
          {lead.verification?.status === "verified" && (
            <div className="flex items-center gap-1 text-green-600 text-[10px] font-bold uppercase tracking-wider mb-1">
              <CheckBadgeIcon className="w-3.5 h-3.5" />
              <span>Verified Buyer</span>
            </div>
          )}
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
            {lead.productName}
          </h3>
          <p className="text-sm text-gray-500 font-medium mt-0.5">
            {lead.quantity} {lead.unit} needed
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">
            Budget
          </div>
          <div className="text-sm font-bold text-gray-900">
            {formatCurrency(lead.budget.min)} -{" "}
            {formatCurrency(lead.budget.max)}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {lead.tags.map((tag, i) => (
          <span
            key={i}
            className="px-2 py-1 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wide"
          >
            {tag}
          </span>
        ))}
        {lead.city && (
          <span className="px-2 py-1 rounded bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wide">
            {lead.city}
          </span>
        )}
      </div>

      <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
        <span className="text-xs text-gray-400 font-medium">
          Posted {new Date(lead.createdAt).toLocaleDateString()}
        </span>
        <button
          onClick={() => {
            // Logic to view details or unlock
          }}
          className="bg-gray-900 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-gray-900/10 hover:shadow-gray-900/20 hover:-translate-y-0.5 active:translate-y-0 transition-transform"
        >
          View Details
        </button>
      </div>
    </div>
  );
}
