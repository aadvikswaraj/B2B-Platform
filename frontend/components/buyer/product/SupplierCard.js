"use client";
import Link from "next/link";
import {
  CheckBadgeIcon,
  ClockIcon,
  TruckIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  BuildingStorefrontIcon,
  ShieldCheckIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

import { useState } from "react";
import ContactSellerModal from "@/components/common/ContactSellerModal";

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * SupplierCard - Enhanced supplier info card with trust indicators
 */
const SupplierCard = ({ supplier, className = "", hideActions = false }) => {
  const companyId = supplier?.id || supplier?.slug || slugify(supplier?.name);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Transaction level colors
  const levelColors = {
    Diamond: "bg-gradient-to-r from-blue-500 to-purple-500 text-white",
    Gold: "bg-gradient-to-r from-amber-400 to-amber-600 text-white",
    Silver: "bg-gradient-to-r from-gray-400 to-gray-500 text-white",
    Bronze: "bg-gradient-to-r from-orange-400 to-orange-600 text-white",
  };

  return (
    <div
      className={`rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
        <Link
          href={`/company/${companyId}`}
          className="flex items-center gap-3 group"
        >
          <div className="relative">
            <img
              src={
                supplier.logo ||
                "https://placehold.co/60x60/f3f4f6/9ca3af?text=Logo"
              }
              alt={supplier.name}
              className="w-14 h-14 rounded-lg object-cover border border-gray-200"
            />
            {supplier.isVerified && (
              <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                <CheckBadgeIcon className="h-3 w-3 text-white" />
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
              {supplier.name}
            </h3>
            <p className="text-xs text-gray-500 truncate">
              {supplier.location}
            </p>
            <div className="mt-1 flex items-center gap-2">
              {supplier.transactionLevel && (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    levelColors[supplier.transactionLevel] ||
                    "bg-gray-200 text-gray-700"
                  }`}
                >
                  {supplier.transactionLevel}
                </span>
              )}
              {supplier.yearsInBusiness && (
                <span className="text-[10px] text-gray-500">
                  {supplier.yearsInBusiness}+ yrs
                </span>
              )}
            </div>
          </div>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 divide-x divide-gray-100 border-b border-gray-100">
        <div className="p-3 text-center">
          <div className="flex items-center justify-center gap-1.5">
            <ClockIcon className="h-4 w-4 text-indigo-500" />
            <span className="text-sm font-semibold text-gray-900">
              {supplier.responseTime || "< 24h"}
            </span>
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5">Response Time</p>
        </div>
        <div className="p-3 text-center">
          <div className="flex items-center justify-center gap-1.5">
            <TruckIcon className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-semibold text-gray-900">
              {supplier.onTimeDelivery || "95%"}
            </span>
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5">On-time Delivery</p>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <ShieldCheckIcon className="h-4 w-4 text-emerald-500 flex-shrink-0" />
          <span>Trade Assurance Protection</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <BuildingStorefrontIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />
          <span>{supplier.businessType || "Manufacturer"}</span>
        </div>
        {supplier.rating && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <StarIcon className="h-4 w-4 text-amber-500 flex-shrink-0" />
            <span>{supplier.rating} Supplier Rating</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {!hideActions && (
        <div className="p-3 pt-0 space-y-2">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
            <ChatBubbleLeftRightIcon className="h-4 w-4" />
            Chat Now
          </button>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsContactModalOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <PhoneIcon className="h-4 w-4" />
              Call
            </button>
            <Link
              href={`/company/${companyId}`}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <BuildingStorefrontIcon className="h-4 w-4" />
              Visit
            </Link>
          </div>
        </div>
      )}
      
      <ContactSellerModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        sellerId={supplier?._id || supplier?.id}
      />
    </div>
  );
};

export default SupplierCard;
