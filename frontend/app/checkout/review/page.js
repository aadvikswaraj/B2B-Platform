"use client";
import { useEffect, useState } from "react";
import CheckoutLayout from "@/components/checkout/CheckoutLayout";
import OrderSummary from "@/components/checkout/OrderSummary";
import { useRouter, useSearchParams } from "next/navigation";
import { ShoppingBag, Truck, MapPin, Loader2, Package } from "lucide-react";
import { orderAPI } from "@/utils/api/order";
import { getAddresses } from "@/utils/api/user/addresses";

export default function ReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState(null);
  const [shippingAddress, setShippingAddress] = useState(null);
  const [groupedItems, setGroupedItems] = useState([]);

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

        // Group items by seller
        if (orderData?.items) {
          const sellerMap = new Map();

          orderData.items.forEach((item) => {
            const sellerId = item.seller?._id || "unknown";
            const sellerName =
              item.seller?.name || item.seller?.email || "Unknown Seller";

            if (!sellerMap.has(sellerId)) {
              sellerMap.set(sellerId, {
                sellerId,
                sellerName,
                items: [],
              });
            }

            sellerMap.get(sellerId).items.push(item);
          });

          setGroupedItems(Array.from(sellerMap.values()));
        }

        // Load shipping address if set
        if (orderData.shippingAddress) {
          if (typeof orderData.shippingAddress === "string") {
            const addresses = await getAddresses();
            const addr = addresses.find(
              (a) => (a._id || a.id) === orderData.shippingAddress,
            );
            if (addr) {
              setShippingAddress({
                name: addr.name,
                phone: addr.phone,
                line1: addr.addressLine1,
                line2: addr.addressLine2,
                city: addr.city,
                state: addr.state,
                pincode: addr.pincode,
              });
            }
          } else {
            setShippingAddress(orderData.shippingAddress);
          }
        }
      } catch (e) {
        console.error("Failed to load order", e);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  const handleNext = () => {
    setSubmitting(true);
    router.push(`/checkout/payment?orderId=${orderId}`);
  };

  const pricing = order
    ? {
        itemsSubtotal: order.subtotal || 0,
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

  if (loading) {
    return (
      <CheckoutLayout
        stepId="review"
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
      stepId="review"
      summary={
        <OrderSummary
          pricing={pricing}
          submitLabel={submitting ? "Processing..." : "Proceed to Payment"}
          onSubmit={handleNext}
          disabled={submitting || loading}
        />
      }
    >
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Review Order</h1>
          <p className="mt-1 text-sm text-slate-500">
            Please verify your items and shipping details before payment.
          </p>
        </div>

        {/* Order Items - Grouped by Seller (like cart) */}
        <div className="space-y-6">
          {groupedItems.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-100 text-center text-slate-500">
              No items in order
            </div>
          ) : (
            groupedItems.map((sellerGroup) => (
              <div
                key={sellerGroup.sellerId}
                className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden"
              >
                {/* Seller Header */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <Package className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Sold by
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        {sellerGroup.sellerName}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="p-6 space-y-6">
                  {sellerGroup.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex gap-4 sm:gap-6 pb-6 border-b border-slate-100 last:border-0 last:pb-0"
                    >
                      {/* Product Image */}
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                        <img
                          src={
                            item.productId?.images?.[0]
                              ? `/api/files/${item.productId.images[0]}`
                              : "https://placehold.co/80x80"
                          }
                          alt={item.title || item.productId?.title}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex flex-1 flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-slate-900 mb-1">
                            {item.title || item.productId?.title || "Product"}
                          </h3>
                          <p className="text-xs text-slate-500 mb-2">
                            SKU: {item.productId?.sku || "N/A"}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="text-slate-600">
                              Qty:{" "}
                              <span className="font-semibold text-slate-900">
                                {item.quantity}
                              </span>
                            </div>
                            <div className="text-slate-600">
                              Unit Price:{" "}
                              <span className="font-semibold text-slate-900">
                                ${(item.price || 0).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Item Total */}
                        <div className="shrink-0 text-right">
                          <p className="text-xs text-slate-500 mb-1">Total</p>
                          <p className="text-lg font-bold text-slate-900">
                            $
                            {(
                              item.subtotal ||
                              item.price * item.quantity ||
                              0
                            ).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Shipping Details - Below Items */}
        <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Truck className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">
              Shipping Details
            </h2>
          </div>

          <div className="ml-12 p-4 rounded-xl bg-slate-50 border border-slate-100">
            {shippingAddress ? (
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <div className="text-sm text-slate-600 leading-relaxed">
                  <p className="font-semibold text-slate-900 mb-1">
                    {shippingAddress.name}
                  </p>
                  <p>{shippingAddress.line1}</p>
                  {shippingAddress.line2 && <p>{shippingAddress.line2}</p>}
                  <p>
                    {shippingAddress.city}, {shippingAddress.state}{" "}
                    {shippingAddress.pincode}
                  </p>
                  <p className="mt-1">{shippingAddress.phone}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-orange-600">
                No shipping address selected.
              </p>
            )}
          </div>
        </section>
      </div>
    </CheckoutLayout>
  );
}
