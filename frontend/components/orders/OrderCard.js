"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/data/ordersData";
import {
  ChatBubbleLeftRightIcon,
  EyeIcon,
  ClockIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

export default function OrderCard({
  order,
  getStatusBadge,
  onOpenTimeline,
  onCancel,
  canCancel,
}) {
  const statusBadge = getStatusBadge(order);

  return (
    <div className="group relative bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Accent Border (Left) */}
      <div
        className={clsx(
          "absolute left-0 top-0 bottom-0 w-1",
          statusBadge.variant === "emerald"
            ? "bg-emerald-500"
            : statusBadge.variant === "blue"
              ? "bg-blue-500"
              : statusBadge.variant === "amber"
                ? "bg-amber-500"
                : statusBadge.variant === "rose"
                  ? "bg-rose-500"
                  : statusBadge.variant === "indigo"
                    ? "bg-indigo-500"
                    : "bg-gray-300",
        )}
      />

      <div className="p-6 flex flex-col md:flex-row gap-6 items-center">
        {/* Info Section */}
        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {/* Order & Product Info */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-gray-400">
                #{order.readableId || order.id || order._id}
              </span>
              <Badge size="sm" variant={statusBadge.variant}>
                {statusBadge.label}
              </Badge>
            </div>

            {/* Items Summary */}
            <div className="mt-2 space-y-1">
              {order.items.slice(0, 2).map((item, idx) => (
                <div
                  key={idx}
                  className="text-sm font-medium text-gray-900 truncate"
                >
                  {item.quantity}x{" "}
                  {item.title || item.product?.title || item.productName}
                </div>
              ))}
              {order.items.length > 2 && (
                <p className="text-xs text-gray-500">
                  +{order.items.length - 2} more items
                </p>
              )}
            </div>

            {/* Counts Summary (Unified) */}
            {order.summary && (
              <div className="mt-2 flex gap-2 text-xs text-gray-500">
                {order.summary.counts.shipped > 0 && (
                  <span>{order.summary.counts.shipped} shipped</span>
                )}
                {order.summary.counts.processing > 0 && (
                  <span>• {order.summary.counts.processing} preparing</span>
                )}
                {order.summary.counts.delivered > 0 && (
                  <span>• {order.summary.counts.delivered} delivered</span>
                )}
              </div>
            )}
          </div>

          {/* Price & Date */}
          <div className="col-span-1 flex flex-col justify-center border-l border-gray-100 pl-6 border-dashed">
            <p className="text-sm text-gray-500 mb-1">Total Amount</p>
            <p className="text-xl font-bold text-gray-900 tracking-tight">
              {formatCurrency(order.totalAmount)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Placed on {formatDate(order.placedAt)}
            </p>
          </div>

          {/* Actions */}
          <div className="col-span-1 flex flex-col items-end justify-center gap-2">
            <div className="flex items-center gap-2 w-full justify-end">
              <Link
                href={`/myaccount/orders/${order._id || order.id}`}
                className="block"
              >
                <Button
                  size="sm"
                  variant="outline"
                  className="border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 w-full sm:w-auto"
                >
                  View Details
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
