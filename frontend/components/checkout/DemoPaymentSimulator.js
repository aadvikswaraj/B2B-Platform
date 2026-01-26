"use client";
import { X, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";

export default function DemoPaymentSimulator({
  isOpen,
  onClose,
  onSuccess,
  onFailure,
  orderId,
}) {
  const [processing, setProcessing] = useState(false);

  // Lower Razorpay's z-index when demo simulator is open
  useEffect(() => {
    if (isOpen) {
      const razorpayContainer = document.querySelector(".razorpay-container");
      if (razorpayContainer) {
        // Store original z-index
        const originalZIndex = razorpayContainer.style.zIndex;
        // Lower Razorpay's z-index to show demo simulator above it
        razorpayContainer.style.zIndex = "1000000";

        // Cleanup: restore original z-index when demo simulator closes
        return () => {
          razorpayContainer.style.zIndex = originalZIndex;
        };
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSuccess = async () => {
    setProcessing(true);
    await onSuccess();
    setProcessing(false);
  };

  const handleFailure = async () => {
    setProcessing(true);
    await onFailure();
    setProcessing(false);
  };

  return (
    <>
      {/* Backdrop - Semi-transparent to keep Razorpay visible */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        style={{ zIndex: 2000000 }}
        onClick={onClose}
      />

      {/* Modal/Drawer Container */}
      <div
        className="fixed inset-0 flex items-end justify-center pointer-events-none"
        style={{ zIndex: 2000001 }}
      >
        {/* Mobile: Bottom Drawer, Desktop: Centered Modal */}
        <div className="pointer-events-auto w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl lg:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom lg:slide-in-from-bottom-0 lg:zoom-in-95 duration-300 lg:mb-auto lg:mt-auto max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between rounded-t-3xl lg:rounded-t-3xl z-10">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Demo Payment Simulator
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Order: {orderId}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Warning Banner */}
          <div className="mx-6 mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                This is a simulated payment for testing and portfolio
                demonstration.
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                No real money is involved.
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Explanation */}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Razorpay Checkout is shown only to demonstrate the real payment
                flow UI. Since this is a demo environment, you can manually
                choose the payment outcome.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleSuccess}
                disabled={processing}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold shadow-lg shadow-green-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
              >
                <CheckCircle className="w-5 h-5" />
                {processing ? "Processing..." : "✅ Mark Payment as Successful"}
              </button>

              <button
                onClick={handleFailure}
                disabled={processing}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow-lg shadow-red-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
              >
                <XCircle className="w-5 h-5" />
                {processing ? "Processing..." : "❌ Mark Payment as Failed"}
              </button>

              <button
                onClick={onClose}
                disabled={processing}
                className="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-semibold transition-all disabled:opacity-50"
              >
                Cancel / Close Demo
              </button>
            </div>

            {/* Footer Note */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <p className="text-xs text-center text-slate-500 dark:text-slate-400 leading-relaxed">
                💡 This implementation demonstrates handler-based payment
                integration for testing and portfolio purposes. Production
                payments use real verification workflows.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
