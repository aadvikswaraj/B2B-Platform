"use client";

import { useState } from "react";
import CartCategoryGroup from "./CartCategoryGroup";

const CartSupplierGroup = ({
  supplier,
  onQuantityChange,
  onItemSelect,
  onSelectAll,
  onRemoveItem,
}) => {
  const allSelected = supplier.items.every((item) => item.selected);

  // Group items by category
  const groupedItems = supplier.items.reduce((acc, item) => {
    const category = item.category || "Uncategorized";
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  return (
    <div className="mb-8">
      {/* Supplier Section Header (Floating above items) */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(e) =>
                onSelectAll(supplier.supplierId, e.target.checked)
              }
              className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-slate-300 checked:border-blue-600 checked:bg-blue-600 transition-all hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-500 dark:checked:bg-blue-500"
            />
            <svg
              className="pointer-events-none absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
              {supplier.supplierName}
            </h3>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></span>
              {supplier.supplierLocation}
            </p>
          </div>
        </div>
        <button className="text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors">
          Chat
        </button>
      </div>

      {/* Categories Wrapper - No more big white box, items float individually or in groups */}
      <div className="space-y-6">
        {Object.entries(groupedItems).map(([category, items]) => (
          <CartCategoryGroup
            key={category}
            category={category}
            items={items}
            onQuantityChange={(id, qty) =>
              onQuantityChange(supplier.supplierId, id, qty)
            }
            onRemoveItem={(id) => onRemoveItem(supplier.supplierId, id)}
            onItemSelect={(id, selected) =>
              onItemSelect(supplier.supplierId, id, selected)
            }
          />
        ))}
      </div>
    </div>
  );
};

export default CartSupplierGroup;
