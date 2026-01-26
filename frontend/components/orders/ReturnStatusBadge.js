"use client";

import Badge from "@/components/ui/Badge";
import { RETURN_STATES } from "@/data/ordersData";

/**
 * Get badge configuration for a return state
 */
export function getReturnBadgeConfig(state) {
  switch (state) {
    case RETURN_STATES.REQUESTED:
      return { variant: "amber", label: "Requested" };
    case RETURN_STATES.APPROVED:
      return { variant: "blue", label: "Approved" };
    case RETURN_STATES.REJECTED:
      return { variant: "rose", label: "Rejected" };
    case RETURN_STATES.RETURNED:
      return { variant: "indigo", label: "Returned" };
    case RETURN_STATES.REFUNDED:
      return { variant: "emerald", label: "Refunded" };
    default:
      return { variant: "gray", label: state };
  }
}

/**
 * ReturnStatusBadge - Badge component with return-specific status colors
 */
export default function ReturnStatusBadge({ state, className = "" }) {
  const config = getReturnBadgeConfig(state);

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
