"use client";
export default function OrderSummary({ pricing, submitLabel, onSubmit, disabled }) {
  return (
    <div className="rounded-lg bg-white border p-5 shadow-sm">
      <h3 className="font-semibold mb-4">Order Summary</h3>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between"><dt className="text-slate-600">Items Subtotal</dt><dd>${pricing.itemsSubtotal.toFixed(2)}</dd></div>
        <div className="flex justify-between"><dt className="text-slate-600">Shipping</dt><dd>${pricing.shipping.toFixed(2)}</dd></div>
        <div className="flex justify-between"><dt className="text-slate-600">Taxes</dt><dd>${pricing.taxes.toFixed(2)}</dd></div>
        <div className="flex justify-between pt-2 border-t"><dt className="font-medium">Total</dt><dd className="font-semibold">${pricing.total.toFixed(2)}</dd></div>
      </dl>
      {onSubmit && <button onClick={onSubmit} disabled={disabled} className="mt-5 w-full rounded-md bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50">{submitLabel}</button>}
      <p className="mt-3 text-[11px] text-slate-500 text-center">By proceeding you agree to the platform terms.</p>
    </div>
  );
}
