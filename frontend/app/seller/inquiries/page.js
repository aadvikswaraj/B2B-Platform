"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { mockInquiries } from "@/data/mockInquiries";
import {
  Search,
  MessageSquare,
  ArrowUpRight,
  Clock,
  Filter,
  Circle,
  X,
} from "lucide-react";

export default function SellerInquiriesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Filter Logic
  const filteredInquiries = useMemo(() => {
    let list = mockInquiries;

    // Status Filter (Tabs)
    if (activeTab === "Unread") {
      list = list.filter((i) => i.status === "new");
    }

    // Search Filter
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      list = list.filter(
        (i) =>
          i.buyer.name.toLowerCase().includes(lowerQ) ||
          i.product.name.toLowerCase().includes(lowerQ) ||
          i.lastMessage.toLowerCase().includes(lowerQ),
      );
    }

    return list;
  }, [activeTab, searchQuery]);

  const handleChatNow = (inquiry) => {
    // Redirect to the new messenger with chatId
    router.push(`/seller/messages?chatId=${inquiry.id}`);
  };

  const unreadCount = mockInquiries.filter((i) => i.status === "new").length;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 pb-20 sm:pb-8">
      {/* Mobile Header */}
      <div className="sm:hidden bg-white px-4 py-3 border-b sticky top-0 z-20">
        <div className="relative flex items-center h-10 overflow-hidden">
          {/* Title & Search Icon (Default State) */}
          <div
            className={`absolute inset-0 flex items-center justify-between transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${isSearchOpen ? "opacity-0 translate-y-4 pointer-events-none" : "opacity-100 translate-y-0"}`}
          >
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Inquiries
            </h1>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 -mr-2 text-gray-600 active:bg-gray-50 rounded-full transition-colors"
            >
              <Search size={22} />
            </button>
          </div>

          {/* Search Bar (Active State) */}
          <div
            className={`absolute inset-0 flex items-center gap-3 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${isSearchOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}
          >
            <div className="relative flex-1 group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                ref={(el) => {
                  if (isSearchOpen && el) el.focus();
                }} // Auto-focus when open
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-9 py-2 bg-gray-100 border-none rounded-xl text-sm font-medium text-gray-900 placeholder-gray-500 focus:ring-0 focus:bg-gray-100 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full bg-gray-200/50"
                >
                  <X size={12} />
                </button>
              )}
            </div>
            <button
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery("");
              }}
              className="text-sm font-semibold text-blue-600 whitespace-nowrap active:opacity-70 transition-opacity px-1"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Mobile Tabs */}
        <div
          className={`overflow-hidden transition-[max-height,opacity,margin] duration-300 ease-in-out ${isSearchOpen ? "max-h-0 opacity-0 mt-0" : "max-h-20 opacity-100 mt-3"}`}
        >
          <div className="flex p-1 bg-gray-100/80 backdrop-blur-sm rounded-lg">
            {["All", "Unread"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                  activeTab === tab
                    ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/5"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
                {tab === "Unread" && unreadCount > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center bg-red-500 text-white text-[10px] font-bold px-1.5 h-4 rounded-full shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto sm:px-6 sm:py-8">
        {/* Desktop Header & Filters */}
        <div className="hidden sm:flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inquiries</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage incoming requests from buyers
            </p>
          </div>
          <div className="flex gap-4">
            <div className="flex bg-white border rounded-lg p-1">
              {["All", "Unread"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    activeTab === tab
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border rounded-lg text-sm focus:ring-2 focus:ring-blue-100 transition-all"
              />
              <Search
                size={16}
                className="absolute left-3 top-2.5 text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* List Content */}
        <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-1 sm:gap-4 sm:bg-white sm:rounded-xl sm:border sm:overflow-hidden sm:shadow-sm sm:divide-y">
          {filteredInquiries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <div className="p-4 bg-gray-100 rounded-full mb-3">
                <MessageSquare size={32} className="opacity-20" />
              </div>
              <p className="text-sm font-medium">No inquiries found</p>
            </div>
          ) : (
            filteredInquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className="bg-white p-4 sm:p-6 sm:hover:bg-gray-50 transition-colors flex flex-col sm:flex-row gap-4 sm:items-start group border-b sm:border-b-0 last:border-b-0"
              >
                {/* Mobile Card Header */}
                <div className="flex items-center justify-between sm:hidden mb-2">
                  <div className="flex items-center gap-2">
                    {inquiry.status === "new" && (
                      <Circle
                        size={8}
                        fill="currentColor"
                        className="text-blue-600"
                      />
                    )}
                    <span className="text-xs text-gray-500">
                      {inquiry.timestamp}
                    </span>
                  </div>
                  {inquiry.status === "new" && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase rounded-full">
                      New
                    </span>
                  )}
                </div>

                {/* Avatar */}
                <div className="hidden sm:flex w-12 h-12 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 items-center justify-center text-blue-600 font-bold text-lg flex-shrink-0">
                  {inquiry.buyer.initials}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1 sm:mb-0">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`text-base sm:text-lg text-gray-900 truncate ${inquiry.status === "new" ? "font-bold" : "font-semibold"}`}
                      >
                        {inquiry.buyer.name}
                      </h3>
                      <span className="hidden sm:inline-flex text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {inquiry.buyer.company}
                      </span>
                    </div>
                    <span className="hidden sm:block text-xs text-gray-400">
                      {inquiry.timestamp}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-500 mb-3 flex items-center gap-1">
                    <span className="text-gray-400">Inquiry for:</span>
                    <span className="font-medium text-gray-700">
                      {inquiry.product.name}
                    </span>
                  </p>

                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm text-gray-600 line-clamp-2 mb-4 sm:mb-0">
                    {inquiry.lastMessage}
                  </div>
                </div>

                {/* Action - Full width on mobile, button on desktop */}
                <div className="sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 mt-2 sm:mt-0">
                  <button
                    onClick={() => handleChatNow(inquiry)}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 sm:bg-white sm:border sm:border-gray-300 sm:text-gray-700 text-white rounded-lg text-sm font-medium hover:bg-blue-700 sm:hover:bg-gray-50 sm:hover:text-blue-600 transition-all shadow-sm sm:shadow-none"
                  >
                    <MessageSquare size={16} className="mr-2" />
                    Chat Now
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
