"use client";

import { useState, useMemo } from "react";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

/**
 * QuantityPriceCalculator - Compact price calculator with quantity selector
 */
const QuantityPriceCalculator = ({
  price = {},
  moq = 1,
  stock = 999,
  support = {},
  taxPercent = 0,
  onChange,
  className = "",
}) => {
  const [quantity, setQuantity] = useState(moq);

  // Get all price slabs sorted
  const priceSlabs = useMemo(() => {
    if (price?.type === "slab" && price?.slabs?.length > 0) {
      return [...price.slabs].sort((a, b) => a.minQuantity - b.minQuantity);
    }
    return [{ minQuantity: 1, price: price?.singlePrice || 0 }];
  }, [price]);

  // Calculate current price based on quantity
  const getCurrentPrice = (qty) => {
    for (let i = priceSlabs.length - 1; i >= 0; i--) {
      if (qty >= priceSlabs[i].minQuantity) {
        return priceSlabs[i].price;
      }
    }
    return priceSlabs[0]?.price || 0;
  };

  // Find active slab index
  const getActiveSlabIndex = (qty) => {
    for (let i = priceSlabs.length - 1; i >= 0; i--) {
      if (qty >= priceSlabs[i].minQuantity) {
        return i;
      }
    }
    return 0;
  };

  const currentPrice = getCurrentPrice(quantity);
  const activeSlabIndex = getActiveSlabIndex(quantity);
  const nextSlab = priceSlabs[activeSlabIndex + 1];

  // Calculate totals
  const subtotal = currentPrice * quantity;
  const tax = (subtotal * taxPercent) / 100;
  const finalTotal = subtotal + tax;

  // Format currency
  const formatPrice = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Handle quantity change
  const updateQuantity = (newQty) => {
    const validQty = Math.max(moq, Math.min(stock, newQty));
    setQuantity(validQty);
    onChange?.(validQty, getCurrentPrice(validQty));
  };

  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white overflow-hidden ${className}`}
    >
      {/* Header with main price */}
      <div className="p-4 bg-gradient-to-r from-indigo-50 to-white border-b border-gray-100">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-2xl font-bold text-indigo-600">
            {formatPrice(currentPrice)}
          </span>
          <span className="text-sm text-gray-500">/unit</span>
        </div>
        {priceSlabs.length > 1 && (
          <p className="text-xs text-gray-500 mt-1">Price varies by quantity</p>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Price Slabs - Compact */}
        {priceSlabs.length > 1 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500">
              Quantity Pricing
            </p>
            <div className="flex flex-wrap gap-1.5">
              {priceSlabs.map((slab, idx) => {
                const isActive = idx === activeSlabIndex;
                return (
                  <button
                    key={idx}
                    onClick={() => updateQuantity(slab.minQuantity)}
                    className={`
                      relative px-2.5 py-1.5 rounded-lg border text-xs transition-all
                      ${
                        isActive
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-medium"
                          : "border-gray-200 text-gray-600 hover:border-indigo-200"
                      }
                    `}
                  >
                    {isActive && (
                      <CheckCircleIcon className="absolute -top-1 -right-1 h-3 w-3 text-indigo-600" />
                    )}
                    <span>{slab.minQuantity}+</span>
                    <span className="ml-1 font-semibold">
                      {formatPrice(slab.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quantity Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-500">
              Quantity
            </label>
            <span className="text-[10px] text-gray-400">MOQ: {moq}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateQuantity(quantity - 1)}
              disabled={quantity <= moq}
              className="h-9 w-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              <MinusIcon className="h-4 w-4" />
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => updateQuantity(parseInt(e.target.value) || moq)}
              min={moq}
              max={stock}
              className="h-9 w-20 text-center border border-gray-200 rounded-lg text-sm font-medium"
            />
            <button
              onClick={() => updateQuantity(quantity + 1)}
              disabled={quantity >= stock}
              className="h-9 w-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Next tier hint */}
        {nextSlab && (
          <div className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-100">
            <p className="text-xs text-amber-800">
              💡 Buy <strong>{nextSlab.minQuantity - quantity} more</strong> for{" "}
              <strong>{formatPrice(nextSlab.price)}</strong>/unit
            </p>
          </div>
        )}

        {/* Price Breakdown */}
        <div className="border-t border-gray-100 pt-3 space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>
              Subtotal ({quantity} × {formatPrice(currentPrice)})
            </span>
            <span className="font-medium text-gray-800">
              {formatPrice(subtotal)}
            </span>
          </div>
          {taxPercent > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>GST ({taxPercent}%)</span>
              <span>+ {formatPrice(tax)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-gray-100">
            <span className="font-semibold text-gray-800">Total</span>
            <span className="text-lg font-bold text-indigo-600">
              {formatPrice(finalTotal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantityPriceCalculator;
