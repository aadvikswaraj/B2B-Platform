"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getOrder,
  buyerCancelOrder,
  buyerRequestReturn,
} from "@/utils/ordersApi";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { Textarea, Select } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { formatCurrency, formatDate } from "@/data/ordersData";
import {
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal States
  const [refundModal, setRefundModal] = useState({ open: false, itemId: null });
  const [refundReason, setRefundReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await getOrder(id);
      if (res.success) {
        setOrder(res.data.order);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const handleRefundRequest = async () => {
    if (!refundReason) return;
    setActionLoading(true);
    try {
      const res = await buyerRequestReturn(
        order._id,
        refundModal.itemId,
        refundReason,
      );
      if (res.success) {
        // Reload order to see update
        await fetchOrder();
        setRefundModal({ open: false, itemId: null });
        setRefundReason("");
      } else {
        alert(res.message);
      }
    } catch (err) {
      alert("Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading order...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!order) return <div className="p-8 text-center">Order not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeftIcon className="w-4 h-4 mr-1" /> Back to Orders
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              Order #{order.readableId}
            </h1>
            <Badge
              variant={
                order.summary?.status === "delivered"
                  ? "emerald"
                  : order.summary?.status === "cancelled"
                    ? "rose"
                    : "blue"
              }
            >
              {order.summary?.status.toUpperCase()}
            </Badge>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Placed on {formatDate(order.placedAt)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Total Amount</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(order.totalAmount)}
          </p>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Items</h2>
        {order.items.map((item) => (
          <div
            key={item._id}
            className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col md:flex-row gap-6"
          >
            {/* Image Placeholder */}
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0">
              {item.productId?.images?.[0] && (
                <img
                  src={item.productId.images[0]}
                  alt={item.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              )}
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-500">
                    Qty: {item.quantity} × {formatCurrency(item.price)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Seller: {item.seller?.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {formatCurrency(item.subtotal)}
                  </p>
                </div>
              </div>

              {/* Statuses */}
              <div className="mt-4 flex flex-wrap gap-3">
                {/* Fulfilment Status */}
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    item.fulfilment.status === "delivered"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : item.fulfilment.status === "cancelled"
                        ? "bg-rose-50 border-rose-200 text-rose-700"
                        : "bg-blue-50 border-blue-200 text-blue-700"
                  }`}
                >
                  Status: {item.fulfilment.status.toUpperCase()}
                </div>

                {/* Refund Status */}
                {item.refund?.requested && (
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      item.refund.status === "approved" ||
                      item.refund.status === "refunded"
                        ? "bg-green-50 border-green-200 text-green-800"
                        : item.refund.status === "denied"
                          ? "bg-red-50 border-red-200 text-red-800"
                          : "bg-amber-50 border-amber-200 text-amber-800"
                    }`}
                  >
                    Return: {item.refund.status.toUpperCase()}
                  </div>
                )}
              </div>

              {/* Item Actions */}
              <div className="mt-4 flex justify-end">
                {!item.refund?.requested &&
                  item.fulfilment.status !== "cancelled" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gray-600 hover:text-gray-900"
                      onClick={() =>
                        setRefundModal({ open: true, itemId: item._id })
                      }
                    >
                      Request Return / Refund
                    </Button>
                  )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-6 rounded-xl">
          <h3 className="font-medium text-gray-900 mb-2">Shipping Details</h3>
          {order.shippingAddress ? (
            <address className="not-italic text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-900">
                {order.shippingAddress.name}
              </p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && (
                <p>{order.shippingAddress.addressLine2}</p>
              )}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.pincode}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p className="mt-2 text-gray-900">
                Phone: {order.shippingAddress.phone}
              </p>
            </address>
          ) : (
            <p className="text-sm text-gray-500">No shipping address</p>
          )}
        </div>

        <div className="bg-gray-50 p-6 rounded-xl">
          <h3 className="font-medium text-gray-900 mb-2">Payment Info</h3>
          <p className="text-sm text-gray-600">
            Status:{" "}
            <span className="font-medium text-gray-900">
              {order.paymentStatus.toUpperCase()}
            </span>
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Total: {formatCurrency(order.totalAmount)}
          </p>
        </div>
      </div>

      {/* Refund Modal */}
      <Modal
        open={refundModal.open}
        onClose={() => setRefundModal({ open: false, itemId: null })}
        title="Request Return / Refund"
      >
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 text-blue-800 text-sm rounded-lg">
            Please provide a reason for your return request. The seller will
            review it shortly.
          </div>
          <FormField label="Reason" required>
            <Textarea
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="E.g. Item defective, wrong size..."
              rows={3}
            />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setRefundModal({ open: false, itemId: null })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRefundRequest}
              loading={actionLoading}
              disabled={!refundReason}
            >
              Submit Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
