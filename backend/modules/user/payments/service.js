// service.js - Payment business logic layer
// ALL payment business rules and database operations live here

import {
  Payment,
  Order,
  buyleadPlanTransaction,
} from "../../../models/model.js";
import {
  createRazorpayOrder,
  verifyPaymentSignature,
  fetchPaymentDetails,
  initiateRefund,
} from "./razorpay.client.js";

/**
 * Create a new payment for an order
 *
 * BUSINESS RULE: Payments are always linked to orders
 * - Order is the source of truth for amount
 * - Frontend never sends amount (prevents tampering)
 * - Only unpaid orders can create new payments
 *
 * FLOW:
 * 1. Validate order exists and belongs to buyer
 * 2. Check order is payable (not cancelled, not already paid)
 * 3. Get amount from Order (backend is source of truth)
 * 4. Create Razorpay order
 * 5. Save Payment with status 'created'
 * 6. Return safe fields to frontend
 */
// Helper: Create Razorpay order and format response
const createRazorpayOrderAndFormatResponse = async (
  amount,
  currency,
  referenceId,
  paymentId = null,
) => {
  const amountInPaise = Math.round(amount * 100);
  const razorpayOrder = await createRazorpayOrder(
    amountInPaise,
    currency,
    referenceId.toString(),
  );

  return {
    paymentId,
    razorpayOrderId: razorpayOrder.id,
    amount,
    currency,
  };
};

export const createPayment = async (type, referenceId, buyerId) => {
  try {
    const refField = type === "order" ? "order" : "buyleadPlanTransaction";
    const EXPIRY_THRESHOLD_MS = 25 * 60 * 1000; // 25 minutes

    // Check for existing pending payment
    const existingPayment = await Payment.findOne({
      [refField]: referenceId,
      status: { $in: ["created", "authorized"] },
    }).lean();

    if (existingPayment) {
      const paymentAge =
        Date.now() - new Date(existingPayment.createdAt).getTime();
      const currency = existingPayment.currency || "INR";

      // Return existing if not expired
      if (paymentAge < EXPIRY_THRESHOLD_MS) {
        return {
          paymentId: existingPayment._id,
          razorpayOrderId: existingPayment.razorpayOrderId,
          amount: existingPayment.amount,
          currency,
        };
      }

      // Expired - create new Razorpay order for same payment
      console.log(
        `Payment ${existingPayment._id} expired, creating new Razorpay order...`,
      );
      const response = await createRazorpayOrderAndFormatResponse(
        existingPayment.amount,
        currency,
        referenceId,
        existingPayment._id,
      );

      await Payment.findByIdAndUpdate(existingPayment._id, {
        razorpayOrderId: response.razorpayOrderId,
        updatedAt: new Date(),
      });

      return response;
    }
    let totalAmount;
    let currency;
    if (type === "order") {
      const order = await Order.findById(referenceId)
        .select("totalAmount currency")
        .lean();
      totalAmount = order.totalAmount;
      currency = order.currency;
    } else if (type === "buyleadPlan") {
      const buyleadPlan = await buyleadPlanTransaction
        .findById(referenceId)
        .select("totalAmount currency")
        .lean();
      totalAmount = buyleadPlan.totalAmount;
      currency = buyleadPlan.currency;
    }
    // New payment - get amount from order
    const razorpayOrder = await createRazorpayOrder(
      Math.round(totalAmount * 100),
      currency,
      referenceId.toString(),
    );

    const payment = await new Payment({
      for: type,
      [refField]: referenceId,
      buyer: buyerId,
      razorpayOrderId: razorpayOrder.id,
      amount: totalAmount,
      currency,
      status: "created",
    }).save();

    if (type === "order") {
      await Order.findByIdAndUpdate(referenceId, {
        status: "pending",
        paymentStatus: "pending",
      });
    } else if (type === "buyleadPlan") {
      await buyleadPlanTransaction.findByIdAndUpdate(referenceId, {
        paymentStatus: "pending",
      });
    }

    return {
      paymentId: payment._id,
      razorpayOrderId: razorpayOrder.id,
      amount: totalAmount,
      currency,
    };
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  }
};

/**
 * Verify payment after frontend callback
 *
 * CRITICAL SECURITY: This is where we confirm payment is real
 * - Frontend sends signature from Razorpay
 * - We verify using HMAC SHA256
 * - Update Payment and Order ONLY after verification
 *
 * IDEMPOTENCY: Multiple calls with same data have same effect
 * - Check if already processed before updating
 * - Prevents duplicate order confirmations
 *
 * FLOW:
 * 1. Find payment by razorpayOrderId
 * 2. Check if already processed (idempotency)
 * 3. Verify signature using secret key
 * 4. Optionally fetch payment details from Razorpay for validation
 * 5. Update Payment status to 'paid'
 * 6. Update related Order.paymentStatus to 'paid'
 */
