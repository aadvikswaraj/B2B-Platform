"use client";

import clsx from "clsx";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { formatCurrency, formatRelativeTime } from "@/data/ordersData";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ShoppingBagIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * OrderMobileCard - Ultra-premium responsive card for mobile
 */
export default function OrderMobileCard({
  order,
  getStatusBadge,
  actions,
  showPaymentState = false,
  className = "",
}) {
  const [expanded, setExpanded] = useState(false);
  const statusBadge = getStatusBadge ? getStatusBadge(order) : null;

  return (
    <div
      className={clsx(
        "bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden ring-1 ring-gray-50",
        className,
      )}
    >
      {/* Header - Always visible */}
      <div
        className="p-4 cursor-pointer active:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="min-w-0">
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-semibold text-gray-900 truncate pr-2">
              {order.productName}
            </h3>
            <p className="text-sm font-bold text-gray-900">
              {formatCurrency(order.totalAmount)}
            </p>
          </div>

          <div className="flex items-center gap-2 mt-1">
            {statusBadge && (
              <Badge size="xs" variant={statusBadge.variant}>
                {statusBadge.label}
              </Badge>
            )}
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">
              {formatRelativeTime(order.placedAt)}
            </span>
          </div>
        </div>

        {/* Expand Trigger */}
        <div className="flex items-center justify-center mt-3 pt-2">
          <div className="h-1 w-12 bg-gray-100 rounded-full flex items-center justify-center">
            {expanded ? (
              <ChevronUpIcon className="h-3 w-3 text-gray-400" />
            ) : (
              <ChevronDownIcon className="h-3 w-3 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-5 pt-1 space-y-4">
              {/* Details Grid */}
              <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-2 gap-y-3 gap-x-2 text-xs border border-gray-100">
                <div>
                  <span className="text-gray-400 block mb-0.5">Order ID</span>
                  <span className="font-mono font-medium text-gray-700">
                    {order.id}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">Seller</span>
                  <span className="font-medium text-gray-700 truncate block">
                    {order.sellerName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">Quantity</span>
                  <span className="font-medium text-gray-700">
                    {order.quantity}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">Unit Price</span>
                  <span className="font-medium text-gray-700">
                    {formatCurrency(order.unitPrice)}
                  </span>
                </div>

                {order.autoDeliveryAt && (
                  <div className="col-span-2 pt-2 border-t border-gray-200 mt-1">
                    <span className="text-gray-400 block mb-0.5">
                      Auto-delivery Est.
                    </span>
                    <span className="font-medium text-amber-600">
                      {new Date(order.autoDeliveryAt).toLocaleDateString(
                        undefined,
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* Rejection/Cancel Notes */}
              {order.rejectionReason && (
                <div className="p-3 bg-rose-50 rounded-lg text-xs text-rose-700 border border-rose-100">
                  <span className="font-semibold block mb-1">
                    Rejection Reason:
                  </span>
                  {order.rejectionReason}
                </div>
              )}
              {order.cancellationReason && (
                <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-600 border border-gray-200">
                  <span className="font-semibold block mb-1">
                    Cancellation Reason:
                  </span>
                  {order.cancellationReason}
                </div>
              )}

              {/* Smart Actions */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link href={`/myaccount/orders/${order.id}`} className="w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-center"
                    icon={EyeIcon}
                  >
                    Details
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center"
                  icon={ChatBubbleLeftRightIcon}
                  onClick={() => alert("Chat coming soon!")}
                >
                  Chat
                </Button>
              </div>

              {/* Contextual Actions (passed from parent) */}
              {actions && (
                <div className="pt-2 border-t border-gray-100 mt-2">
                  {actions}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
