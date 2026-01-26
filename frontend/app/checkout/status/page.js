"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Calendar,
  CreditCard,
  ChevronRight,
  Loader2,
  Store,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { orderAPI } from "@/utils/api/order";

const statusConfig = {
  hidden: {
    label: "Processing",
    color: "text-slate-600",
    bg: "bg-slate-100",
    icon: Clock,
  },
  pending: {
    label: "Payment Pending",
    color: "text-yellow-600",
    bg: "bg-yellow-100",
    icon: Clock,
  },
  placed: {
    label: "Order Placed",
    color: "text-blue-600",
    bg: "bg-blue-100",
    icon: CheckCircle2,
  },
  accepted: {
    label: "Accepted by Seller",
    color: "text-green-600",
    bg: "bg-green-100",
    icon: CheckCircle2,
  },
  confirmed: {
    label: "Confirmed",
    color: "text-green-600",
    bg: "bg-green-100",
    icon: Package,
  },
  shipped: {
    label: "Shipped",
    color: "text-purple-600",
    bg: "bg-purple-100",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    color: "text-green-600",
    bg: "bg-green-100",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-600",
    bg: "bg-red-100",
    icon: Clock,
  },
};

const paymentStatusConfig = {
  pending: { label: "Pending", color: "text-yellow-600" },
  paid: { label: "Paid", color: "text-green-600" },
  failed: { label: "Failed", color: "text-red-600" },
  refunded: { label: "Refunded", color: "text-orange-600" },
};

