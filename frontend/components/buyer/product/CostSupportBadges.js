"use client";

import {
  TruckIcon,
  CreditCardIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

/**
 * CostSupportBadges - Displays freight and payment fee support offered by seller
 */
const CostSupportBadges = ({ support = {}, className = "" }) => {
  const { freight, paymentFee } = support;

  // Check if any support is available
  const hasFreightSupport = freight?.amount > 0 || freight?.slabs?.length > 0;
  const hasPaymentSupport =
    paymentFee?.percent > 0 || paymentFee?.slabs?.length > 0;

  if (!hasFreightSupport && !hasPaymentSupport) {
    return null;
  }

  // Format freight support display
  const getFreightDisplay = () => {
    if (freight?.type === "slab" && freight?.slabs?.length > 0) {
      const sortedSlabs = [...freight.slabs].sort(
        (a, b) => a.minQty - b.minQty
      );
      return sortedSlabs.map((slab, idx) => ({
        condition: `${slab.minQty}+ units`,
        value: `₹${slab.amount} off shipping`,
      }));
    }
    if (freight?.amount > 0) {
      return [
        { condition: "All orders", value: `₹${freight.amount} off shipping` },
      ];
    }
    return [];
  };

  // Format payment fee support display
  const getPaymentDisplay = () => {
    if (paymentFee?.type === "slab" && paymentFee?.slabs?.length > 0) {
      const sortedSlabs = [...paymentFee.slabs].sort(
        (a, b) => a.minQty - b.minQty
      );
      return sortedSlabs.map((slab, idx) => ({
        condition: `${slab.minQty}+ units`,
        value: `${slab.percent}% fee covered`,
      }));
    }
    if (paymentFee?.percent > 0) {
      return [
        {
          condition: "All orders",
          value: `${paymentFee.percent}% payment fee covered`,
        },
      ];
    }
    return [];
  };

  const freightItems = getFreightDisplay();
  const paymentItems = getPaymentDisplay();

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <SparklesIcon className="h-5 w-5 text-indigo-600" />
        <h3 className="text-sm font-semibold text-gray-800">
          Seller Discounts
        </h3>
      </div>

      {/* Badges */}
      <div className="space-y-2">
        {/* Freight Support */}
        {hasFreightSupport && (
          <div className="rounded-lg border border-blue-100 bg-gradient-to-r from-blue-50 to-transparent p-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <TruckIcon className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-blue-800">
                  Shipping Support
                </p>
                <div className="mt-1 space-y-0.5">
                  {freightItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <span className="text-blue-600">{item.condition}:</span>
                      <span className="font-medium text-blue-800">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Fee Support */}
        {hasPaymentSupport && (
          <div className="rounded-lg border border-purple-100 bg-gradient-to-r from-purple-50 to-transparent p-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                <CreditCardIcon className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-purple-800">
                  Payment Fee Support
                </p>
                <div className="mt-1 space-y-0.5">
                  {paymentItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <span className="text-purple-600">{item.condition}:</span>
                      <span className="font-medium text-purple-800">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Note */}
      <p className="text-[10px] text-gray-500 leading-relaxed">
        * Discounts are applied automatically at checkout based on your order
        quantity
      </p>
    </div>
  );
};

export default CostSupportBadges;
