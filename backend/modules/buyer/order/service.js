import {
  Order,
  Payment,
  Product,
  Address,
  Cart,
} from "../../../models/model.js";
import {
  createRazorpayOrder,
  verifyPaymentSignature,
  initiateRefund,
} from "../../user/payments/razorpay.client.js";
import { createPayment } from "../../user/payments/service.js";
import mongoose from "mongoose";

// ============ ORDER ID HELPERS ============

/**
 * Check if string is a valid MongoDB ObjectId
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Build flexible order query that supports both MongoDB _id and readableId
 */
const buildOrderQuery = (id, userId) => {
  const baseQuery = { buyer: userId };

  if (isValidObjectId(id)) {
    return { ...baseQuery, _id: id };
  }

  // Support both with and without # prefix
  const cleanId = id.startsWith("#") ? id : id;
  return { ...baseQuery, readableId: cleanId };
};

// ============ SUPPORT CALCULATION HELPERS ============

/**
 * Calculate freight support based on product's support config and quantity
 */
const calculateFreightSupport = (product, quantity) => {
  if (!product.support?.freight) return 0;
  const { type, amount, slabs } = product.support.freight;
  if (type === "single") return amount || 0;
  if (type === "slab" && slabs?.length) {
    const sorted = [...slabs].sort((a, b) => b.minQty - a.minQty);
    const match = sorted.find((s) => quantity >= s.minQty);
    return match?.amount || 0;
  }
  return 0;
};

/**
 * Calculate payment fee support (percent of subtotal)
 */
const calculatePaymentFeeSupport = (product, quantity, subtotal) => {
  if (!product.support?.paymentFee) return 0;
  const { type, percent, slabs } = product.support.paymentFee;
  if (type === "single") return (subtotal * (percent || 0)) / 100;
  if (type === "slab" && slabs?.length) {
    const sorted = [...slabs].sort((a, b) => b.minQty - a.minQty);
    const match = sorted.find((s) => quantity >= s.minQty);
    return match ? (subtotal * (match.percent || 0)) / 100 : 0;
  }
  return 0;
};

/**
 * Get unit price for quantity based on slab pricing
 */
const getUnitPrice = (product, quantity) => {
  if (!product.price) return 0;
  if (product.price.type === "single") return product.price.singlePrice || 0;
  if (product.price.type === "slab" && product.price.slabs?.length) {
    const sorted = [...product.price.slabs].sort(
      (a, b) => b.minQuantity - a.minQuantity,
    );
    const match = sorted.find((s) => quantity >= s.minQuantity);
    return match?.price || product.price.slabs[0]?.price || 0;
  }
  return 0;
};

// ============ ORDER SERVICE ============

/**
 * Create order from cart items or provided items
 */