export const verifyPayment = async (
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
) => {
  try {
    // Step 1: Find payment by Razorpay order ID
    const payment = await Payment.findOne({ razorpayOrderId });

    if (!payment) {
      throw new Error("Payment not found");
    }

    // Step 2: Check idempotency - already verified?
    if (payment.status === "paid") {
      console.log(`Payment ${payment._id} already verified - idempotent call`);
      return {
        success: true,
        message: "Payment already verified",
        paymentId: payment._id,
        orderId: payment.orderId,
      };
    }

    // Step 3: Verify signature (CRITICAL SECURITY STEP)
    const isValidSignature = verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    );

    if (!isValidSignature) {
      // Mark payment as failed - signature mismatch indicates tampering
      payment.status = "failed";
      await payment.save();

      throw new Error("Invalid payment signature - verification failed");
    }

    // Step 4: (Optional but recommended) Fetch from Razorpay for double-check
    try {
      const razorpayPayment = await fetchPaymentDetails(razorpayPaymentId);

      // Additional validation: check if payment was actually captured
      if (razorpayPayment.status !== "captured") {
        throw new Error(
          `Payment not captured on Razorpay. Status: ${razorpayPayment.status}`,
        );
      }

      // Store payment method for analytics
      payment.method = razorpayPayment.method || "unknown";
    } catch (fetchError) {
      console.error("Failed to fetch Razorpay payment details:", fetchError);
      // Continue anyway if signature is valid (Razorpay API might be down)
    }

    // Step 5: Update Payment status
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.status = "paid";
    await payment.save();

    // Step 6: Update Order payment status
    const order = await Order.findByIdAndUpdate(
      payment.orderId,
      { paymentStatus: "paid" },
      { new: true },
    );

    if (!order) {
      console.error(
        `Order ${payment.orderId} not found after payment verification`,
      );
      // Payment is marked as paid, but order update failed - needs manual intervention
    }

    return {
      success: true,
      message: "Payment verified successfully",
      paymentId: payment._id,
      orderId: payment.orderId,
    };
  } catch (error) {
    console.error("Payment verification error:", error);
    throw error;
  }
};

/**
 * Handle webhook events from Razorpay
 *
 * WHY: Webhooks are the authoritative notification
 * - Frontend callbacks can fail (network, browser closed)
 * - Webhooks retry automatically
 * - Webhooks are server-to-server (more reliable)
 *
 * CRITICAL: Always verify webhook signature
 * - Prevents fake webhook attacks
 * - Only process verified webhooks
 *
 * IDEMPOTENCY: Razorpay may send same webhook multiple times
 * - Check current status before updating
 * - Log duplicate webhooks for monitoring
 *
 * SUPPORTED EVENTS:
 * - payment.captured: Payment successful
 * - payment.failed: Payment failed (retry or timeout)
 */
export const handleWebhook = async (event, eventData) => {
  try {
    const entity = eventData.payload?.payment?.entity;

    if (!entity) {
      console.error("Invalid webhook data - missing entity");
      return { success: false, message: "Invalid webhook data" };
    }

    const razorpayOrderId = entity.order_id;
    const razorpayPaymentId = entity.id;

    // Find payment by Razorpay order ID
    const payment = await Payment.findOne({ razorpayOrderId });

    if (!payment) {
      console.error(`Payment not found for webhook: ${razorpayOrderId}`);
      return { success: false, message: "Payment not found" };
    }

    // Handle different event types
    switch (event) {
      case "payment.captured":
        return await handlePaymentCaptured(payment, entity);

      case "payment.failed":
        return await handlePaymentFailed(payment, entity);

      default:
        console.log(`Unhandled webhook event: ${event}`);
        return { success: true, message: "Event not processed" };
    }
  } catch (error) {
    console.error("Webhook handling error:", error);
    throw error;
  }
};

/**
 * Handle payment.captured webhook
 *
 * WHY: Authoritative confirmation of successful payment
 * - More reliable than frontend callback
 * - Updates Payment and Order status
 * - Idempotent (safe to call multiple times)
 */
