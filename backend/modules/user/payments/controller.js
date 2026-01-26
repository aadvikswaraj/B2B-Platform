// controller.js - Payment controller layer
// Handles HTTP request/response, delegates business logic to service

import * as service from "./service.js";
import { sendResponse } from "../../../middleware/responseTemplate.js";
import { verifyWebhookSignature } from "./razorpay.client.js";

/**
 * Create payment for an order
 */
export const createPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const buyerId = req.user._id;

    const paymentData = await service.createPaymentForOrder(orderId, buyerId);

    res.locals.response = {
      success: true,
      message: "Payment created successfully",
      status: 200,
      data: paymentData,
    };
  } catch (error) {
    console.error("createPayment Error:", error);
    res.locals.response = {
      success: false,
      message: error.message || "Failed to create payment",
      status: error.message?.includes("Unauthorized") ? 403 : 500,
    };
  }
  return sendResponse(res);
};

/**
 * Verify payment after frontend callback
 */
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const result = await service.verifyPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    );

    res.locals.response = {
      success: true,
      message: result.message,
      status: 200,
      data: {
        paymentId: result.paymentId,
        orderId: result.orderId,
      },
    };
  } catch (error) {
    console.error("verifyPayment Error:", error);
    res.locals.response = {
      success: false,
      message: error.message || "Payment verification failed",
      status: 400,
    };
  }
  return sendResponse(res);
};

/**
 * Get payment details by ID
 */
export const getPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user._id;

    const payment = await service.getPaymentById(paymentId, userId);

    res.locals.response = {
      success: true,
      message: "Payment retrieved successfully",
      status: 200,
      data: payment,
    };
  } catch (error) {
    console.error("getPayment Error:", error);
    res.locals.response = {
      success: false,
      message: error.message || "Failed to fetch payment",
      status: error.message?.includes("Unauthorized") ? 403 : 404,
    };
  }
  return sendResponse(res);
};

/**
 * List payments for logged-in user
 */
export const listPayments = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page, limit, status } = req.query;

    const result = await service.listPaymentsForUser(userId, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      status,
    });

    res.locals.response = {
      success: true,
      message: "Payments retrieved successfully",
      status: 200,
      data: result,
    };
  } catch (error) {
    console.error("listPayments Error:", error);
    res.locals.response = {
      success: false,
      message: "Failed to fetch payments",
      status: 500,
    };
  }
  return sendResponse(res);
};

/**
 * Process refund for a payment
 */
export const processRefund = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { amount, reason } = req.body;

    const result = await service.processRefund(paymentId, amount, reason);

    res.locals.response = {
      success: true,
      message: "Refund processed successfully",
      status: 200,
      data: result,
    };
  } catch (error) {
    console.error("processRefund Error:", error);
    res.locals.response = {
      success: false,
      message: error.message || "Failed to process refund",
      status: 400,
    };
  }
  return sendResponse(res);
};

/**
 * Razorpay Webhook handler
 */
export const handleWebhook = async (req, res) => {
  try {
    const webhookSignature = req.headers["x-razorpay-signature"];

    if (!webhookSignature) {
      console.error("Webhook signature missing");
      return res.status(400).json({
        success: false,
        message: "Webhook signature missing",
      });
    }

    // Verify webhook signature
    const webhookBody = JSON.stringify(req.body);
    const isValid = verifyWebhookSignature(webhookBody, webhookSignature);

    if (!isValid) {
      console.error("Invalid webhook signature - potential security threat");
      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature",
      });
    }

    // Process webhook event
    const event = req.body.event;
    const eventData = req.body;

    console.log(`Processing webhook event: ${event}`);

    const result = await service.handleWebhook(event, eventData);

    return res.status(200).json({
      success: true,
      message: result.message || "Webhook processed",
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    // Return 200 even on error to prevent retries
    return res.status(200).json({
      success: false,
      message: "Webhook processing failed",
    });
  }
};
