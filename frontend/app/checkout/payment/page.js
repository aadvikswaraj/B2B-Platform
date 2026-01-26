"use client";
import { useEffect, useState } from "react";
import CheckoutLayout from "@/components/checkout/CheckoutLayout";
import OrderSummary from "@/components/checkout/OrderSummary";
import { useRouter, useSearchParams } from "next/navigation";
import { CreditCard, Lock, Loader2, FlaskConical } from "lucide-react";
import Script from "next/script";
import { orderAPI } from "@/utils/api/order";
import DemoPaymentSimulator from "@/components/checkout/DemoPaymentSimulator";

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);

  // Demo mode state
  const [paymentMode, setPaymentMode] = useState("DEMO"); // "LIVE" | "TEST" | "DEMO"
  const [showDemoControls, setShowDemoControls] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await orderAPI.getById(orderId);
        const orderData = response?.data?.order || response?.order || response;
        setOrder(orderData);
      } catch (e) {
        console.error("Failed to load order", e);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  // Calculate pricing from order
  const pricing = order
    ? {
        itemsSubtotal: order.itemsTotal || 0,
        shipping: order.shippingCost || 0,
        taxes: order.tax || 0,
        total: order.totalAmount || 0,
      }
    : {
        itemsSubtotal: 0,
        shipping: 0,
        taxes: 0,
        total: 0,
      };

  const handlePayment = async () => {
    if (!orderId) {
      setError("No order ID provided");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Create payment intent
      const paymentData = await orderAPI.createPayment(orderId);

      // Check if Razorpay is loaded
      if (!window.Razorpay) {
        throw new Error("Razorpay SDK not loaded");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: paymentData.amount * 100, // in paise
        currency: paymentData.currency || "INR",
        order_id: paymentData.razorpayOrderId,
        name: "Globomart",
        description: `Order #${orderId}`,
        image: "/logo/logo-s-1.png",
        handler: async function (response) {
          // In DEMO mode, we log the handler but don't treat it as final
          if (paymentMode === "DEMO") {
            console.log("Razorpay handler called (demo mode):", response);
            // Demo outcome is controlled by Demo Payment Simulator UI
            return;
          }

          // Production flow
          try {
            const resp = await orderAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (resp.success) {
              if (
                [
                  "Payment verified successfully",
                  "Payment already verified",
                ].includes(resp.message)
              ) {
                router.push(`/checkout/status?orderId=${orderId}`);
              }
            } else {
              setError(resp.message);
            }
          } catch (e) {
            setError(e.message || "Payment verification failed");
          } finally {
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
            if (paymentMode !== "DEMO") {
              setError("Payment cancelled");
            }
          },
        },
        theme: {
          color: "#2563eb",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        if (paymentMode !== "DEMO") {
          setError(response.error.description || "Payment failed");
          setProcessing(false);
        }
      });

      rzp.open();

      // In DEMO mode, open demo controls immediately after Razorpay
      if (paymentMode === "DEMO") {
        setTimeout(() => {
          setShowDemoControls(true);
        }, 500);
      }
    } catch (e) {
      console.error("Payment error:", e);
      setError(e.message || "Failed to initiate payment");
      setProcessing(false);
    }
  };

  // Demo payment handlers
  const handleDemoSuccess = async () => {
    try {
      const response = await orderAPI.demoPayment(orderId, "SUCCESS");
      if (response.success) {
        // Close Razorpay popup before redirecting
        const razorpayContainer = document.querySelector(".razorpay-container");
        if (razorpayContainer) {
          razorpayContainer.remove();
        }
        // Small delay to ensure cleanup
        setTimeout(() => {
          router.push(
            `/checkout/status?orderId=${orderId}&mode=demo&result=success`,
          );
        }, 100);
      }
    } catch (e) {
      setError(e.message || "Demo payment failed");
    }
  };

  const handleDemoFailure = async () => {
    try {
      await orderAPI.demoPayment(orderId, "FAILED");
      // Close Razorpay popup
      const razorpayContainer = document.querySelector(".razorpay-container");
      if (razorpayContainer) {
        razorpayContainer.remove();
      }
      setError("Demo payment marked as failed. You can try again.");
      setShowDemoControls(false);
      setProcessing(false);
    } catch (e) {
      setError(e.message || "Demo payment failed");
    }
  };

  if (loading) {
    return (
      <CheckoutLayout
        stepId="payment"
        summary={
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 flex items-center justify-center min-h-[200px]">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        }
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
      </CheckoutLayout>
    );
  }

  return (
    <CheckoutLayout
      stepId="payment"
      summary={
        <OrderSummary
          pricing={pricing}
          submitLabel={
            processing ? "Processing..." : `Pay $${pricing.total.toFixed(2)}`
          }
          onSubmit={handlePayment}
          disabled={processing || loading}
        />
      }
    >
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <div className="space-y-8">
        {/* Demo Mode Banner */}
        {paymentMode === "DEMO" && (
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top duration-500">
            <FlaskConical className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                🧪 Demo Mode Active
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                Payments are simulated for testing and portfolio demonstration.
                No real money will be charged.
              </p>
            </div>
          </div>
        )}

        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Payment
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Securely complete your purchase.
          </p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900 p-8 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center min-h-[300px]">
          <div className="mb-6 h-20 w-20 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <CreditCard className="h-10 w-10 text-blue-600 dark:text-blue-500" />
          </div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Secure Payment Gateway
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8">
            You will be redirected to Razorpay to complete your payment
            securely. We support all major cards, UPI, and Netbanking.
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-600 text-sm max-w-md w-full">
              {error}
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={processing || loading}
            className="w-full max-w-md rounded-xl bg-blue-600 py-4 px-6 text-base font-bold text-white shadow-xl shadow-blue-600/20 transition-all hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3"
          >
            {processing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                Proceed to Pay
              </>
            )}
          </button>

          <div className="mt-6 flex gap-4 opacity-50 grayscale">
            {/* Payment Icons */}
            <div className="h-8 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-8 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-8 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Demo Payment Simulator */}
      <DemoPaymentSimulator
        isOpen={showDemoControls}
        onClose={() => {
          setShowDemoControls(false);
          setProcessing(false);
        }}
        onSuccess={handleDemoSuccess}
        onFailure={handleDemoFailure}
        orderId={orderId}
      />
    </CheckoutLayout>
  );
}
