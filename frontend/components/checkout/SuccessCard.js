"use client";
export default function SuccessCard({ orderId }) {
  return (
    <div className="max-w-md mx-auto bg-white rounded-xl border p-8 text-center shadow-sm">
      <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-green-100 flex items-center justify-center"><span className="text-2xl">🎉</span></div>
      <h1 className="text-xl font-semibold">Order Placed Successfully</h1>
      <p className="mt-2 text-sm text-slate-600">Your order has been received.</p>
      <p className="mt-4 text-sm font-mono bg-slate-50 border rounded px-3 py-2 inline-block">Order ID: {orderId}</p>
      <div className="mt-6 flex flex-col gap-3">
        <a href={`/tracking/${orderId}`} className="w-full rounded-md bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-500 text-center">Track Order</a>
        <a href="/" className="text-sm text-blue-600 hover:text-blue-500 font-medium">Continue Shopping →</a>
      </div>
      <p className="mt-6 text-xs text-slate-500">Est. Delivery: 5–8 business days</p>
    </div>
  );
}
