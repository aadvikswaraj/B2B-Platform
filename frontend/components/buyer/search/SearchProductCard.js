"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ShoppingCartIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  CheckBadgeIcon,
  ClockIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";

/**
 * SearchProductCard - Product card with Grid, List, and Compact variants
 * CTAs are always visible for better UX
 */
const SearchProductCard = ({
  product = {},
  variant = "grid",
  onAddToCart,
  onInquiry,
  onCall,
}) => {
  const {
    _id,
    id = _id,
    title = "Product Title",
    images = [],
    price = {},
    support = {},
    logistics = {},
    seller = {},
    brand = {},
    moq = 1,
    rating = 4.5,
    reviewCount = 0,
    isVerified = false,
  } = product;

  // Get primary image
  const primaryImage = images?.[0]?.relativePath
    ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/${images[0].relativePath}`
    : "https://placehold.co/400x400/f3f4f6/9ca3af?text=No+Image";

  // Calculate price display
  const getPriceDisplay = () => {
    if (price?.type === "slab" && price?.slabs?.length > 0) {
      const sortedSlabs = [...price.slabs].sort(
        (a, b) => a.minQuantity - b.minQuantity
      );
      const minPrice = Math.min(...sortedSlabs.map((s) => s.price));
      const maxPrice = Math.max(...sortedSlabs.map((s) => s.price));
      return { min: minPrice, max: maxPrice, isSlab: true };
    }
    return {
      min: price?.singlePrice || 0,
      max: price?.singlePrice || 0,
      isSlab: false,
    };
  };

  const priceDisplay = getPriceDisplay();

  const formatPrice = (val) => {
    if (!val) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getDispatchTime = () => {
    const parcel = logistics?.dispatchTime?.parcel;
    if (parcel?.type === "single" && parcel?.days) {
      return `${parcel.days}d`;
    }
    return null;
  };

  const hasFreightSupport =
    support?.freight?.amount > 0 || support?.freight?.slabs?.length > 0;

  // Render stars
  const renderStars = (rating) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          className={`h-3 w-3 ${
            star <= Math.floor(rating) ? "text-amber-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(product);
  };

  const handleInquiry = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onInquiry?.(product);
  };

  const handleCall = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onCall?.(product);
  };

  // ============ GRID VARIANT ============
  if (variant === "grid") {
    return (
      <div className="group bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:border-indigo-100 transition-all">
        <Link href={`/product/${id}`} className="block">
          {/* Image Container */}
          <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
            <Image
              src={primaryImage}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {isVerified && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500 text-white">
                  <CheckBadgeIcon className="h-3 w-3" /> Verified
                </span>
              )}
              {hasFreightSupport && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500 text-white">
                  <TruckIcon className="h-3 w-3" /> Free Ship
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-3 space-y-2">
            {/* Title */}
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug min-h-[2.5rem]">
              {title}
            </h3>

            {/* Price */}
            <div className="flex items-baseline gap-1 flex-wrap">
              <span className="text-base font-bold text-indigo-600">
                {formatPrice(priceDisplay.min)}
              </span>
              {priceDisplay.isSlab && (
                <span className="text-xs text-gray-400">onwards</span>
              )}
            </div>

            {/* Meta Info */}
            <div className="flex items-center gap-2 text-[10px] text-gray-500">
              <span className="px-1.5 py-0.5 rounded bg-gray-100">
                MOQ: {moq}
              </span>
              {getDispatchTime() && (
                <span className="flex items-center gap-0.5">
                  <ClockIcon className="h-3 w-3" /> {getDispatchTime()}
                </span>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1.5">
              {renderStars(rating)}
              <span className="text-[10px] text-gray-400">({reviewCount})</span>
            </div>
          </div>
        </Link>

        {/* CTAs - Always Visible */}
        <div className="px-3 pb-3 flex gap-2">
          <button
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition-colors"
          >
            <ShoppingCartIcon className="h-4 w-4" />
            Add
          </button>
          <button
            onClick={handleInquiry}
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            title="Send Inquiry"
          >
            <ChatBubbleLeftRightIcon className="h-4 w-4" />
          </button>
          <button
            onClick={handleCall}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
            title="Call Seller"
          >
            <PhoneIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // ============ LIST VARIANT ============
  if (variant === "list") {
    return (
      <div className="group flex bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:border-indigo-100 transition-all">
        <Link href={`/product/${id}`} className="flex flex-1 min-w-0">
          {/* Image */}
          <div className="relative w-44 flex-shrink-0 bg-gray-50">
            <Image
              src={primaryImage}
              alt={title}
              fill
              className="object-cover"
              sizes="176px"
            />
            {isVerified && (
              <span className="absolute top-2 left-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500 text-white">
                <CheckBadgeIcon className="h-3 w-3" /> Verified
              </span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
                {title}
              </h3>

              {/* Price */}
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="text-lg font-bold text-indigo-600">
                  {formatPrice(priceDisplay.min)}
                </span>
                {priceDisplay.isSlab && (
                  <span className="text-xs text-gray-400">
                    - {formatPrice(priceDisplay.max)}
                  </span>
                )}
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {hasFreightSupport && (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700">
                    <TruckIcon className="h-3 w-3" /> Free Shipping
                  </span>
                )}
              </div>

              {/* Meta */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>MOQ: {moq}</span>
                {getDispatchTime() && <span>Lead: {getDispatchTime()}</span>}
                {seller?.companyName && <span>{seller.companyName}</span>}
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mt-2">
              {renderStars(rating)}
              <span className="text-xs text-gray-400">({reviewCount})</span>
            </div>
          </div>
        </Link>

        {/* CTAs */}
        <div className="flex flex-col justify-center gap-2 p-3 border-l border-gray-100">
          <button
            onClick={handleAddToCart}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition-colors"
          >
            <ShoppingCartIcon className="h-4 w-4" />
            Add to Cart
          </button>
          <button
            onClick={handleInquiry}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-50 transition-colors"
          >
            <ChatBubbleLeftRightIcon className="h-4 w-4" />
            Inquiry
          </button>
          <button
            onClick={handleCall}
            className="flex items-center justify-center w-full py-2 rounded-lg bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 transition-colors"
          >
            <PhoneIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // ============ COMPACT VARIANT (Mobile) ============
  return (
    <div className="flex bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
      <Link href={`/product/${id}`} className="flex flex-1 min-w-0">
        {/* Image */}
        <div className="relative w-20 h-20 flex-shrink-0 bg-gray-50">
          <Image
            src={primaryImage}
            alt={title}
            fill
            className="object-cover"
            sizes="80px"
          />
          {isVerified && (
            <span className="absolute top-1 left-1 h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center">
              <CheckBadgeIcon className="h-2.5 w-2.5 text-white" />
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-2 min-w-0">
          <h3 className="text-xs font-medium text-gray-900 line-clamp-1">
            {title}
          </h3>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-sm font-bold text-indigo-600">
              {formatPrice(priceDisplay.min)}
            </span>
            {priceDisplay.isSlab && (
              <span className="text-[10px] text-gray-400">+</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-500">
            <span>MOQ: {moq}</span>
            {getDispatchTime() && <span>• {getDispatchTime()}</span>}
          </div>
        </div>
      </Link>

      {/* CTAs */}
      <div className="flex items-center gap-1 px-2 border-l border-gray-100">
        <button
          onClick={handleAddToCart}
          className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-600 text-white active:bg-indigo-700"
        >
          <ShoppingCartIcon className="h-4 w-4" />
        </button>
        <button
          onClick={handleInquiry}
          className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-600 active:bg-gray-200"
        >
          <ChatBubbleLeftRightIcon className="h-4 w-4" />
        </button>
        <button
          onClick={handleCall}
          className="flex items-center justify-center h-8 w-8 rounded-full bg-emerald-500 text-white active:bg-emerald-600"
        >
          <PhoneIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default SearchProductCard;
