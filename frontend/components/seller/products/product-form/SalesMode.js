"use client";
import { useState, useEffect, useMemo } from "react";
import {
  ShoppingCartIcon,
  ChatBubbleLeftRightIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  LockClosedIcon,
  BanknotesIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import CatalogAPI from "@/utils/api/catalog";
import { resolveCommission, resolveAcceptOrders } from "@/utils/category";

/**
 * SalesMode Component
 * Allows seller to choose between accepting direct orders or inquiry-only mode.
 * Shows commission preview based on category settings.
 */
export default function SalesMode({ category, isOrder, setIsOrder, watch }) {
  const [commissionData, setCommissionData] = useState(null);
  const [loadingCommission, setLoadingCommission] = useState(false);

  // Resolve if orders are allowed for this category
  const acceptOrdersAllowed = useMemo(() => {
    if (!category) return true;
    const result = resolveAcceptOrders(category);
    console.log(
      "[SalesMode] Accept orders allowed:",
      result,
      "for category:",
      category?.name,
    );
    return result;
  }, [category]);

  // Resolve commission from category
  const resolvedCommission = useMemo(() => {
    if (!category) {
      console.log("[SalesMode] No category yet");
      return null;
    }
    console.log("[SalesMode] Category received:", {
      name: category.name,
      _id: category._id,
      commission: category.commission,
      parentCategory: category.parentCategory
        ? {
            name: category.parentCategory.name,
            commission: category.parentCategory.commission,
          }
        : null,
    });
    const result = resolveCommission(category);
    console.log("[SalesMode] Resolved commission:", result);
    return result;
  }, [category]);

  // Load effective commission for preview amounts
  useEffect(() => {
    if (!category?._id || !resolvedCommission) {
      setCommissionData(null);
      return;
    }

    // For slab mode, we need to show commission at various price points
    if (resolvedCommission.mode === "slab") {
      setCommissionData({
        mode: "slab",
        slabs: resolvedCommission.slabs || [],
      });
    } else if (resolvedCommission.mode === "exact") {
      setCommissionData({
        mode: "exact",
        percent: resolvedCommission.exact,
      });
    } else {
      setCommissionData(null);
    }
  }, [category, resolvedCommission]);

  // Watch price for live commission calculation
  const unitPrice = parseFloat(watch?.("price") || 0);
  const moq = parseInt(watch?.("moq") || 1);

  // Calculate commission for current price
  const currentCommission = useMemo(() => {
    if (!commissionData) return null;

    if (commissionData.mode === "exact") {
      return {
        percent: commissionData.percent,
        amount: unitPrice * (commissionData.percent / 100),
      };
    }

    if (commissionData.mode === "slab" && commissionData.slabs?.length > 0) {
      const orderValue = unitPrice * moq;
      const sorted = [...commissionData.slabs].sort(
        (a, b) => (a.upto || 0) - (b.upto || 0),
      );

      for (const slab of sorted) {
        if (orderValue <= slab.upto) {
          return {
            percent: slab.percent,
            amount: unitPrice * (slab.percent / 100),
            slab: slab,
          };
        }
      }
      // Above all slabs, use last slab
      if (sorted.length > 0) {
        const lastSlab = sorted[sorted.length - 1];
        return {
          percent: lastSlab.percent,
          amount: unitPrice * (lastSlab.percent / 100),
          slab: lastSlab,
        };
      }
    }
    return null;
  }, [commissionData, unitPrice, moq]);

  // Auto-set to inquiry if orders not allowed
  useEffect(() => {
    if (!acceptOrdersAllowed && isOrder) {
      setIsOrder(false);
    }
  }, [acceptOrdersAllowed, isOrder, setIsOrder]);

  const options = [
    {
      value: true,
      label: "Accept Orders",
      description: "Buyers can directly place and pay for orders",
      icon: ShoppingCartIcon,
      iconBg: "bg-emerald-100",
      selectedIconBg: "bg-emerald-600",
      iconColor: "text-emerald-600",
      borderColor: "border-emerald-500",
      bgActive: "bg-emerald-50",
      disabled: !acceptOrdersAllowed,
    },
    {
      value: false,
      label: "Inquiry Only",
      description: "Buyers can only send inquiries, negotiate offline",
      icon: ChatBubbleLeftRightIcon,
      iconBg: "bg-amber-100",
      selectedIconBg: "bg-amber-600",
      iconColor: "text-amber-600",
      borderColor: "border-amber-500",
      bgActive: "bg-amber-50",
      disabled: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Category Orders Restriction Warning */}
      {!acceptOrdersAllowed && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <LockClosedIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              Direct orders disabled for this category
            </p>
            <p className="text-xs text-amber-700 mt-1">
              The category "{category?.name}" doesn't allow direct orders.
              Products can only be listed for inquiries.
            </p>
          </div>
        </div>
      )}

      {/* Sales Mode Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          How do you want to sell this product?
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {options.map((opt) => {
            const isSelected = isOrder === opt.value;
            const Icon = opt.icon;

            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => !opt.disabled && setIsOrder(opt.value)}
                disabled={opt.disabled}
                className={`relative flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200
                    ${
                      isSelected
                        ? `${opt.borderColor} ${opt.bgActive} shadow-sm`
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }
                    ${
                      opt.disabled
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }
                `}
              >
                {/* Selection Indicator */}
                <div
                  className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center
                    ${
                      isSelected
                        ? `${opt.borderColor} ${opt.bgActive}`
                        : "border-gray-300"
                    }
                `}
                >
                  {isSelected && (
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${opt.selectedIconBg}`}
                    />
                  )}
                </div>

                {/* Icon */}
                <div className={`p-2 rounded-lg ${opt.iconBg} shrink-0`}>
                  <Icon className={`w-5 h-5 ${opt.iconColor}`} />
                </div>

                {/* Content */}
                <div className="flex-1 pr-6">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold text-sm ${isSelected ? "text-gray-900" : "text-gray-700"}`}
                    >
                      {opt.label}
                    </span>
                    {opt.disabled && (
                      <LockClosedIcon className="w-3.5 h-3.5 text-gray-400" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    {opt.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Commission Preview - Only show for Orders mode */}
      {isOrder && commissionData && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <BanknotesIcon className="w-5 h-5 text-indigo-600" />
            <h4 className="font-semibold text-sm text-indigo-900">
              Platform Commission Preview
            </h4>
          </div>

          {commissionData.mode === "exact" ? (
            /* Flat Commission Display */
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-indigo-100">
                <span className="text-sm text-gray-600">Commission Rate</span>
                <span className="text-lg font-bold text-indigo-700">
                  {commissionData.percent}%
                </span>
              </div>

              {unitPrice > 0 && currentCommission && (
                <div className="bg-white/70 rounded-lg p-3 border border-indigo-100/50">
                  <p className="text-xs text-gray-500 mb-2">
                    Based on your price (₹{unitPrice.toFixed(2)}/unit)
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Commission per unit
                    </span>
                    <span className="font-semibold text-indigo-700">
                      ₹{currentCommission.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-gray-600">
                      Your earnings per unit
                    </span>
                    <span className="font-semibold text-emerald-600">
                      ₹{(unitPrice - currentCommission.amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <p className="text-[11px] text-indigo-600 flex items-start gap-1.5">
                <CheckCircleIcon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>
                  Flat commission applies to all order values in this category
                </span>
              </p>
            </div>
          ) : commissionData.mode === "slab" ? (
            /* Slab Commission Display */
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <ChartBarIcon className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-medium text-indigo-700 uppercase tracking-wide">
                  Volume-Based Commission Slabs
                </span>
              </div>

              {/* Slab Table - Responsive */}
              <div className="bg-white rounded-lg border border-indigo-100 overflow-hidden">
                {/* Mobile: Stacked Cards */}
                <div className="sm:hidden divide-y divide-indigo-50">
                  {[...commissionData.slabs]
                    .sort((a, b) => (a.upto || 0) - (b.upto || 0))
                    .map((slab, idx, arr) => {
                      const prevUpto = idx > 0 ? arr[idx - 1].upto : 0;
                      const isLast = idx === arr.length - 1;
                      const isCurrentSlab =
                        currentCommission?.slab?.upto === slab.upto;

                      return (
                        <div
                          key={idx}
                          className={`p-3 ${isCurrentSlab ? "bg-indigo-50" : ""}`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-xs text-gray-500">
                                Order Value
                              </span>
                              <p className="text-sm font-medium text-gray-800">
                                {isLast && idx > 0
                                  ? `Above ₹${prevUpto.toLocaleString()}`
                                  : idx === 0
                                    ? `Up to ₹${slab.upto.toLocaleString()}`
                                    : `₹${prevUpto.toLocaleString()} – ₹${slab.upto.toLocaleString()}`}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-xs text-gray-500">
                                Commission
                              </span>
                              <p
                                className={`text-lg font-bold ${isCurrentSlab ? "text-indigo-700" : "text-gray-700"}`}
                              >
                                {slab.percent}%
                              </p>
                            </div>
                          </div>
                          {isCurrentSlab && (
                            <div className="mt-2 pt-2 border-t border-indigo-100">
                              <span className="text-[10px] font-medium text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                                Current Rate
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>

                {/* Desktop: Table */}
                <table className="hidden sm:table w-full text-sm">
                  <thead className="bg-indigo-50/50">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                        Order Value Range
                      </th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                        Commission
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-indigo-50">
                    {[...commissionData.slabs]
                      .sort((a, b) => (a.upto || 0) - (b.upto || 0))
                      .map((slab, idx, arr) => {
                        const prevUpto = idx > 0 ? arr[idx - 1].upto : 0;
                        const isLast = idx === arr.length - 1;
                        const isCurrentSlab =
                          currentCommission?.slab?.upto === slab.upto;

                        return (
                          <tr
                            key={idx}
                            className={
                              isCurrentSlab
                                ? "bg-indigo-50"
                                : "hover:bg-gray-50"
                            }
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-700">
                                  {isLast && idx > 0
                                    ? `Above ₹${prevUpto.toLocaleString()}`
                                    : idx === 0
                                      ? `Up to ₹${slab.upto.toLocaleString()}`
                                      : `₹${prevUpto.toLocaleString()} – ₹${slab.upto.toLocaleString()}`}
                                </span>
                                {isCurrentSlab && (
                                  <span className="text-[10px] font-medium text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                                    Current
                                  </span>
                                )}
                              </div>
                            </td>
                            <td
                              className={`px-4 py-3 text-right font-semibold ${isCurrentSlab ? "text-indigo-700" : "text-gray-700"}`}
                            >
                              {slab.percent}%
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {/* Live Calculation */}
              {unitPrice > 0 && currentCommission && (
                <div className="bg-white/70 rounded-lg p-3 border border-indigo-100/50">
                  <p className="text-xs text-gray-500 mb-2">
                    Based on ₹{unitPrice.toFixed(2)}/unit × {moq} MOQ = ₹
                    {(unitPrice * moq).toLocaleString()} order
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Applied rate</span>
                    <span className="font-semibold text-indigo-700">
                      {currentCommission.percent}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-gray-600">
                      Commission per unit
                    </span>
                    <span className="font-semibold text-indigo-700">
                      ₹{currentCommission.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-gray-600">
                      Your earnings per unit
                    </span>
                    <span className="font-semibold text-emerald-600">
                      ₹{(unitPrice - currentCommission.amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <p className="text-[11px] text-indigo-600 flex items-start gap-1.5">
                <InformationCircleIcon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>
                  Higher order values attract lower commission rates. Encourage
                  bulk orders!
                </span>
              </p>
            </div>
          ) : null}
        </div>
      )}

      {/* Inquiry Mode Info */}
      {!isOrder && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <InformationCircleIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-amber-800">
                Inquiry-Only Mode Selected
              </p>
              <ul className="text-xs text-amber-700 space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  Buyers will send inquiries instead of placing direct orders
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  Negotiate pricing and terms outside the platform
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  No platform commission on offline transactions
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  Stock, packaging, and dispatch details are optional
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
