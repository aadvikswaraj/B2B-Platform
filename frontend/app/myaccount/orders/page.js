"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import OrderCard from "@/components/orders/OrderCard";
import Button from "@/components/ui/Button";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { getOrders } from "@/utils/ordersApi";

export default function UnifiedOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const view = searchParams.get("view") || "orders"; // orders | returns
  const statusFilter = searchParams.get("status") || "all";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getOrders({
        view,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      if (res.success) {
        setOrders(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [view, statusFilter]);

  const handleViewChange = (newView) => {
    router.push(`/myaccount/orders?view=${newView}`);
  };

  const handleStatusChange = (newStatus) => {
    router.push(`/myaccount/orders?view=${view}&status=${newStatus}`);
  };

  // Status Filters based on View
  const filters =
    view === "orders"
      ? [
          { id: "all", label: "All" },
          { id: "preparing", label: "Being prepared" },
          { id: "shipped", label: "Shipped" },
          { id: "delivered", label: "Delivered" },
        ]
      : [
          { id: "all", label: "All Returns" },
          { id: "refund_requested", label: "Requested" },
          { id: "approved", label: "Approved" },
          { id: "denied", label: "Denied" },
          { id: "refunded", label: "Refunded" },
        ];

  const getStatusBadge = (order) => {
    // Unified Logic based on summary.status
    if (!order.summary) return { variant: "gray", label: "Unknown" };
    const s = order.summary.status;
    switch (s) {
      case "placed":
        return { variant: "amber", label: "Placed" };
      case "preparing":
      case "accepted":
      case "processing":
        return { variant: "blue", label: "Preparing" };
      case "shipped":
        return { variant: "indigo", label: "Shipped" };
      case "delivered":
        return { variant: "emerald", label: "Delivered" };
      case "cancelled":
        return { variant: "rose", label: "Cancelled" };
      default:
        return { variant: "gray", label: s };
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          My Orders & Returns
        </h1>
        <p className="mt-2 text-base text-gray-500">
          Track current orders, view history, and manage returns.
        </p>
      </div>

      {/* Primary Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => handleViewChange("orders")}
          className={`pb-4 px-6 text-sm font-medium ${view === "orders" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          Orders
        </button>
        <button
          onClick={() => handleViewChange("returns")}
          className={`pb-4 px-6 text-sm font-medium ${view === "returns" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          Returns
        </button>
      </div>

      {/* Secondary Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => handleStatusChange(f.id)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${statusFilter === f.id ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20">Loading...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-24 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
          <p className="text-lg font-medium text-gray-900">No {view} found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              getStatusBadge={getStatusBadge}
              onOpenTimeline={() => {}} // TODO
              onCancel={() => {}} // TODO
              canCancel={(o) => false} // TODO
            />
          ))}
        </div>
      )}
    </div>
  );
}
