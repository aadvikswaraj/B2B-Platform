"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";

const CartItem = ({ item, onQuantityChange, onRemove, onSelect }) => {
  return (
    <div className="group relative flex gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
      {/* Selection Checkbox */}
      <div className="absolute top-4 left-4 z-10">
        <input
          type="checkbox"
          checked={item.selected}
          onChange={(e) => onSelect(item.id, e.target.checked)}
          className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500/20 transition-all cursor-pointer"
        />
      </div>

      {/* Image Container */}
      <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden ml-8">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow justify-between py-1">
        <div>
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2 text-sm sm:text-base leading-snug">
              {item.name}
            </h3>
            <button
              onClick={() => onRemove(item.id)}
              className="text-slate-400 hover:text-red-500 transition-colors p-1 -mr-2"
              aria-label="Remove item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Specs */}
          <div className="mt-2 flex flex-wrap gap-2">
            {item.specifications &&
              Object.entries(item.specifications).map(([key, value]) => (
                <span
                  key={key}
                  className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700/50 text-xs font-medium text-slate-600 dark:text-slate-300"
                >
                  {key}: {value}
                </span>
              ))}
          </div>

          {/* Support Badges */}
          {(item.freightSupport > 0 || item.paymentFeeSupport > 0) && (
            <div className="mt-2 flex flex-wrap gap-2">
              {item.freightSupport > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900/30 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                    />
                  </svg>
                  Shipping: -₹{item.freightSupport.toFixed(0)}
                </span>
              )}
              {item.paymentFeeSupport > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-purple-50 dark:bg-purple-900/30 text-xs font-medium text-purple-600 dark:text-purple-400">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  Fee: -₹{item.paymentFeeSupport.toFixed(0)}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-end justify-between mt-4">
          {/* Price */}
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Price
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              ₹{item.price.toFixed(2)}
            </span>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 rounded-full px-1 py-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => onQuantityChange(item.id, item.quantity - 1)}
              disabled={item.quantity <= item.minOrder}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 disabled:opacity-50 disabled:hover:text-slate-600 transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <span className="w-8 text-center text-sm font-semibold text-slate-900 dark:text-white">
              {item.quantity}
            </span>

            <button
              onClick={() => onQuantityChange(item.id, item.quantity + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