export const createOrder = async (userId, cartCheckout, items) => {
  if (!items || items.length === 0) {
    throw new Error("No items to order");
  }

  // Fetch all products with required fields
  const productIds = items.map((item) => item.product);
  const products = await Product.find({ _id: { $in: productIds } })
    .select(
      "title price support taxPercent stock moderation isActive isOrder seller",
    )
    .populate("seller", "name email phone")
    .lean();

  if (products.length !== items.length) {
    throw new Error("One or more products not found");
  }

  // Validate products
  const unavailableProducts = [];
  const moqRequiredProducts = [];
  const insufficientStockProducts = [];

  for (const item of items) {
    const itemProductId = item.product.toString();
    const product = products.find((p) => p._id.toString() === itemProductId);

    if (!product) {
      throw new Error("Product not found");
    }

    if (
      product.moderation?.status !== "approved" ||
      !product.isActive ||
      !product.isOrder
    ) {
      unavailableProducts.push({ _id: product._id, title: product.title });
    } else if (item.quantity < (product.price?.moq || 1)) {
      moqRequiredProducts.push({
        _id: product._id,
        title: product.title,
        quantity: item.quantity,
        moq: product.price?.moq || 1,
      });
    } else if ((product.stock || 0) < item.quantity) {
      insufficientStockProducts.push({
        _id: product._id,
        title: product.title,
        quantity: item.quantity,
        stock: product.stock || 0,
      });
    }
  }

  if (unavailableProducts.length > 0) {
    throw new Error(
      `Products not available: ${unavailableProducts.map((p) => p.title).join(", ")}`,
    );
  }
  if (moqRequiredProducts.length > 0) {
    throw new Error(
      `Minimum order quantity not met for: ${moqRequiredProducts.map((p) => `${p.title} (min: ${p.moq})`).join(", ")}`,
    );
  }
  if (insufficientStockProducts.length > 0) {
    throw new Error(
      `Insufficient stock for: ${insufficientStockProducts.map((p) => `${p.title} (available: ${p.stock})`).join(", ")}`,
    );
  }

  // Generate readable order ID
  const now = new Date();
  const year = now.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year + 1, 0, 1);

  // Find last order number for this year to increment
  const lastOrder = await Order.findOne({
    readableId: { $regex: `^ORD-${year}-` },
  })
    .sort({ createdAt: -1 })
    .select("readableId");

  let nextSequence = 1;
  if (lastOrder && lastOrder.readableId) {
    const parts = lastOrder.readableId.split("-");
    const lastNum = parseInt(parts[2], 10);
    if (!isNaN(lastNum)) {
      nextSequence = lastNum + 1;
    }
  }

  const readableId = `ORD-${year}-${String(nextSequence).padStart(4, "0")}`;

  // Build order items with seller info (multi-seller order)
  const orderItems = [];
  let subtotal = 0;
  let totalFreightSupport = 0;
  let totalPaymentFeeSupport = 0;

  for (const item of items) {
    const itemProductId = item.product.toString();
    const product = products.find((p) => p._id.toString() === itemProductId);

    const dispatchTimeDays = product.dispatchTimeDays || 2;
    const expectedDispatchAt = new Date();
    expectedDispatchAt.setDate(expectedDispatchAt.getDate() + dispatchTimeDays);

    orderItems.push({
      productId: product._id,
      seller: product.seller._id,
      title: product.title,
      quantity: item.quantity,
      price: unitPrice,
      subtotal: itemSubtotal,
      freightSupport,
      paymentFeeSupport,
      fulfilment: {
        status: "pending",
        dispatchTimeDays,
        expectedDispatchAt,
      },
    });

    subtotal += itemSubtotal;
    totalFreightSupport += freightSupport;
    totalPaymentFeeSupport += paymentFeeSupport;
  }

  // Calculate totals
  const tax = Math.round(subtotal * 0.18 * 100) / 100; // 18% GST
  const totalAmount =
    subtotal + tax - totalFreightSupport - totalPaymentFeeSupport;

  // Create single order with all items
  const order = await Order.create({
    buyer: userId,
    items: orderItems,
    subtotal,
    tax,
    totalFreightSupport,
    totalPaymentFeeSupport,
    totalAmount: Math.max(0, totalAmount),
    currency: "INR",
    // status: "hidden", // REMOVED: Derived from items
    paymentStatus: "pending",
    placedAt: new Date(),
    readableId: readableId,
  });

  // Clear cart after order creation if cart checkout
  if (cartCheckout) {
    await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });
  }

  return order;
};
/**
 * Add shipping address to order
 */
export const addShippingAddressToOrder = async (
  orderId,
  shippingAddressId,
  userId,
) => {
  const order = await Order.findOne(buildOrderQuery(orderId, userId)).lean();
  if (!order) {
    throw new Error("Order not found");
  }
  // Verify shipping address exists and belongs to user
  const address = await Address.findOne({
    _id: shippingAddressId,
    user: userId,
    hidden: false,
  }).lean();

  if (!address) {
    throw new Error("Shipping address not found");
  }
  await Order.updateOne(
    { _id: order._id },
    {
      $set: {
        shippingAddress: {
          name: address.name,
          phone: address.phone,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          landmark: address.landmark,
          pincode: address.pincode,
          city: address.city,
          state: address.state,
          country: address.country || "India",
        },
      },
    },
  );
};

