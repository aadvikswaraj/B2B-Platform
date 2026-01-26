"use client";
import { ShieldCheck } from "lucide-react";

export default function OrderSummary({
  pricing,
  submitLabel,
  onSubmit,
  disabled,
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
      <h3 className="text-lg font-bold text-slate-900 mb-6">Order Summary</h3>

      <dl className="space-y-3 text-sm">
        <div className="flex justify-between items-center text-slate-600">
          <dt>Subtotal</dt>
          <dd className="font-medium text-slate-900">
            ${pricing.itemsSubtotal.toFixed(2)}
          </dd>
        </div>

        <div className="flex justify-between items-center text-slate-600">
          <dt>Shipping Estimate</dt>
          <dd className="font-medium text-slate-900">
            {pricing.shipping === 0 ? (
              <span className="text-green-600">Free</span>
            ) : (
              `$${pricing.shipping.toFixed(2)}`
            )}
          </dd>
        </div>

        <div className="flex justify-between items-center text-slate-600">
          <dt>Taxes</dt>
          <dd className="font-medium text-slate-900">
            ${pricing.taxes.toFixed(2)}
          </dd>
        </div>

        <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center">
          <dt className="text-base font-bold text-slate-900">Order Total</dt>
          <dd className="text-xl font-bold text-blue-600">
            ${pricing.total.toFixed(2)}
          </dd>
        </div>
      </dl>

      {onSubmit && (
        <button
          onClick={onSubmit}
          disabled={disabled}
          className="mt-8 w-full group relative overflow-hidden rounded-xl bg-blue-600 py-3.5 px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-700 hover:shadow-blue-700/40 disabled:opacity-50 disabled:shadow-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {submitLabel}
          </span>
        </button>
      )}

      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500 bg-slate-50 py-2 rounded-lg">
        <ShieldCheck className="w-4 h-4 text-green-600" />
        <span>100% Secure Checkout</span>
      </div>
    </div>
  );
}
