/**
 * B2B Order Management System - Mock API Service
 *
 * All API calls are simulated with async delays.
 * No actual backend calls are made.
 */

// Simulate network delay
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// =============================================================================
// SELLER API
// =============================================================================

/**
 * Accept an order
 * POST /seller/orders/{id}/accept
 */
export async function sellerAcceptOrder(orderId) {
  await delay();
  console.log(`[Mock API] POST /seller/orders/${orderId}/accept`);
  return {
    success: true,
    message: "Order accepted successfully",
    data: {
      orderId,
      acceptedAt: new Date().toISOString(),
      newState: "processing",
    },
  };
}

/**
 * Reject an order
 * POST /seller/orders/{id}/reject
 */
export async function sellerRejectOrder(orderId, reason) {
  await delay();
  console.log(`[Mock API] POST /seller/orders/${orderId}/reject`, { reason });
  if (!reason || reason.trim().length === 0) {
    return {
      success: false,
      error: "Rejection reason is required",
    };
  }
  return {
    success: true,
    message: "Order rejected",
    data: {
      orderId,
      rejectedAt: new Date().toISOString(),
      rejectionReason: reason,
      newState: "rejected",
    },
  };
}

/**
 * Mark order as shipped
 * POST /seller/orders/{id}/ship
 */
export async function sellerShipOrder(orderId) {
  await delay();
  console.log(`[Mock API] POST /seller/orders/${orderId}/ship`);
  const shippedAt = new Date();
  const autoDeliveryAt = new Date(shippedAt);
  autoDeliveryAt.setDate(autoDeliveryAt.getDate() + 7);

  return {
    success: true,
    message: "Order marked as shipped",
    data: {
      orderId,
      shippedAt: shippedAt.toISOString(),
      autoDeliveryAt: autoDeliveryAt.toISOString(),
      newState: "shipped",
    },
  };
}

/**
 * Approve a return request
 * POST /seller/returns/{id}/approve
 */
export async function sellerApproveReturn(returnId, message = "") {
  await delay();
  console.log(`[Mock API] POST /seller/returns/${returnId}/approve`, {
    message,
  });
  return {
    success: true,
    message: "Return approved",
    data: {
      returnId,
      approvedAt: new Date().toISOString(),
      sellerNote: message,
      newState: "approved",
    },
  };
}

/**
 * Reject a return request
 * POST /seller/returns/{id}/reject
 */
export async function sellerRejectReturn(returnId, reason) {
  await delay();
  console.log(`[Mock API] POST /seller/returns/${returnId}/reject`, { reason });
  if (!reason || reason.trim().length === 0) {
    return {
      success: false,
      error: "Rejection reason is required",
    };
  }
  return {
    success: true,
    message: "Return request rejected",
    data: {
      returnId,
      rejectedAt: new Date().toISOString(),
      rejectionReason: reason,
      newState: "rejected",
    },
  };
}

// =============================================================================
// BUYER API
// =============================================================================

/**
 * Get unified orders/returns list
 * GET /api/buyer/orders?view=orders|returns&status=...
 */