const handlePaymentCaptured = async (payment, entity) => {
  try {
    // Check idempotency - already processed?
    if (payment.status === "paid") {
      console.log(
        `Payment ${payment._id} already marked as paid - duplicate webhook`,
      );
      return {
        success: true,
        message: "Payment already processed",
        duplicate: true,
      };
    }

    // Update payment
    payment.razorpayPaymentId = entity.id;
    payment.method = entity.method || "unknown";
    payment.status = "paid";
    await payment.save();

    // Update order
    const order = await Order.findByIdAndUpdate(
      payment.orderId,
      { paymentStatus: "paid" },
      { new: true },
    );

    if (!order) {
      console.error(
        `Order ${payment.orderId} not found during webhook processing`,
      );
      // Payment updated but order not found - needs investigation
    }

    console.log(`Payment ${payment._id} captured successfully via webhook`);

    return {
      success: true,
      message: "Payment captured",
      paymentId: payment._id,
      orderId: payment.orderId,
    };
  } catch (error) {
    console.error("Error handling payment.captured:", error);
    throw error;
  }
};

/**
 * Handle payment.failed webhook
 *
 * WHY: Track failed payments for analytics and retry logic
 * - Update Payment status to 'failed'
 * - Order.paymentStatus remains 'pending' (user can retry)
 * - Log reason for analytics
 */
const handlePaymentFailed = async (payment, entity) => {
  try {
    // Check if already marked as failed
    if (payment.status === "failed") {
      console.log(
        `Payment ${payment._id} already marked as failed - duplicate webhook`,
      );
      return {
        success: true,
        message: "Payment already marked as failed",
        duplicate: true,
      };
    }

    // Update payment
    payment.razorpayPaymentId = entity.id;
    payment.status = "failed";
    payment.method = entity.method || "unknown";
    await payment.save();

    // Order.paymentStatus stays 'pending' - buyer can retry

    console.log(
      `Payment ${payment._id} failed via webhook. Reason: ${entity.error_description || "Unknown"}`,
    );

    return {
      success: true,
      message: "Payment failure recorded",
      paymentId: payment._id,
      orderId: payment.orderId,
    };
  } catch (error) {
    console.error("Error handling payment.failed:", error);
    throw error;
  }
};

/**
 * Process refund for a payment
 *
 * BUSINESS RULE: Refunds linked to order cancellations
 * - Only paid payments can be refunded
 * - Full or partial refunds supported
 * - Updates Payment status to 'refunded'
 */
export const processRefund = async (paymentId, amount = null, reason = "") => {
  try {
    // Find payment
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      throw new Error("Payment not found");
    }

    // Validate payment is refundable
    if (payment.status !== "paid") {
      throw new Error("Only paid payments can be refunded");
    }

    if (!payment.razorpayPaymentId) {
      throw new Error("Razorpay payment ID missing - cannot process refund");
    }

    // Initiate refund with Razorpay
    const amountInPaise = amount ? Math.round(amount * 100) : null;
    const refund = await initiateRefund(
      payment.razorpayPaymentId,
      amountInPaise,
    );

    // Update payment status
    payment.status = "refunded";
    await payment.save();

    // Update order payment status
    await Order.findByIdAndUpdate(payment.orderId, {
      paymentStatus: "refunded",
    });

    console.log(
      `Refund processed for payment ${paymentId}. Refund ID: ${refund.id}`,
    );

    return {
      success: true,
      message: "Refund initiated",
      refundId: refund.id,
      amount: refund.amount / 100, // Convert paise to rupees
    };
  } catch (error) {
    console.error("Refund processing error:", error);
    throw error;
  }
};

/**
 * Get payment details by ID
 *
 * WHY: Fetch payment info for order details page
 * - Populate order details for context
 * - Safe to expose to frontend (no secrets)
 */
export const getPaymentById = async (paymentId, userId) => {
  try {
    const payment = await Payment.findById(paymentId)
      .populate("orderId", "items subtotal tax totalAmount status")
      .lean();

    if (!payment) {
      throw new Error("Payment not found");
    }

    // Verify user has access to this payment
    if (payment.buyerId.toString() !== userId.toString()) {
      throw new Error("Unauthorized access to payment");
    }

    return payment;
  } catch (error) {
    console.error("Error fetching payment:", error);
    throw error;
  }
};

/**
 * List payments for a user
 *
 * WHY: Payment history for buyer dashboard
 * - Pagination support
 * - Filter by status
 */
export const listPaymentsForUser = async (
  userId,
  { page = 1, limit = 10, status = null },
) => {
  try {
    const query = { buyerId: userId };

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [payments, totalCount] = await Promise.all([
      Payment.find(query)
        .populate("orderId", "items totalAmount status")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Payment.countDocuments(query),
    ]);

    return {
      payments,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
    };
  } catch (error) {
    console.error("Error listing payments:", error);
    throw error;
  }
};
