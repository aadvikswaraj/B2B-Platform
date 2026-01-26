import { Order } from "../../../models/model.js";

/**
 * Get orders for a specific seller
 * Returns orders with ONLY items belonging to that seller
 */
export const getSellerOrders = async (sellerId, query = {}) => {
  const { status, search } = query;

  // Base match: valid orders containing seller's items
  const matchStage = {
    paymentStatus: "paid", // Only show paid orders
    "items.seller": sellerId,
  };

  if (search) {
    matchStage["items.title"] = { $regex: search, $options: "i" };
  }

  const pipeline = [
    { $match: matchStage },
    { $sort: { placedAt: -1 } },
    {
      $project: {
        readableId: 1,
        placedAt: 1,
        buyer: 1, // Will populate below
        shippingAddress: 1,
        items: {
          $filter: {
            input: "$items",
            as: "item",
            cond: { $eq: ["$$item.seller", sellerId] },
          },
        },
      },
    },
    // Filter again if status query is present (post-projection)
    ...(status
      ? [
          {
            $match: {
              "items.fulfilment.status": status,
            },
          },
        ]
      : []),
  ];

  const orders = await Order.aggregate(pipeline);

  // Populate buyer details (aggregate doesn't auto-populate)
  await Order.populate(orders, { path: "buyer", select: "name email phone" }); // simplified select

  return orders;
};

/**
 * Update fulfilment status for a specific item
 * STRICT STATE MACHINE ENFORCEMENT
 */
export const updateItemFulfilment = async (
  orderId,
  itemId,
  sellerId,
  newStatus,
  meta = {},
) => {
  const order = await Order.findOne({
    _id: orderId,
    "items._id": itemId,
    "items.seller": sellerId,
  });

  if (!order) {
    throw new Error("Order item not found or unauthorized");
  }

  // Find the specific item
  const item = order.items.id(itemId);
  const currentStatus = item.fulfilment.status;

  // STRICT STATE MACHINE
  const allowedTransitions = {
    pending: ["accepted", "cancelled"],
    accepted: ["processing", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered", "cancelled"],
    delivered: [], // Terminal state
    cancelled: [], // Terminal state
  };

  if (!allowedTransitions[currentStatus].includes(newStatus)) {
    throw new Error(
      `Invalid state transition: ${currentStatus} -> ${newStatus}`,
    );
  }

  // Validate extra requirements
  const now = new Date();

  if (newStatus === "shipped") {
    item.fulfilment.shippedAt = now;
  }

  if (newStatus === "delivered") {
    item.fulfilment.deliveredAt = now;
  }

  if (newStatus === "cancelled") {
    if (!meta.reason) throw new Error("Cancellation reason is required");
    item.fulfilment.cancelledAt = now;
    item.fulfilment.cancelReason = meta.reason;
  }

  item.fulfilment.status = newStatus;

  await order.save();
  return order;
};

/**
 * Handle Refund Decision
 */
export const handleRefundDecision = async (
  orderId,
  itemId,
  sellerId,
  decision,
  reason,
) => {
  const order = await Order.findOne({
    _id: orderId,
    "items._id": itemId,
    "items.seller": sellerId,
  });

  if (!order) {
    throw new Error("Order item not found or unauthorized");
  }

  const item = order.items.id(itemId);

  // Validation
  if (!item.refund.requested) {
    throw new Error("Refund has not been requested for this item");
  }

  if (item.refund.status !== "pending") {
    throw new Error("Refund decision already made");
  }

  if (!["approved", "denied"].includes(decision)) {
    throw new Error("Invalid decision. Must be 'approved' or 'denied'");
  }

  item.refund.status = decision;
  item.refund.decidedBy = "seller";
  item.refund.reason = reason; // Seller's response reason

  if (decision === "approved") {
    item.refund.refundedAt = new Date();
    // TRIGGER PAYMENT REFUND LOGIC HERE (Future Integration)
  }

  await order.save();
  return order;
};
