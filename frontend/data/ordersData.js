/**
 * B2B Order Management System - Centralized Dummy Data
 *
 * This file contains realistic, non-trivial data for the order management system.
 * Data is consistent across all panels (Seller, Buyer, Admin).
 */

// =============================================================================
// SELLERS
// =============================================================================
export const sellers = [
  {
    id: "seller-001",
    name: "Industrial Supplies Co.",
    email: "sales@industrialsupplies.com",
  },
  {
    id: "seller-002",
    name: "TechParts Manufacturing",
    email: "orders@techparts.com",
  },
  {
    id: "seller-003",
    name: "BuildRight Materials",
    email: "support@buildright.com",
  },
];

// =============================================================================
// BUYERS
// =============================================================================
export const buyers = [
  {
    id: "buyer-001",
    name: "Acme Manufacturing Ltd.",
    email: "procurement@acme.com",
  },
  {
    id: "buyer-002",
    name: "Global Industries Inc.",
    email: "orders@globalind.com",
  },
  {
    id: "buyer-003",
    name: "Metro Construction Group",
    email: "purchasing@metroconstruction.com",
  },
  {
    id: "buyer-004",
    name: "Premier Engineering Co.",
    email: "supply@premiereng.com",
  },
];

// =============================================================================
// ORDER STATES (Separate from Payment States)
// =============================================================================
export const ORDER_STATES = {
  PLACED: "placed",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

// =============================================================================
// PAYMENT STATES (Separate from Order States)
// =============================================================================
export const PAYMENT_STATES = {
  PENDING: "pending",
  HELD: "held", // Payment captured but held in escrow
  RELEASED: "released", // Released to seller
  REFUNDED: "refunded",
};

// =============================================================================
// RETURN STATES
// =============================================================================
export const RETURN_STATES = {
  REQUESTED: "requested",
  APPROVED: "approved",
  REJECTED: "rejected",
  RETURNED: "returned", // Item physically returned
  REFUNDED: "refunded",
};

// =============================================================================
// AUTO-DELIVERY DAYS (Simulated)
// =============================================================================
export const AUTO_DELIVERY_DAYS = 7;

// =============================================================================
// ORDERS
// =============================================================================
export const orders = [
  // === PLACED (Pending seller action) ===
  {
    id: "ORD-2026-0001",
    sellerId: "seller-001",
    sellerName: "Industrial Supplies Co.",
    buyerId: "buyer-001",
    buyerName: "Acme Manufacturing Ltd.",
    productName: "Industrial Water Pump XL-500",
    quantity: 5,
    unitPrice: 2499.99,
    totalAmount: 12499.95,
    orderState: ORDER_STATES.PLACED,
    paymentState: PAYMENT_STATES.HELD,
    placedAt: "2026-01-17T10:30:00Z",
    acceptedAt: null,
    rejectedAt: null,
    rejectionReason: null,
    shippedAt: null,
    deliveredAt: null,
    completedAt: null,
    cancelledAt: null,
  },
  {
    id: "ORD-2026-0002",
    sellerId: "seller-001",
    sellerName: "Industrial Supplies Co.",
    buyerId: "buyer-002",
    buyerName: "Global Industries Inc.",
    productName: "Hydraulic Press 50-Ton",
    quantity: 1,
    unitPrice: 45000.0,
    totalAmount: 45000.0,
    orderState: ORDER_STATES.PLACED,
    paymentState: PAYMENT_STATES.HELD,
    placedAt: "2026-01-17T14:15:00Z",
    acceptedAt: null,
    rejectedAt: null,
    rejectionReason: null,
    shippedAt: null,
    deliveredAt: null,
    completedAt: null,
    cancelledAt: null,
  },
  {
    id: "ORD-2026-0003",
    sellerId: "seller-002",
    sellerName: "TechParts Manufacturing",
    buyerId: "buyer-003",
    buyerName: "Metro Construction Group",
    productName: "CNC Milling Bits Set (100pc)",
    quantity: 10,
    unitPrice: 350.0,
    totalAmount: 3500.0,
    orderState: ORDER_STATES.PLACED,
    paymentState: PAYMENT_STATES.HELD,
    placedAt: "2026-01-18T08:00:00Z",
    acceptedAt: null,
    rejectedAt: null,
    rejectionReason: null,
    shippedAt: null,
    deliveredAt: null,
    completedAt: null,
    cancelledAt: null,
  },

  // === ACCEPTED / PROCESSING ===
  {
    id: "ORD-2026-0004",
    sellerId: "seller-001",
    sellerName: "Industrial Supplies Co.",
    buyerId: "buyer-003",
    buyerName: "Metro Construction Group",
    productName: "Steel I-Beams (12m)",
    quantity: 50,
    unitPrice: 180.0,
    totalAmount: 9000.0,
    orderState: ORDER_STATES.PROCESSING,
    paymentState: PAYMENT_STATES.HELD,
    placedAt: "2026-01-15T09:00:00Z",
    acceptedAt: "2026-01-15T11:30:00Z",
    rejectedAt: null,
    rejectionReason: null,
    shippedAt: null,
    deliveredAt: null,
    completedAt: null,
    cancelledAt: null,
  },
  {
    id: "ORD-2026-0005",
    sellerId: "seller-002",
    sellerName: "TechParts Manufacturing",
    buyerId: "buyer-001",
    buyerName: "Acme Manufacturing Ltd.",
    productName: "Precision Bearings (Set of 200)",
    quantity: 3,
    unitPrice: 1200.0,
    totalAmount: 3600.0,
    orderState: ORDER_STATES.PROCESSING,
    paymentState: PAYMENT_STATES.HELD,
    placedAt: "2026-01-14T16:00:00Z",
    acceptedAt: "2026-01-15T08:00:00Z",
    rejectedAt: null,
    rejectionReason: null,
    shippedAt: null,
    deliveredAt: null,
    completedAt: null,
    cancelledAt: null,
  },

  // === SHIPPED (Awaiting auto-delivery) ===
  {
    id: "ORD-2026-0006",
    sellerId: "seller-001",
    sellerName: "Industrial Supplies Co.",
    buyerId: "buyer-004",
    buyerName: "Premier Engineering Co.",
    productName: "Electric Motor 15HP",
    quantity: 4,
    unitPrice: 3200.0,
    totalAmount: 12800.0,
    orderState: ORDER_STATES.SHIPPED,
    paymentState: PAYMENT_STATES.HELD,
    placedAt: "2026-01-10T10:00:00Z",
    acceptedAt: "2026-01-10T14:00:00Z",
    shippedAt: "2026-01-12T09:00:00Z",
    deliveredAt: null,
    completedAt: null,
    cancelledAt: null,
    autoDeliveryAt: "2026-01-19T09:00:00Z", // 7 days from shipment
  },
  {
    id: "ORD-2026-0007",
    sellerId: "seller-003",
    sellerName: "BuildRight Materials",
    buyerId: "buyer-002",
    buyerName: "Global Industries Inc.",
    productName: "Concrete Mix Premium (50kg bags)",
    quantity: 200,
    unitPrice: 12.5,
    totalAmount: 2500.0,
    orderState: ORDER_STATES.SHIPPED,
    paymentState: PAYMENT_STATES.HELD,
    placedAt: "2026-01-08T11:00:00Z",
    acceptedAt: "2026-01-08T15:00:00Z",
    shippedAt: "2026-01-11T10:00:00Z",
    deliveredAt: null,
    completedAt: null,
    cancelledAt: null,
    autoDeliveryAt: "2026-01-18T10:00:00Z",
  },

  // === DELIVERED ===
  {
    id: "ORD-2026-0008",
    sellerId: "seller-002",
    sellerName: "TechParts Manufacturing",
    buyerId: "buyer-004",
    buyerName: "Premier Engineering Co.",
    productName: "Industrial Sensors Pack",
    quantity: 25,
    unitPrice: 89.99,
    totalAmount: 2249.75,
    orderState: ORDER_STATES.DELIVERED,
    paymentState: PAYMENT_STATES.RELEASED,
    placedAt: "2026-01-02T09:00:00Z",
    acceptedAt: "2026-01-02T12:00:00Z",
    shippedAt: "2026-01-03T14:00:00Z",
    deliveredAt: "2026-01-10T10:00:00Z",
    completedAt: null,
    cancelledAt: null,
  },
  {
    id: "ORD-2026-0009",
    sellerId: "seller-001",
    sellerName: "Industrial Supplies Co.",
    buyerId: "buyer-001",
    buyerName: "Acme Manufacturing Ltd.",
    productName: "Welding Machine Pro 400A",
    quantity: 2,
    unitPrice: 8500.0,
    totalAmount: 17000.0,
    orderState: ORDER_STATES.DELIVERED,
    paymentState: PAYMENT_STATES.RELEASED,
    placedAt: "2025-12-28T10:00:00Z",
    acceptedAt: "2025-12-28T14:00:00Z",
    shippedAt: "2025-12-30T09:00:00Z",
    deliveredAt: "2026-01-06T11:00:00Z",
    completedAt: null,
    cancelledAt: null,
  },

  // === COMPLETED ===
  {
    id: "ORD-2025-0050",
    sellerId: "seller-003",
    sellerName: "BuildRight Materials",
    buyerId: "buyer-003",
    buyerName: "Metro Construction Group",
    productName: "Scaffolding Set Industrial",
    quantity: 1,
    unitPrice: 15000.0,
    totalAmount: 15000.0,
    orderState: ORDER_STATES.COMPLETED,
    paymentState: PAYMENT_STATES.RELEASED,
    placedAt: "2025-12-15T08:00:00Z",
    acceptedAt: "2025-12-15T10:00:00Z",
    shippedAt: "2025-12-17T09:00:00Z",
    deliveredAt: "2025-12-24T14:00:00Z",
    completedAt: "2025-12-26T10:00:00Z",
    cancelledAt: null,
  },

  // === REJECTED ===
  {
    id: "ORD-2026-0010",
    sellerId: "seller-002",
    sellerName: "TechParts Manufacturing",
    buyerId: "buyer-002",
    buyerName: "Global Industries Inc.",
    productName: "Custom Machined Parts",
    quantity: 500,
    unitPrice: 45.0,
    totalAmount: 22500.0,
    orderState: ORDER_STATES.REJECTED,
    paymentState: PAYMENT_STATES.REFUNDED,
    placedAt: "2026-01-16T09:00:00Z",
    acceptedAt: null,
    rejectedAt: "2026-01-16T14:00:00Z",
    rejectionReason:
      "Specifications require custom tooling not currently available. Lead time would exceed 8 weeks.",
    shippedAt: null,
    deliveredAt: null,
    completedAt: null,
    cancelledAt: null,
  },

  // === CANCELLED ===
  {
    id: "ORD-2026-0011",
    sellerId: "seller-001",
    sellerName: "Industrial Supplies Co.",
    buyerId: "buyer-004",
    buyerName: "Premier Engineering Co.",
    productName: "Pneumatic Tools Set",
    quantity: 10,
    unitPrice: 450.0,
    totalAmount: 4500.0,
    orderState: ORDER_STATES.CANCELLED,
    paymentState: PAYMENT_STATES.REFUNDED,
    placedAt: "2026-01-14T11:00:00Z",
    acceptedAt: "2026-01-14T13:00:00Z",
    cancelledAt: "2026-01-14T16:00:00Z",
    cancellationReason: "Buyer requested cancellation - project postponed",
    shippedAt: null,
    deliveredAt: null,
    completedAt: null,
  },
];

// =============================================================================
// RETURNS
// =============================================================================
export const returns = [
  // === REQUESTED (Pending seller action) ===
  {
    id: "RET-2026-0001",
    orderId: "ORD-2026-0008",
    sellerId: "seller-002",
    sellerName: "TechParts Manufacturing",
    buyerId: "buyer-004",
    buyerName: "Premier Engineering Co.",
    productName: "Industrial Sensors Pack",
    quantity: 5,
    returnAmount: 449.95,
    state: RETURN_STATES.REQUESTED,
    reason: "defective",
    reasonLabel: "Product Defective",
    buyerNote:
      "5 sensors out of 25 are not functioning properly. Display shows error code E-42.",
    requestedAt: "2026-01-15T10:00:00Z",
    approvedAt: null,
    rejectedAt: null,
    rejectionReason: null,
    returnedAt: null,
    refundedAt: null,
  },
  {
    id: "RET-2026-0002",
    orderId: "ORD-2026-0009",
    sellerId: "seller-001",
    sellerName: "Industrial Supplies Co.",
    buyerId: "buyer-001",
    buyerName: "Acme Manufacturing Ltd.",
    productName: "Welding Machine Pro 400A",
    quantity: 1,
    returnAmount: 8500.0,
    state: RETURN_STATES.REQUESTED,
    reason: "wrong_item",
    reasonLabel: "Wrong Item Received",
    buyerNote: "Received 300A model instead of 400A as ordered.",
    requestedAt: "2026-01-17T09:00:00Z",
    approvedAt: null,
    rejectedAt: null,
    rejectionReason: null,
    returnedAt: null,
    refundedAt: null,
  },

  // === APPROVED (Awaiting return shipment) ===
  {
    id: "RET-2026-0003",
    orderId: "ORD-2025-0050",
    sellerId: "seller-003",
    sellerName: "BuildRight Materials",
    buyerId: "buyer-003",
    buyerName: "Metro Construction Group",
    productName: "Scaffolding Set Industrial",
    quantity: 1,
    returnAmount: 15000.0,
    state: RETURN_STATES.APPROVED,
    reason: "damaged",
    reasonLabel: "Damaged in Transit",
    buyerNote: "Several cross-braces bent during delivery.",
    sellerNote: "Approved. Please return damaged components for replacement.",
    requestedAt: "2026-01-05T11:00:00Z",
    approvedAt: "2026-01-06T09:00:00Z",
    rejectedAt: null,
    rejectionReason: null,
    returnedAt: null,
    refundedAt: null,
  },

  // === REJECTED ===
  {
    id: "RET-2026-0004",
    orderId: "ORD-2026-0008",
    sellerId: "seller-002",
    sellerName: "TechParts Manufacturing",
    buyerId: "buyer-004",
    buyerName: "Premier Engineering Co.",
    productName: "Industrial Sensors Pack",
    quantity: 20,
    returnAmount: 1799.8,
    state: RETURN_STATES.REJECTED,
    reason: "not_as_described",
    reasonLabel: "Not as Described",
    buyerNote: "Expected wireless sensors but received wired version.",
    requestedAt: "2026-01-12T14:00:00Z",
    approvedAt: null,
    rejectedAt: "2026-01-13T10:00:00Z",
    rejectionReason:
      'Product listing clearly states "wired industrial sensors" with specifications. Return does not meet policy criteria.',
    returnedAt: null,
    refundedAt: null,
  },

  // === RETURNED (Item received back by seller) ===
  {
    id: "RET-2025-0010",
    orderId: "ORD-2025-0045",
    sellerId: "seller-001",
    sellerName: "Industrial Supplies Co.",
    buyerId: "buyer-002",
    buyerName: "Global Industries Inc.",
    productName: "Pressure Gauges Set",
    quantity: 10,
    returnAmount: 890.0,
    state: RETURN_STATES.RETURNED,
    reason: "defective",
    reasonLabel: "Product Defective",
    buyerNote: "Gauges showing inaccurate readings.",
    sellerNote: "Return approved for defective items.",
    requestedAt: "2025-12-20T10:00:00Z",
    approvedAt: "2025-12-21T09:00:00Z",
    rejectedAt: null,
    rejectionReason: null,
    returnedAt: "2026-01-10T14:00:00Z",
    refundedAt: null,
  },

  // === REFUNDED ===
  {
    id: "RET-2025-0005",
    orderId: "ORD-2025-0030",
    sellerId: "seller-003",
    sellerName: "BuildRight Materials",
    buyerId: "buyer-001",
    buyerName: "Acme Manufacturing Ltd.",
    productName: "Cement Mixer Industrial",
    quantity: 1,
    returnAmount: 4500.0,
    state: RETURN_STATES.REFUNDED,
    reason: "damaged",
    reasonLabel: "Damaged in Transit",
    buyerNote: "Motor housing cracked on arrival.",
    sellerNote: "Confirmed damage. Full refund processed.",
    adminNote: "Refund issued by admin after confirming return receipt.",
    requestedAt: "2025-12-10T09:00:00Z",
    approvedAt: "2025-12-11T10:00:00Z",
    rejectedAt: null,
    rejectionReason: null,
    returnedAt: "2025-12-18T11:00:00Z",
    refundedAt: "2025-12-19T09:00:00Z",
  },
];

// =============================================================================
// RETURN REASONS (for dropdown)
// =============================================================================
export const RETURN_REASONS = [
  { value: "defective", label: "Product Defective" },
  { value: "damaged", label: "Damaged in Transit" },
  { value: "wrong_item", label: "Wrong Item Received" },
  { value: "not_as_described", label: "Not as Described" },
  { value: "quality_issue", label: "Quality Not as Expected" },
  { value: "other", label: "Other" },
];

// =============================================================================
// AUDIT LOGS
// =============================================================================
export const auditLogs = [
  // Order ORD-2026-0008 timeline
  {
    id: "log-001",
    orderId: "ORD-2026-0008",
    event: "order_placed",
    description: "Order placed by buyer",
    actor: "buyer-004",
    actorName: "Premier Engineering Co.",
    actorType: "buyer",
    timestamp: "2026-01-02T09:00:00Z",
  },
  {
    id: "log-002",
    orderId: "ORD-2026-0008",
    event: "order_accepted",
    description: "Order accepted by seller",
    actor: "seller-002",
    actorName: "TechParts Manufacturing",
    actorType: "seller",
    timestamp: "2026-01-02T12:00:00Z",
  },
  {
    id: "log-003",
    orderId: "ORD-2026-0008",
    event: "order_shipped",
    description: "Order marked as shipped",
    actor: "seller-002",
    actorName: "TechParts Manufacturing",
    actorType: "seller",
    timestamp: "2026-01-03T14:00:00Z",
  },
  {
    id: "log-004",
    orderId: "ORD-2026-0008",
    event: "order_delivered",
    description: "Delivery auto-confirmed after 7 days",
    actor: "system",
    actorName: "System",
    actorType: "system",
    timestamp: "2026-01-10T10:00:00Z",
  },
  {
    id: "log-005",
    orderId: "ORD-2026-0008",
    event: "payment_released",
    description: "Payment released to seller",
    actor: "system",
    actorName: "System",
    actorType: "system",
    timestamp: "2026-01-10T10:00:00Z",
  },

  // Order ORD-2026-0006 timeline (shipped, pending delivery)
  {
    id: "log-006",
    orderId: "ORD-2026-0006",
    event: "order_placed",
    description: "Order placed by buyer",
    actor: "buyer-004",
    actorName: "Premier Engineering Co.",
    actorType: "buyer",
    timestamp: "2026-01-10T10:00:00Z",
  },
  {
    id: "log-007",
    orderId: "ORD-2026-0006",
    event: "order_accepted",
    description: "Order accepted by seller",
    actor: "seller-001",
    actorName: "Industrial Supplies Co.",
    actorType: "seller",
    timestamp: "2026-01-10T14:00:00Z",
  },
  {
    id: "log-008",
    orderId: "ORD-2026-0006",
    event: "order_shipped",
    description: "Order marked as shipped",
    actor: "seller-001",
    actorName: "Industrial Supplies Co.",
    actorType: "seller",
    timestamp: "2026-01-12T09:00:00Z",
  },

  // Return RET-2025-0005 timeline (full flow)
  {
    id: "log-020",
    returnId: "RET-2025-0005",
    orderId: "ORD-2025-0030",
    event: "return_requested",
    description: "Return request submitted",
    actor: "buyer-001",
    actorName: "Acme Manufacturing Ltd.",
    actorType: "buyer",
    timestamp: "2025-12-10T09:00:00Z",
  },
  {
    id: "log-021",
    returnId: "RET-2025-0005",
    orderId: "ORD-2025-0030",
    event: "return_approved",
    description: "Return approved by seller",
    actor: "seller-003",
    actorName: "BuildRight Materials",
    actorType: "seller",
    timestamp: "2025-12-11T10:00:00Z",
  },
  {
    id: "log-022",
    returnId: "RET-2025-0005",
    orderId: "ORD-2025-0030",
    event: "item_returned",
    description: "Item marked as returned",
    actor: "admin-001",
    actorName: "Admin User",
    actorType: "admin",
    timestamp: "2025-12-18T11:00:00Z",
  },
  {
    id: "log-023",
    returnId: "RET-2025-0005",
    orderId: "ORD-2025-0030",
    event: "refund_issued",
    description: "Refund processed by admin",
    actor: "admin-001",
    actorName: "Admin User",
    actorType: "admin",
    timestamp: "2025-12-19T09:00:00Z",
  },

  // Admin override example
  {
    id: "log-030",
    orderId: "ORD-2026-0007",
    event: "admin_force_deliver",
    description:
      "Delivery force-marked by admin (buyer confirmed receipt via phone)",
    actor: "admin-001",
    actorName: "Admin User",
    actorType: "admin",
    timestamp: "2026-01-16T15:00:00Z",
    note: "Buyer confirmed receipt via phone support call.",
  },
];

// =============================================================================
// HELPER: Get orders for a specific seller
// =============================================================================
export function getOrdersBySeller(sellerId) {
  return orders.filter((o) => o.sellerId === sellerId);
}

// =============================================================================
// HELPER: Get orders for a specific buyer
// =============================================================================
export function getOrdersByBuyer(buyerId) {
  return orders.filter((o) => o.buyerId === buyerId);
}

// =============================================================================
// HELPER: Get returns for a specific seller
// =============================================================================
export function getReturnsBySeller(sellerId) {
  return returns.filter((r) => r.sellerId === sellerId);
}

// =============================================================================
// HELPER: Get returns for a specific buyer
// =============================================================================
export function getReturnsByBuyer(buyerId) {
  return returns.filter((r) => r.buyerId === buyerId);
}

// =============================================================================
// HELPER: Get audit logs for an order
// =============================================================================
export function getAuditLogsForOrder(orderId) {
  return auditLogs
    .filter((log) => log.orderId === orderId)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

// =============================================================================
// HELPER: Get audit logs for a return
// =============================================================================
export function getAuditLogsForReturn(returnId) {
  return auditLogs
    .filter((log) => log.returnId === returnId)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

// =============================================================================
// HELPER: Format currency
// =============================================================================
export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

// =============================================================================
// HELPER: Format date
// =============================================================================
export function formatDate(dateString) {
  if (!dateString) return "—";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

// =============================================================================
// HELPER: Format relative time
// =============================================================================
export function formatRelativeTime(dateString) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDate(dateString);
}