/**
 * Create Razorpay payment for order
 */
export const createPaymentForOrder = async (orderId, userId) => {
  const order = await Order.findOne(buildOrderQuery(orderId, userId)).lean();

  // Check if order exists
  if (!order) {
    throw new Error("Order not found");
  }

  // Check if order is already paid
  if (order.paymentStatus === "paid") {
    throw new Error("Order already paid");
  }

  // Check if order is cancelled
  if (order.status === "cancelled") {
    throw new Error("Cannot create payment for cancelled order");
  }

  const payment = await createPayment("order", order._id, userId);

  return {
    ...payment,
    order,
    razorpayKey: process.env.RAZORPAY_KEY_ID,
  };
};

/**
 * Verify payment signature and update order
 */
export const verifyPayment = async (
  userId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
) => {
  // Find payment
  const payment = await Payment.findOne({ razorpayOrderId, buyerId: userId });

  if (!payment) {
    throw new Error("Payment not found");
  }

  // Verify signature
  const isValid = verifyPaymentSignature(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  );

  if (!isValid) {
    // Mark payment as failed
    payment.status = "failed";
    payment.failedAt = new Date();
    await payment.save();

    throw new Error("Invalid payment signature");
  }

  // Update payment
  payment.razorpayPaymentId = razorpayPaymentId;
  payment.status = "paid";
  payment.paidAt = new Date();
  await payment.save();

  // Update order
  const order = await Order.findByIdAndUpdate(
    payment.orderId,
    {
      $set: {
        paymentStatus: "paid",
      },
    },
    { new: true },
  ).populate("buyer", "name email phone");

  return { payment, order };
};

/**
 * Process demo payment (for testing and portfolio demonstration)
 * Allows user-controlled payment simulation with explicit consent
 */
