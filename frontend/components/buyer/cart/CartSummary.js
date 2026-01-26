"use client";

import { useMemo } from "react";
import { Truck, CreditCard, ShieldCheck } from "lucide-react";

// ============ SUPPORT CALCULATION HELPERS ============

/**
 * Calculate freight support based on product's support config and quantity
 */
const calculateFreightSupport = (product, quantity) => {
  if (!product?.support?.freight) return 0;
  const { type, amount, slabs } = product.support.freight;
  if (type === "single") return amount || 0;
  if (type === "slab" && slabs?.length) {
    const sorted = [...slabs].sort((a, b) => b.minQty - a.minQty);
    const match = sorted.find((s) => quantity >= s.minQty);
    return match?.amount || 0;
  }
  return 0;
};

/**
 * Calculate payment fee support (percent of subtotal)
 */
const calculatePaymentFeeSupport = (product, quantity, subtotal) => {
  if (!product?.support?.paymentFee) return 0;
  const { type, percent, slabs } = product.support.paymentFee;
  if (type === "single") return (subtotal * (percent || 0)) / 100;
  if (type === "slab" && slabs?.length) {
    const sorted = [...slabs].sort((a, b) => b.minQty - a.minQty);
    const match = sorted.find((s) => quantity >= s.minQty);
    return match ? (subtotal * (match.percent || 0)) / 100 : 0;
  }
  return 0;
};

/**
 * Get unit price for quantity based on slab pricing
 */
const getUnitPrice = (product, quantity) => {
  if (!product?.price) return 0;
  if (product.price.type === "single") return product.price.singlePrice || 0;
  if (product.price.type === "slab" && product.price.slabs?.length) {
    const sorted = [...product.price.slabs].sort(
      (a, b) => b.minQuantity - a.minQuantity,
    );
    const match = sorted.find((s) => quantity >= s.minQuantity);
    return match?.price || product.price.slabs[0]?.price || 0;
  }
  return 0;
};

// ============ CART SUMMARY COMPONENT ============

const CartSummary = ({ selectedItems = [], cartItems = [], onCheckout }) => {
  // Calculate totals from actual product data
  const summary = useMemo(() => {
    let subtotal = 0;
    let totalItems = 0;
    let totalFreightSupport = 0;
    let totalPaymentFeeSupport = 0;

    // Process each selected item
    selectedItems.forEach((item) => {
      // item matches the structure from Cart.js
      // It has item.product, item.quantity, item.price (unit price)

      const product = item.product;
      const quantity = item.quantity || 1;

      // Use the price from the item (calculated by backend/frontend logic already)
      // or recalculate if needed. Backend usually source of truth for unitPrice.
      // But getUnitPrice helper is here. Let's start with helper if product exists.
      const unitPrice = getUnitPrice(product, quantity);
      // Fallback to item.price if helper returns 0 (e.g. product missing)
      const finalUnitPrice = unitPrice || item.price || 0;

      const itemSubtotal = finalUnitPrice * quantity;

      subtotal += itemSubtotal;
      totalItems += quantity;

      // Calculate support discounts
      const freightSupport = calculateFreightSupport(product, quantity);
      const paymentFeeSupport = calculatePaymentFeeSupport(
        product,
        quantity,
        itemSubtotal,
      );

      totalFreightSupport += freightSupport;
      totalPaymentFeeSupport += paymentFeeSupport;
    });

    // Tax is included in product price
    const totalSupport = totalFreightSupport + totalPaymentFeeSupport;
    const grandTotal = subtotal - totalSupport;

    return {
      subtotal,
      totalItems,
      totalFreightSupport,
      totalPaymentFeeSupport,
      totalSupport,
      grandTotal: Math.max(0, grandTotal),
    };
  }, [selectedItems]);

  const {
    subtotal,
    totalItems,
    totalFreightSupport,
    totalPaymentFeeSupport,
    totalSupport,
    grandTotal,
  } = summary;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 p-6 lg:p-8">
      <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">
        Order Summary
      </h2>

      {/* Detailed Breakdown */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
          <span>Subtotal ({totalItems} items)</span>
          <span className="font-medium text-slate-900 dark:text-white">
            ₹{subtotal.toFixed(2)}
          </span>
        </div>

        {/* Support Line Items */}
        {totalFreightSupport > 0 && (
          <div className="flex justify-between text-sm animate-in fade-in slide-in-from-right-4 duration-500">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <Truck className="w-4 h-4" />
              Shipping Support
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              - ₹{totalFreightSupport.toFixed(2)}
            </span>
          </div>
        )}

        {totalPaymentFeeSupport > 0 && (
          <div className="flex justify-between text-sm animate-in fade-in slide-in-from-right-4 duration-700">
            <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-medium">
              <CreditCard className="w-4 h-4" />
              Fee Support
            </span>
            <span className="font-bold text-purple-600 dark:text-purple-400">
              - ₹{totalPaymentFeeSupport.toFixed(2)}
            </span>
          </div>
        )}

        <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 italic">
          <span>Tax included in price</span>
        </div>

        <div className="h-px bg-slate-200 dark:bg-slate-800 my-6"></div>

        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-base font-semibold text-slate-900 dark:text-white">
              Total Pay
            </span>
            {totalSupport > 0 && (
              <span className="text-xs text-emerald-600 font-medium">
                You save ₹{totalSupport.toFixed(2)}
              </span>
            )}
          </div>
          <div className="text-right">
            <span className="block text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              ₹{grandTotal.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 block">
              INR
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div>
        <button
          disabled={totalItems === 0}
          onClick={onCheckout}
          className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 active:scale-[0.98] transition-all duration-200 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          Proceed to Checkout
        </button>
      </div>

      {/* Secure Transaction Note */}
      <div className="mt-6 flex justify-center items-center gap-2 text-xs text-slate-400 font-medium">
        <ShieldCheck className="w-3 h-3" />
        Secure 256-bit SSL Encrypted
      </div>
    </div>
  );
};

export default CartSummary;
