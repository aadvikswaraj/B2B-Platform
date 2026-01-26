"use client";

import clsx from "clsx";
import { formatDate } from "@/data/ordersData";

/**
 * OrderTimeline - Vertical timeline component for order/return events
 *
 * @param {Array} events - Array of event objects with:
 *   - id: unique identifier
 *   - event: event type
 *   - description: human-readable description
 *   - actorName: who performed the action
 *   - actorType: 'buyer' | 'seller' | 'admin' | 'system'
 *   - timestamp: ISO timestamp
 *   - note: optional additional note
 */
export default function OrderTimeline({ events = [], className = "" }) {
  if (!events || events.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic py-4">
        No timeline events available.
      </div>
    );
  }

  const getActorColor = (actorType) => {
    switch (actorType) {
      case "buyer":
        return "bg-blue-500";
      case "seller":
        return "bg-emerald-500";
      case "admin":
        return "bg-rose-500";
      case "system":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  const getActorBadge = (actorType) => {
    switch (actorType) {
      case "buyer":
        return { bg: "bg-blue-50", text: "text-blue-700", label: "Buyer" };
      case "seller":
        return {
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          label: "Seller",
        };
      case "admin":
        return { bg: "bg-rose-50", text: "text-rose-700", label: "Admin" };
      case "system":
        return { bg: "bg-gray-100", text: "text-gray-600", label: "System" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-600", label: "Unknown" };
    }
  };

  return (
    <ol
      className={clsx(
        "relative border-l border-gray-200 space-y-6 pl-6",
        className,
      )}
    >
      {events.map((event, index) => {
        const badge = getActorBadge(event.actorType);
        const isLast = index === events.length - 1;

        return (
          <li key={event.id} className="relative">
            {/* Timeline dot */}
            <span
              className={clsx(
                "absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-white",
                getActorColor(event.actorType),
                isLast && "animate-pulse",
              )}
            />

            {/* Content */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-900">
                  {event.description}
                </span>
                <span
                  className={clsx(
                    "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium",
                    badge.bg,
                    badge.text,
                  )}
                >
                  {badge.label}
                </span>
              </div>

              <p className="text-xs text-gray-500">
                {event.actorName} • {formatDate(event.timestamp)}
              </p>

              {event.note && (
                <p className="mt-1 text-xs text-gray-600 bg-gray-50 rounded px-2 py-1 italic">
                  "{event.note}"
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