export const processDemoPayment = async (orderId, userId, status) => {
  const order = await Order.findOne(buildOrderQuery(orderId, userId));

  if (!order) {
    throw new Error("Order not found");
  }

  if (status === "SUCCESS") {
    // Mark order as paid
    order.paymentStatus = "paid";
    // order.status = "pending"; // REMOVED: Derived status logic handles this (items are pending by default)

    // Create demo payment record for audit trail
    await Payment.create({
      for: "order",
      order: order._id,
      buyer: userId,
      razorpayOrderId: `demo_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      amount: order.totalAmount,
      currency: order.currency || "INR",
      status: "paid",
      method: "demo-simulated",
    });

    await order.save();
  } else if (status === "FAILED") {
    // Mark payment as failed
    order.paymentStatus = "failed";
    await order.save();
  }

  return {
    order,
    demoMode: true,
    status: status.toLowerCase(),
  };
};

/**
 * List orders with pagination and filters
 */
/**
 * List orders with unified view (Orders vs Returns)
 * Uses aggregation to filter items and derive summary
 */
export const listOrders = async (userId, query = {}) => {
  const { view = "orders", status, page = 1, limit = 10 } = query;
  const skip = (page - 1) * limit;

  // 1. Match Stage: Filter orders that belong to user and have relevant items
  const matchStage = {
    buyer: userId,
    paymentStatus: { $ne: "pending" }, // Only show placed orders (paid/failed/etc)
  };

  // 2. Filter items based on View
  // view=orders -> items where refund.requested = false
  // view=returns -> items where refund.requested = true OR refund.status != pending
  let itemFilter = {};
  if (view === "returns") {
    itemFilter = {
      $or: [
        { "refund.requested": true },
        { "refund.status": { $ne: "pending" } }, // In case manually set without request
      ],
    };
  } else {
    // view=orders
    itemFilter = { "refund.requested": false };
  }

  // 3. Status Filter (Contextual)
  // If status is provided, we might need to filter items further or filter orders based on derived status
  // For simplicity and performance, we filter items by status if item-level status matches.
  // BUT the requirement says "Switching tabs... Primary Filters... Secondary Filters".
  // Secondary filters for Orders: All, Preparing, Shipped, Delivered.
  // These map to fulfilment.status.

  if (status && status !== "active" && status !== "all") {
    // 'active' is simplified legacy
    if (view === "orders") {
      // Map UI status to backend fulfilment status
      // "Being prepared" -> accepted, processing
      if (status === "preparing") {
        itemFilter["fulfilment.status"] = { $in: ["accepted", "processing"] };
      } else if (status === "shipped") {
        itemFilter["fulfilment.status"] = "shipped";
      } else if (status === "delivered") {
        itemFilter["fulfilment.status"] = "delivered";
      }
    } else {
      // view=returns
      // Refund requested, Approved, Denied, Refunded
      if (status === "refund_requested") {
        itemFilter["refund.status"] = "pending";
      } else if (status === "approved") {
        itemFilter["refund.status"] = "approved";
      } else if (status === "denied") {
        itemFilter["refund.status"] = "denied";
      } else if (status === "refunded") {
        itemFilter["refund.status"] = "refunded"; // Assuming final resolved state
      }
    }
  }

  const pipeline = [
    { $match: matchStage },
    { $sort: { placedAt: -1 } },
    {
      $project: {
        readableId: 1,
        placedAt: 1,
        totalAmount: 1, // Order total, maybe re-sum items? user wants container.
        currency: 1,
        paymentStatus: 1,
        shippingAddress: 1,
        items: {
          $filter: {
            input: "$items",
            as: "item",
            cond: {
              // Complex condition matching itemFilter
              // Since mongoDB $filter cond is not standard query obj, we construct it.
              // Simplification: We do the filtering logic here manually or use build-in operators
              // Actually using $filter with mongo operators is best.

              // Let's rely on the fact that we can construct boolean logic.
              $and: [
                // View logic
                view === "returns"
                  ? {
                      $or: [
                        { $eq: ["$$item.refund.requested", true] },
                        { $ne: ["$$item.refund.status", "pending"] },
                      ],
                    }
                  : { $eq: ["$$item.refund.requested", false] },
              ],
            },
          },
        },
      },
    },
    // Remove orders with no matching items (empty filtered items)
    { $match: { items: { $not: { $size: 0 } } } },
  ];

  // Apply specific status filters using $map or just code logic?
  // It is hard to dynamically inject strict mongo filters into $filter operator above without complex builders.
  // Strategy: Get Filtered items (Orders or Returns) first, THEN apply status filter in next stage?
  // OR: If status filter is simple, inject it into the $filter condition.

  // Refined Strategy:
  // 1. Filter items by View Type ONLY in $project
  // 2. Match stage to remove empty orders
  // 3. If specific status provided, Filter items AGAIN or Match orders?
  // Requirement: "Filters MUST be driven by backend enums."

  // Implementation note: The above pipeline logic handles View.
  // Status filtering is tricky in aggregation if we want to return the Order container BUT only with matching items.
  // If I search "Shipped", do I show the order if it has 1 shipped item and 1 pending?
  // Amazon style: You show the order, and maybe only the relevant items or all items?
  // Requirement: "Returns are a VIEW over items".
  // "Switching tabs does NOT refetch different entities. It only changes backend query mode."

  // Let's perform status filtering INSIDE the $filter if possible, or post-process.
  // Given strict requirements and "no split mental model", let's return the order if ANY item matches the filter,
  // AND return ONLY the matching items to reduce noise?
  // "Orders = items where refund.requested = false".

  // Detailed implementation of the items $filter condition:
  const viewCondition =
    view === "returns"
      ? {
          $or: [
            { $eq: ["$$item.refund.requested", true] },
            { $ne: ["$$item.refund.status", "pending"] },
          ],
        } // refund.status default is pending? schema says default pending. logic: requested=true OR status!=pending (meaning decided)
      : { $eq: ["$$item.refund.requested", false] };

  // Status conditions
  let statusCondition = {};
  if (status && status !== "all") {
    if (view === "orders") {
      if (status === "preparing")
        statusCondition = {
          $in: ["$$item.fulfilment.status", ["accepted", "processing"]],
        };
      else if (status === "shipped")
        statusCondition = { $eq: ["$$item.fulfilment.status", "shipped"] };
      else if (status === "delivered")
        statusCondition = { $eq: ["$$item.fulfilment.status", "delivered"] };
    } else {
      if (status === "refund_requested")
        statusCondition = { $eq: ["$$item.refund.status", "pending"] };
      else if (status === "approved")
        statusCondition = { $eq: ["$$item.refund.status", "approved"] };
      else if (status === "denied")
        statusCondition = { $eq: ["$$item.refund.status", "denied"] };
    }
  }

  // Combine conditions
  const finalItemCondition =
    Object.keys(statusCondition).length > 0
      ? { $and: [viewCondition, statusCondition] }
      : viewCondition;

  const finalPipeline = [
    { $match: matchStage },
    { $sort: { placedAt: -1 } },
    {
      $project: {
        readableId: 1,
        placedAt: 1,
        totalAmount: 1,
        currency: 1,
        paymentStatus: 1,
        items: {
          $filter: {
            input: "$items",
            as: "item",
            cond: finalItemCondition,
          },
        },
      },
    },
    { $match: { "items.0": { $exists: true } } }, // Filter out orders with no items after filtering
    { $skip: skip },
    { $limit: parseInt(limit) },
  ];

  const docs = await Order.aggregate(finalPipeline);

  // Populate details
  await Order.populate(docs, {
    path: "items.productId",
    select: "title images price",
  });
  await Order.populate(docs, { path: "items.seller", select: "name" });

  // Post-process to add summary (Derived logic as per requirements)
  // "Return derived summaries per order"
  const payload = docs.map((order) => {
    // Calculate summary for THIS view subset of items
    const counts = {
      pending: 0,
      accepted: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    let activeItems = 0;

    order.items.forEach((item) => {
      if (item.fulfilment?.status) {
        counts[item.fulfilment.status] =
          (counts[item.fulfilment.status] || 0) + 1;
        if (item.fulfilment.status !== "cancelled") activeItems++;
      }
    });

    // Determine primary status for card
    let primaryStatus = "placed";
    if (counts.delivered === activeItems && activeItems > 0)
      primaryStatus = "delivered";
    else if (counts.shipped > 0)
      primaryStatus = "shipped"; // simplified
    else if (counts.processing > 0) primaryStatus = "preparing";

    // If View=Returns, summary should be about Refunds?
    // "Return card shows... Refund status badge"
    // If order has multiple returns, what is the status?
    // Requirement: "Group under same order card... Clearly separate per-item refund state"
    // So the Order Status might still be relevant context, OR we show "Return Requested" if any?
    // Let's stick to the Order Summary schema but maybe the frontend selects what to show.
    // Backend just returns the truth.

    return {
      ...order,
      summary: {
        status: primaryStatus,
        counts,
        activeItems,
      },
    };
  });

  // Get Total Count (separate query for pagination)
  // This is expensive with aggregation. For now, approximate or run count agg.
  // Optimization: Just return docs for now, or run secondary count.
  const countPipeline = [
    { $match: matchStage },
    {
      $project: {
        items: {
          $filter: { input: "$items", as: "item", cond: finalItemCondition },
        },
      },
    },
    { $match: { "items.0": { $exists: true } } },
    { $count: "total" },
  ];
  const countResult = await Order.aggregate(countPipeline);
  const totalCount = countResult[0]?.total || 0;

  return { docs: payload, totalCount };
};

/**
 * Get order by ID
 */
export const getById = async (id, userId) => {
  const order = await Order.findOne(buildOrderQuery(id, userId))
    .populate("buyer", "name email phone")
    .populate("items.seller", "name email phone")
    .populate("items.productId", "title images price"); // Removed .lean() to keep virtuals

  if (!order) {
    return null;
  }

  // Get payment details
  const payment = await Payment.findOne({ orderId: id }).lean();

  return { order, payment };
};

/**
 * Cancel order
 */
export const cancelOrder = async (id, userId, reason) => {
  const order = await Order.findOne(buildOrderQuery(id, userId));

  if (!order) {
    throw new Error("Order not found");
  }

  const summary = order.summary; // Virtual

  if (summary.status === "delivered") {
    throw new Error("Cannot cancel delivered order");
  }

  if (summary.status === "cancelled") {
    throw new Error("Order already cancelled");
  }

  // If order is paid, initiate refund
  if (order.paymentStatus === "paid") {
    const payment = await Payment.findOne({ orderId: id, status: "paid" });

    if (payment && payment.razorpayPaymentId) {
      // Initiate Razorpay refund
      await initiateRefund(payment.razorpayPaymentId);

      payment.status = "refunded";
      payment.refundedAt = new Date();
      await payment.save();

      order.paymentStatus = "refunded";
    }
  }

  // Cancel all items (since this is an order-level cancellation)
  const now = new Date();
  order.items.forEach((item) => {
    if (
      item.fulfilment.status !== "delivered" &&
      item.fulfilment.status !== "cancelled"
    ) {
      item.fulfilment.status = "cancelled";
      item.fulfilment.cancelledAt = now;
      item.fulfilment.cancelReason = reason || "Order cancelled by buyer";
    }
  });

  // order.status = "cancelled"; // REMOVED: Derived
  // order.cancelledAt = new Date(); // REMOVED: Derived
  await order.save();

  return await Order.findById(id)
    .populate("buyer", "name email phone")
    .populate("items.seller", "name email phone")
    .lean();
};

/**
 * Get order statistics
 */
export const getOrderStats = async (userId) => {
  const stats = await Order.aggregate([
    { $match: { buyer: userId } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: "$totalAmount" },
        pendingPayments: {
          $sum: { $cond: [{ $eq: ["$paymentStatus", "pending"] }, 1, 0] },
        },
        completedOrders: {
          $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] },
        },
        cancelledOrders: {
          $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
        },
      },
    },
  ]);

  return (
    stats[0] || {
      totalOrders: 0,
      totalSpent: 0,
      pendingPayments: 0,
      completedOrders: 0,
      cancelledOrders: 0,
    }
  );
};

/**
 * Request refund for a specific item
 */
export const requestRefund = async (orderId, itemId, userId, reason) => {
  const order = await Order.findOne(buildOrderQuery(orderId, userId));

  if (!order) {
    throw new Error("Order not found");
  }

  const item = order.items.id(itemId);
  if (!item) {
    throw new Error("Item not found in order");
  }

  if (item.refund.requested) {
    throw new Error("Refund already requested for this item");
  }

  // Business Rule: If cancelled, cannot refund (it's cancelled).
  if (item.fulfilment.status === "cancelled") {
    throw new Error("Cannot request refund for cancelled item");
  }

  // Update item
  item.refund.requested = true;
  item.refund.status = "pending";
  item.refund.reason = reason;
  item.refund.decidedBy = "none"; // reset/default

  await order.save();

  // Return updated order with populated fields (consistent with getById)
  // We need to re-fetch or populate manually to ensure frontend gets full picture immediately
  return await Order.findById(order._id)
    .populate("buyer", "name email phone")
    .populate("items.seller", "name email phone")
    .populate("items.productId", "title images price");
};