export async function getOrders(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const headers = {};
    const token = localStorage.getItem("token"); // Assuming auth token stored
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/buyer/orders?${query}`,
      {
        headers,
      },
    );

    const result = await res.json();
    if (!result.success) {
      throw new Error(result.message || "Failed to fetch orders");
    }
    return result;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Cancel an order (only before shipment)
 * POST /buyer/orders/{id}/cancel
 */
export async function buyerCancelOrder(orderId, reason = "") {
  await delay();
  console.log(`[Mock API] POST /buyer/orders/${orderId}/cancel`, { reason });
  return {
    success: true,
    message: "Order cancelled successfully",
    data: {
      orderId,
      cancelledAt: new Date().toISOString(),
      cancellationReason: reason,
      newState: "cancelled",
      paymentState: "refunded",
    },
  };
}

/**
 * Request a return
 * POST /buyer/returns
 */
export async function buyerRequestReturn(orderId, reason, note = "") {
  await delay();
  console.log(`[Mock API] POST /buyer/returns`, { orderId, reason, note });
  if (!reason) {
    return {
      success: false,
      error: "Return reason is required",
    };
  }
  return {
    success: true,
    message: "Return request submitted",
    data: {
      returnId: `RET-${Date.now()}`,
      orderId,
      reason,
      buyerNote: note,
      requestedAt: new Date().toISOString(),
      state: "requested",
    },
  };
}

// =============================================================================
// ADMIN API
// =============================================================================

/**
 * Force mark an order as delivered
 * POST /admin/orders/{id}/force-deliver
 */
export async function adminForceDeliver(orderId, note = "") {
  await delay();
  console.log(`[Mock API] POST /admin/orders/${orderId}/force-deliver`, {
    note,
  });
  return {
    success: true,
    message: "Order force-marked as delivered",
    data: {
      orderId,
      deliveredAt: new Date().toISOString(),
      adminNote: note,
      newState: "delivered",
      paymentState: "released",
    },
  };
}

/**
 * Rollback a delivery (admin only)
 * POST /admin/orders/{id}/rollback-delivery
 */
export async function adminRollbackDelivery(orderId, reason) {
  await delay();
  console.log(`[Mock API] POST /admin/orders/${orderId}/rollback-delivery`, {
    reason,
  });
  if (!reason || reason.trim().length === 0) {
    return {
      success: false,
      error: "Rollback reason is required",
    };
  }
  return {
    success: true,
    message: "Delivery status rolled back",
    data: {
      orderId,
      rolledBackAt: new Date().toISOString(),
      rollbackReason: reason,
      newState: "shipped",
      paymentState: "held",
    },
  };
}

/**
 * Admin approve a return
 * POST /admin/returns/{id}/approve
 */
export async function adminApproveReturn(returnId, note = "") {
  await delay();
  console.log(`[Mock API] POST /admin/returns/${returnId}/approve`, { note });
  return {
    success: true,
    message: "Return approved by admin",
    data: {
      returnId,
      approvedAt: new Date().toISOString(),
      adminNote: note,
      newState: "approved",
      isAdminOverride: true,
    },
  };
}

/**
 * Admin reject a return
 * POST /admin/returns/{id}/reject
 */
export async function adminRejectReturn(returnId, reason) {
  await delay();
  console.log(`[Mock API] POST /admin/returns/${returnId}/reject`, { reason });
  if (!reason || reason.trim().length === 0) {
    return {
      success: false,
      error: "Rejection reason is required",
    };
  }
  return {
    success: true,
    message: "Return rejected by admin",
    data: {
      returnId,
      rejectedAt: new Date().toISOString(),
      rejectionReason: reason,
      newState: "rejected",
      isAdminOverride: true,
    },
  };
}

/**
 * Mark item as physically returned
 * POST /admin/returns/{id}/mark-returned
 */
export async function adminMarkReturned(returnId, note = "") {
  await delay();
  console.log(`[Mock API] POST /admin/returns/${returnId}/mark-returned`, {
    note,
  });
  return {
    success: true,
    message: "Item marked as returned",
    data: {
      returnId,
      returnedAt: new Date().toISOString(),
      adminNote: note,
      newState: "returned",
    },
  };
}

/**
 * Force refund (admin only)
 * POST /admin/returns/{id}/force-refund
 */
export async function adminForceRefund(returnId, note = "") {
  await delay();
  console.log(`[Mock API] POST /admin/returns/${returnId}/force-refund`, {
    note,
  });
  return {
    success: true,
    message: "Refund processed",
    data: {
      returnId,
      refundedAt: new Date().toISOString(),
      adminNote: note,
      newState: "refunded",
      paymentState: "refunded",
    },
  };
}

/**
 * Resolve a dispute (admin only)
 * POST /admin/disputes/{id}/resolve
 */
export async function adminResolveDispute(disputeId, resolution, note = "") {
  await delay();
  console.log(`[Mock API] POST /admin/disputes/${disputeId}/resolve`, {
    resolution,
    note,
  });
  if (!resolution) {
    return {
      success: false,
      error: "Resolution is required",
    };
  }
  return {
    success: true,
    message: "Dispute resolved",
    data: {
      disputeId,
      resolvedAt: new Date().toISOString(),
      resolution,
      adminNote: note,
      newState: "resolved",
    },
  };
}
