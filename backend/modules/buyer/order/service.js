import { Order, Payment, Product, Address, Cart } from "../../../models/model.js";
import crypto from "crypto";

/**
 * Create order from cart items or provided items
 */
export const createOrder = async (userId, shippingAddressId, items) => {
  // Verify shipping address exists and belongs to user
  const address = await Address.findOne({
    _id: shippingAddressId,
    user: userId,
    hidden: false,
  }).lean();

  if (!address) {
    throw new Error("Shipping address not found");
  }

  // Group items by seller
  const productIds = items.map(item => item.productId);
  const products = await Product.find({ _id: { $in: productIds } })
    .populate("seller", "name email phone")
    .lean();

  if (products.length !== items.length) {
    throw new Error("One or more products not found");
  }

  // Verify all products are available
  for (const product of products) {
    if (product.status !== "active" || !product.isApproved) {
      throw new Error(`Product "${product.title}" is not available for purchase`);
    }

    const item = items.find(i => i.productId.toString() === product._id.toString());
    if (item.quantity < product.minOrderQuantity) {
      throw new Error(`Minimum order quantity for "${product.title}" is ${product.minOrderQuantity}`);
    }
  }

  // Group by seller
  const ordersBySeller = {};
  
  for (const item of items) {
    const product = products.find(p => p._id.toString() === item.productId.toString());
    const sellerId = product.seller._id.toString();

    if (!ordersBySeller[sellerId]) {
      ordersBySeller[sellerId] = {
        sellerId: product.seller._id,
        sellerInfo: product.seller,
        items: [],
        subtotal: 0,
      };
    }

    const itemSubtotal = product.price * item.quantity;
    ordersBySeller[sellerId].items.push({
      productId: product._id,
      title: product.title,
      quantity: item.quantity,
      price: product.price,
      subtotal: itemSubtotal,
    });
    ordersBySeller[sellerId].subtotal += itemSubtotal;
  }

  // Create orders for each seller
  const createdOrders = [];

  for (const sellerOrder of Object.values(ordersBySeller)) {
    const tax = sellerOrder.subtotal * 0.18; // 18% GST
    const shippingCharges = 0; // Can be calculated based on logic
    const totalAmount = sellerOrder.subtotal + tax + shippingCharges;

    const order = await Order.create({
      buyerId: userId,
      sellerId: sellerOrder.sellerId,
      items: sellerOrder.items,
      subtotal: sellerOrder.subtotal,
      tax,
      shippingCharges,
      totalAmount,
      currency: "INR",
      status: "placed",
      paymentStatus: "pending",
      shippingAddress: shippingAddressId,
      placedAt: new Date(),
    });

    createdOrders.push(order);
  }

  // Clear cart after order creation
  await Cart.findOneAndUpdate(
    { user: userId },
    { $set: { items: [] } }
  );

  return createdOrders;
};

/**
 * Create Razorpay payment for order
 */
export const createPayment = async (orderId, userId) => {
  const order = await Order.findOne({ _id: orderId, buyerId: userId }).lean();

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.paymentStatus === "paid") {
    throw new Error("Order already paid");
  }

  // Generate Razorpay order ID (in production, use Razorpay SDK)
  const razorpayOrderId = `order_${crypto.randomBytes(12).toString("hex")}`;

  // Create payment record
  const payment = await Payment.create({
    orderId: order._id,
    buyerId: userId,
    razorpayOrderId,
    amount: order.totalAmount,
    currency: order.currency,
    status: "created",
  });

  return {
    payment,
    order,
    razorpayOrderId,
    amount: order.totalAmount,
    currency: order.currency,
  };
};

/**
 * Verify payment signature and update order
 */
export const verifyPayment = async (userId, razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  // Find payment
  const payment = await Payment.findOne({ razorpayOrderId, buyerId: userId });

  if (!payment) {
    throw new Error("Payment not found");
  }

  // Verify signature (in production, use Razorpay webhook secret)
  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET || "test_secret";
  const generatedSignature = crypto
    .createHmac("sha256", razorpaySecret)
    .update(razorpayOrderId + "|" + razorpayPaymentId)
    .digest("hex");

  if (generatedSignature !== razorpaySignature) {
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
    { new: true }
  )
    .populate("shippingAddress")
    .populate("buyerId", "name email phone")
    .populate("sellerId", "name email phone");

  return { payment, order };
};

/**
 * List orders with pagination and filters
 */
export const list = async (match, skip, limit, sort = { createdAt: -1 }) => {
  const [docs, totalCount] = await Promise.all([
    Order.find(match)
      .populate("shippingAddress")
      .populate("buyerId", "name email phone")
      .populate("sellerId", "name email phone")
      .populate("items.productId", "title images")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(match),
  ]);
  return { docs, totalCount };
};

/**
 * Get order by ID
 */
export const getById = async (id, userId) => {
  const order = await Order.findOne({ _id: id, buyerId: userId })
    .populate("shippingAddress")
    .populate("buyerId", "name email phone")
    .populate("sellerId", "name email phone")
    .populate("items.productId", "title images price")
    .lean();

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
  const order = await Order.findOne({ _id: id, buyerId: userId });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status === "delivered") {
    throw new Error("Cannot cancel delivered order");
  }

  if (order.status === "cancelled") {
    throw new Error("Order already cancelled");
  }

  if (order.paymentStatus === "paid") {
    // Initiate refund process
    const payment = await Payment.findOne({ orderId: id });
    if (payment) {
      payment.status = "refunded";
      payment.refundedAt = new Date();
      await payment.save();
    }

    order.paymentStatus = "refunded";
  }

  order.status = "cancelled";
  order.cancelledAt = new Date();
  await order.save();

  return await Order.findById(id)
    .populate("shippingAddress")
    .populate("buyerId", "name email phone")
    .populate("sellerId", "name email phone")
    .lean();
};

/**
 * Get order statistics
 */
export const getOrderStats = async (userId) => {
  const stats = await Order.aggregate([
    { $match: { buyerId: userId } },
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

  return stats[0] || {
    totalOrders: 0,
    totalSpent: 0,
    pendingPayments: 0,
    completedOrders: 0,
    cancelledOrders: 0,
  };
};
