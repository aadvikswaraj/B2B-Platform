// razorpay.client.js - Razorpay SDK wrapper for payment operations
// This module provides a clean interface to Razorpay APIs with proper error handling

import Razorpay from "razorpay";
import crypto from "crypto";

// Initialize Razorpay instance with credentials from environment
// CRITICAL: Never expose these keys to frontend
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create a Razorpay order for payment collection
 *
 * WHY: Backend creates orders to ensure amount integrity
 * - Frontend never determines the payment amount
 * - Order amount is calculated from database (Order model)
 * - Prevents tampering with payment amounts
 */
export const createRazorpayOrder = async (amount, currency, orderId) => {
  try {
    // Validate inputs
    if (!amount || amount <= 0) {
      throw new Error("Invalid amount for Razorpay order");
    }

    if (!currency) {
      throw new Error("Currency is required");
    }

    // Create order with Razorpay
    // notes field stores our internal order reference for reconciliation
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount), // Amount in smallest unit (paise)
      currency: currency.toUpperCase(),
      receipt: orderId, // Our order ID for tracking
      notes: {
        orderId: orderId, // Additional reference in notes
      },
    });

    return razorpayOrder;
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    throw new Error(`Failed to create Razorpay order: ${error.message}`);
  }
};

/**
 * Verify payment signature from frontend callback
 *
 * WHY: Frontend success callback can be spoofed - NEVER trust it alone
 * - Razorpay signs responses with HMAC-SHA256
 * - Only backend knows the secret key
 * - Signature verification proves payment is genuine
 *
 * Security: This is the PRIMARY defense against fake payment confirmations
 */
export const verifyPaymentSignature = (
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
) => {
  try {
    // Construct the message that was signed
    // Format: order_id|payment_id
    const message = `${razorpayOrderId}|${razorpayPaymentId}`;

    // Generate expected signature using our secret
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(message)
      .digest("hex");

    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(generatedSignature),
      Buffer.from(razorpaySignature),
    );
  } catch (error) {
    console.error("Signature verification failed:", error);
    return false;
  }
};

/**
 * Verify webhook signature from Razorpay
 *
 * WHY: Webhooks are server-to-server, but still need verification
 * - Prevents attackers from sending fake webhook events
 * - Razorpay sends X-Razorpay-Signature header
 * - Signature is HMAC of entire webhook body
 *
 * Security: MANDATORY for production - reject unsigned webhooks
 */
export const verifyWebhookSignature = (webhookBody, webhookSignature) => {
  try {
    // Use webhook secret (different from API secret)
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET not configured");
      return false;
    }

    // Generate expected signature
    const generatedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(webhookBody)
      .digest("hex");

    // Constant-time comparison
    return crypto.timingSafeEqual(
      Buffer.from(generatedSignature),
      Buffer.from(webhookSignature),
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return false;
  }
};

/**
 * Fetch payment details from Razorpay
 *
 * WHY: Get authoritative payment status from Razorpay
 * - Used during verification for additional validation
 * - Useful for reconciliation and debugging
 */
export const fetchPaymentDetails = async (paymentId) => {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error("Failed to fetch payment details:", error);
    throw new Error(`Failed to fetch payment: ${error.message}`);
  }
};

/**
 * Initiate refund for a payment
 *
 * WHY: Refunds for cancellations or disputes
 * - Only captured/settled payments can be refunded
 * - Razorpay handles actual money movement
 */
export const initiateRefund = async (paymentId, amount = null) => {
  try {
    const refundData = {};
    if (amount) {
      refundData.amount = Math.round(amount); // Amount in smallest unit
    }

    const refund = await razorpay.payments.refund(paymentId, refundData);
    return refund;
  } catch (error) {
    console.error("Refund initiation failed:", error);
    throw new Error(`Failed to initiate refund: ${error.message}`);
  }
};

export default razorpay;