export default function OrderStatusPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  // Demo mode detection from URL
  const isDemoMode = searchParams.get("mode") === "demo";
  const demoResult = searchParams.get("result");

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) {
        setError("No order ID provided");
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

  // Group items by seller
  const groupedBySeller = order?.items?.reduce((acc, item) => {
    const sellerId = item.seller?._id || item.seller || "unknown";
    if (!acc[sellerId]) {
      acc[sellerId] = {
        seller: item.seller,
        items: [],
      };
    }
    acc[sellerId].items.push(item);
    return acc;
  }, {});

  const sellerGroups = groupedBySeller ? Object.values(groupedBySeller) : [];

  const statusInfo = order?.status ? statusConfig[order.status] : null;
  const StatusIcon = statusInfo?.icon || Clock;
  const paymentInfo = order?.paymentStatus
    ? paymentStatusConfig[order.paymentStatus]
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">
            Loading order details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Order Not Found
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      {/* Mobile/Desktop Container */}
      <div className="container mx-auto px-4 py-6 lg:py-12 max-w-6xl">
        {/* Success Header */}
        <div className="mb-8 lg:mb-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-green-100 dark:bg-green-900/20 mb-4 animate-in zoom-in duration-500">
            <CheckCircle2 className="w-10 h-10 lg:w-12 lg:h-12 text-green-600 dark:text-green-500" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Order Confirmed!
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Thank you for your purchase
          </p>
        </div>

        {/* Demo Mode Banner */}
        {isDemoMode && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top duration-500">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">🧪</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                Demo Payment Simulation
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                This order was created using the demo payment simulator for
                testing and portfolio demonstration purposes. No real
                transaction occurred.
              </p>
            </div>
          </div>
        )}

        {/* Order ID Card */}
        <div className="mb-6 lg:mb-8 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wide font-semibold mb-1">
                Order ID
              </p>
              <p className="text-xl lg:text-2xl font-mono font-bold text-slate-900 dark:text-white">
                {order.readableId || orderId}
              </p>
            </div>

            {/* Order Status Badge */}
            {statusInfo && (
              <div
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl ${statusInfo.bg} ${statusInfo.color} font-semibold text-sm lg:text-base`}
              >
                <StatusIcon className="w-5 h-5" />
                {statusInfo.label}
              </div>
            )}
          </div>

          {/* Order Meta Info */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Order Date
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Payment Status
                </p>
                <p
                  className={`text-sm font-semibold ${paymentInfo?.color || "text-slate-900 dark:text-white"}`}
                >
                  {paymentInfo?.label || "Unknown"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Total Items
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {order.items?.length || 0}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Total Amount
                </p>
                <p className="text-sm font-bold text-green-600 dark:text-green-500">
                  ${order.totalAmount?.toFixed(2) || "0.00"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <div className="mb-6 lg:mb-8 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Delivery Address
              </h2>
            </div>
            <div className="text-sm text-slate-900 dark:text-white leading-relaxed">
              <p className="font-semibold">{order.shippingAddress.name}</p>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {order.shippingAddress.addressLine1}
                {order.shippingAddress.addressLine2 &&
                  `, ${order.shippingAddress.addressLine2}`}
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.pincode}
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                {order.shippingAddress.country || "India"}
              </p>
              {order.shippingAddress.phone && (
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                  Phone: {order.shippingAddress.phone}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Items Grouped by Seller (Amazon-style) */}
        <div className="space-y-6 lg:space-y-8 mb-8">
          {sellerGroups.map((group, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              {/* Seller Header */}
              <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <Store className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Sold by
                    </p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {group.seller?.name || "Unknown Seller"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {group.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="flex gap-4">
                      {/* Product Image Placeholder */}
                      <div className="flex-shrink-0 w-20 h-20 lg:w-24 lg:h-24 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                        <Package className="w-8 h-8 lg:w-10 lg:h-10 text-slate-400" />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm lg:text-base font-semibold text-slate-900 dark:text-white mb-1">
                          {item.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-xs lg:text-sm text-slate-600 dark:text-slate-400">
                          <span>Qty: {item.quantity}</span>
                          <span>•</span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            ${item.price?.toFixed(2)} each
                          </span>
                        </div>

                        {/* Item Subtotal */}
                        <div className="mt-2">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            Subtotal: ${item.subtotal?.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Seller Group Total */}
              <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    Seller Total ({group.items.length}{" "}
                    {group.items.length === 1 ? "item" : "items"})
                  </span>
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    $
                    {group.items
                      .reduce((sum, item) => sum + (item.subtotal || 0), 0)
                      .toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 lg:p-8 mb-8">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            Order Summary
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">
                Subtotal
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                ${order.subtotal?.toFixed(2) || "0.00"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">
                Taxes (GST)
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                ${order.tax?.toFixed(2) || "0.00"}
              </span>
            </div>
            {order.totalFreightSupport > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600 dark:text-green-500">
                  Freight Support
                </span>
                <span className="font-semibold text-green-600 dark:text-green-500">
                  -${order.totalFreightSupport?.toFixed(2)}
                </span>
              </div>
            )}
            {order.totalPaymentFeeSupport > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600 dark:text-green-500">
                  Payment Fee Support
                </span>
                <span className="font-semibold text-green-600 dark:text-green-500">
                  -${order.totalPaymentFeeSupport?.toFixed(2)}
                </span>
              </div>
            )}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex justify-between">
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  Total Paid
                </span>
                <span className="text-xl font-bold text-green-600 dark:text-green-500">
                  ${order.totalAmount?.toFixed(2) || "0.00"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Desktop Only (lg and above) */}
        <div className="hidden lg:grid grid-cols-2 gap-4 sticky bottom-6 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl">
          <Link
            href="/myaccount/orders"
            className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-600/20"
          >
            View All Orders
            <ChevronRight className="w-5 h-5" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            Continue Shopping
          </Link>
        </div>

        {/* Footer Note - Desktop Only */}
        <p className="hidden lg:block mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          We've sent a confirmation email with order details to your registered
          email address.
        </p>

        {/* Mobile spacer to prevent content being hidden behind fixed bar */}
        <div className="lg:hidden h-24"></div>
      </div>

      {/* Fixed Bottom Action Bar - Mobile Only */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-2xl">
        <div className="container mx-auto px-4 py-3">
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
            >
              Continue Shopping
            </Link>
            <Link
              href="/myaccount/orders"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
            >
              View Orders
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
