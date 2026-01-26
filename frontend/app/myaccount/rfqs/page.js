"use client";

import { ScreenSpinner } from "@/components/ui/ScreenSpinner";
import buyerBuyRequirementAPI from "@/utils/api/buyer/buyRequirement";
import useListQuery from "@/utils/listQueryManager";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import {
  AiOutlineSearch,
  AiOutlineMessage,
  AiOutlineLoading3Quarters,
  AiOutlineDown,
  AiOutlineUp,
} from "react-icons/ai";
import { BsBuilding, BsBoxSeam, BsCheckCircleFill } from "react-icons/bs";

const PostRequirementFormDialog = dynamic(
  () => import("@/components/buyer/PostBuyRequirementDialog"),
  {
    ssr: false,
    loading: () => <ScreenSpinner />,
  },
);

const TABS = [
  { id: "", label: "All RFQs" },
  { id: "active", label: "Active" },
  { id: "fulfilled", label: "Fulfilled" },
];

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    active: "bg-blue-100 text-blue-700 border-blue-200",
    fulfilled: "bg-emerald-100 text-emerald-700 border-emerald-200",
    expired: "bg-slate-100 text-slate-600 border-slate-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
  };

  const labels = {
    pending: "Pending Verification",
    active: "Active",
    fulfilled: "Fulfilled",
    expired: "Expired",
    rejected: "Rejected",
  };

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        styles[status] || styles.pending
      } flex items-center gap-1.5`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
      {labels[status] || status}
    </span>
  );
}

function VerificationBadge({ verification }) {
  const isVerified = verification?.status === "verified";

  if (isVerified) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
        <BsCheckCircleFill className="w-3 h-3" />
        {verification?.category?.name || "Verified"}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
      <AiOutlineLoading3Quarters className="w-3 h-3 animate-spin" />
      Verification Pending
    </span>
  );
}

function QuoteItem({ quote }) {
  return (
    <div className="bg-white border rounded-lg p-3 sm:p-4 mb-3 last:mb-0 hover:border-blue-300 transition-colors shadow-sm">
      <div className="flex flex-col md:flex-row justify-between gap-3 sm:gap-4">
        {/* Seller Info */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-sm flex-shrink-0">
            {quote.seller?.name?.substring(0, 2).toUpperCase() || "SE"}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
              {quote.seller?.name || "Unknown Seller"}
            </h4>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
              <span className="flex items-center gap-1">
                <BsCheckCircleFill className="text-blue-500" /> Verified
              </span>
            </div>
          </div>
        </div>

        {/* Pricing & Details */}
        <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-sm mt-2 md:mt-0 bg-gray-50 p-2 sm:p-0 sm:bg-transparent rounded-lg">
          <div>
            <p className="text-gray-500 text-[10px] sm:text-xs mb-0.5 uppercase tracking-wide">
              Price
            </p>
            <p className="font-semibold text-gray-900 text-sm">
              ₹ {quote.price?.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 gap-3">
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <button className="px-3 py-1.5 bg-black text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm flex items-center gap-1.5">
            <AiOutlineMessage className="w-3.5 h-3.5" />
            Chat
          </button>
        </div>
      </div>
    </div>
  );
}

function RFQCard({ rfq }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasQuotes = rfq.quotes && rfq.quotes.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md mb-4 px-0">
      <div className="p-4 sm:p-5">
        {/* Top Row */}
        <div className="flex gap-4 mb-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shrink-0 border border-blue-100">
            <BsBoxSeam className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-tight line-clamp-2 mb-1">
                  {rfq.productName}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] items-center font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                    #{rfq._id.slice(-6).toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(rfq.createdAt).toLocaleDateString()}
                  </span>
                  <VerificationBadge verification={rfq.verification} />
                </div>
              </div>
              <div className="mt-2 sm:mt-0 self-start">
                <StatusBadge status={rfq.status} />
              </div>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-3 gap-x-4 mb-4 text-sm">
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">
              Quantity
            </span>
            <p className="font-medium text-gray-900">
              {rfq.quantity}{" "}
              <span className="text-gray-500 font-normal">{rfq.unit}</span>
            </p>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">
              Budget
            </span>
            <p className="font-medium text-gray-900">
              ₹{rfq.budget?.min?.toLocaleString()} -{" "}
              {rfq.budget?.max?.toLocaleString()}
            </p>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">
              City
            </span>
            <div className="flex items-center gap-1 font-medium text-gray-900 truncate">
              <BsBuilding className="text-gray-400 shrink-0" />
              <span className="truncate">{rfq.city}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-gray-50 rounded-lg p-3 text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">
          <span className="font-medium text-gray-900">Details: </span>
          {rfq.description}
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {hasQuotes ? (
            <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
              <span className="flex h-1.5 w-1.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
              </span>
              <span className="text-xs font-bold">
                {rfq.quotes.length} Quotes
              </span>
            </div>
          ) : (
            <span className="text-xs text-gray-400 italic pl-1">
              Waiting for quotes...
            </span>
          )}
        </div>

        <button
          onClick={() => hasQuotes && setIsExpanded(!isExpanded)}
          disabled={!hasQuotes}
          className={`flex items-center gap-1.5 text-xs sm:text-sm font-medium transition-colors px-3 py-1.5 rounded-lg
                ${
                  hasQuotes
                    ? "text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer border border-transparent hover:border-gray-200"
                    : "text-gray-300 cursor-not-allowed"
                }`}
        >
          {isExpanded ? "Hide" : "View Quotes"}
          {isExpanded ? (
            <AiOutlineUp className="w-3 h-3" />
          ) : (
            <AiOutlineDown className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Collapsible Quotes */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out bg-gray-50/50 border-t border-gray-100 shadow-inner ${
          isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-3 sm:p-4 space-y-3">
          <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2 ml-1">
            Received Quotes
          </h4>
          {rfq.quotes?.map((quote) => (
            <QuoteItem key={quote._id} quote={quote} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RFQsPage() {
  const [activeTab, setActiveTab] = useState("");
  const [search, setSearch] = useState("");
  const [showPostReq, setShowPostReq] = useState(false);

  // Single hook - all state managed internally
  const {
    items: docs,
    loading,
    handlers,
  } = useListQuery({
    apiFn: buyerBuyRequirementAPI.list,
    initialQuery: {},
  });

  useEffect(() => {
    handlers.onFilterChange({ status: activeTab });
  }, [activeTab]);

  useEffect(() => {
    handlers.onSearchChange(search);
  }, [search]);

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-3 sm:p-6 lg:p-8 pb-24">
      <PostRequirementFormDialog
        open={showPostReq}
        onClose={() => setShowPostReq(false)}
      />
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              My RFQs
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Track requirements & compare quotes
            </p>
          </div>

          <button
            onClick={() => setShowPostReq(true)}
            className="flex items-center justify-center gap-1.5 bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-md transition-all active:scale-95 w-full sm:w-auto"
          >
            <span className="text-lg leading-none">+</span> Post Requirement
          </button>
        </div>

        {/* Controls */}
        <div className="bg-white p-1.5 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-2">
          {/* Tabs */}
          <div className="flex overflow-x-auto scrollbar-hide p-0.5 gap-1 flex-1 -mx-1 sm:mx-0 px-1 sm:px-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex-shrink-0
                            ${
                              activeTab === tab.id
                                ? "bg-gray-100 text-gray-900 shadow-sm ring-1 ring-black/5"
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                            }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative md:w-64">
            <AiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search RFQs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border-transparent focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-gray-100 rounded-lg text-sm transition-all outline-none"
            />
          </div>
        </div>

        {/* List Content */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <AiOutlineLoading3Quarters className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : docs.length > 0 ? (
            docs.map((rfq) => <RFQCard key={rfq._id} rfq={rfq} />)
          ) : (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-gray-300 mx-auto">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3 text-gray-400">
                <BsBoxSeam className="w-6 h-6" />
              </div>
              <h3 className="text-base font-medium text-gray-900">
                No RFQs found
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                {activeTab === "all"
                  ? "You haven't posted any requirements yet."
                  : `No ${activeTab} RFQs found.`}
              </p>
              <button
                onClick={() => {
                  if (activeTab !== "all") setActiveTab("all");
                  else setShowPostReq(true);
                }}
                className="mt-4 text-sm text-blue-600 font-medium hover:underline"
              >
                {activeTab === "all" ? "Post a Requirement" : "Clear Filters"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
