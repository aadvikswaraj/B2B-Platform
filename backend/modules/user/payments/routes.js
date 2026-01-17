// routes.js - Payment module routes (THIN LAYER)
// Routes handle HTTP concerns, delegate logic to service

import express from "express";
import * as paymentService from "./service.js";
import * as validator from "./validator.js";
import requireAuthentication from "../../../middleware/requireAuthentication.js";
import { validateRequest } from "../../../utils/customValidators.js";
import { verifyWebhookSignature } from "./razorpay.client.js";
import { sendResponse } from "../../../middleware/responseTemplate.js";

const router = express.Router();

/**
 * Create payment for an order
 *
 * POST /api/user/payments/create
 *
 * Frontend flow:
 * 1. User clicks "Pay Now" on order
 * 2. Call this endpoint with orderId
 * 3. Receive razorpayOrderId and amount
 * 4. Open Razorpay checkout with received data
 * 5. On success, call verify endpoint
 *
 * Security:
 * - Amount comes from backend (Order.totalAmount)
 * - Frontend cannot tamper with payment amount
 */
router.post(
  "/create",
  requireAuthentication,
  validateRequest(validator.createPaymentSchema),
  async (req, res) => {
    try {
      const { orderId } = req.body;
      const buyerId = req.user._id;

      // Service handles all business logic
      const paymentData = await paymentService.createPaymentForOrder(
        orderId,
        buyerId
      );

      res.locals.response = {
        success: true,
        message: "Payment created successfully",
        status: 200,
        data: paymentData,
      };
    } catch (error) {
      console.error("Error creating payment:", error);
      res.locals.response = {
        success: false,
        message: error.message || "Failed to create payment",
        status: error.message?.includes("Unauthorized") ? 403 : 500,
      };
    }
    return sendResponse(res);
  }
);

/**
 * Verify payment after frontend callback
 *
 * POST /api/user/payments/verify
 *
 * Called after Razorpay checkout success
 *
 * CRITICAL: This performs signature verification
 * - Validates payment is genuine
 * - Updates Payment and Order status
 * - Idempotent (safe to call multiple times)
 *
 * Frontend should call this immediately after Razorpay success
 */
router.post(
  "/verify",
  requireAuthentication,
  validateRequest(validator.verifyPaymentSchema),
  async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
        req.body;

      // Service handles verification logic
      const result = await paymentService.verifyPayment(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
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
      console.error("Payment verification failed:", error);
      res.locals.response = {
        success: false,
        message: error.message || "Payment verification failed",
        status: 400,
      };
    }
    return sendResponse(res);
  }
);

/**
 * Get payment details
 *
 * GET /api/user/payments/:paymentId
 *
 * Fetch payment info for order details page
 */
router.get("/:paymentId", requireAuthentication, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user._id;

    const payment = await paymentService.getPaymentById(paymentId, userId);

    res.locals.response = {
      success: true,
      message: "Payment retrieved successfully",
      status: 200,
      data: payment,
    };
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.locals.response = {
      success: false,
      message: error.message || "Failed to fetch payment",
      status: error.message?.includes("Unauthorized") ? 403 : 404,
    };
  }
  return sendResponse(res);
});

/**
 * List payments for logged-in user
 *
 * GET /api/user/payments
 *
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10)
 * - status: Filter by status (optional)
 */
router.get(
  "/",
  requireAuthentication,
  validateRequest(validator.listPaymentsSchema, "query"),
  async (req, res) => {
    try {
      const userId = req.user._id;
      const { page, limit, status } = req.query;

      const result = await paymentService.listPaymentsForUser(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
      });

      res.locals.response = {
        success: true,
        message: "Payments retrieved successfully",
        status: 200,
        data: result,
      };
    } catch (error) {
      console.error("Error listing payments:", error);
      res.locals.response = {
        success: false,
        message: "Failed to fetch payments",
        status: 500,
      };
    }
    return sendResponse(res);
  }
);

/**
 * WEBHOOK ENDPOINT - Razorpay server-to-server notifications
 *
 * POST /api/user/payments/webhook
 *
 * CRITICAL SECURITY:
 * - MUST verify webhook signature
 * - Reject unsigned webhooks
 * - This is separate from frontend verification
 *
 * WHY WEBHOOKS ARE MANDATORY:
 * - Frontend callbacks can fail (network issues, browser closed)
 * - Webhooks retry automatically
 * - Webhooks are authoritative source of truth
 * - Used for reconciliation and order fulfillment
 *
 * SETUP REQUIRED:
 * 1. Configure webhook URL in Razorpay dashboard
 * 2. Set RAZORPAY_WEBHOOK_SECRET in .env
 * 3. Subscribe to events: payment.captured, payment.failed
 *
 * IDEMPOTENCY:
 * - Razorpay may send same webhook multiple times
 * - Service layer handles idempotency checks
 * - Always return 200 for processed webhooks (prevents retries)
 */
router.post("/webhook", async (req, res) => {
  try {
    // Step 1: Extract webhook signature from headers
    const webhookSignature = req.headers["x-razorpay-signature"];

    if (!webhookSignature) {
      console.error("Webhook signature missing");
      return res.status(400).json({
        success: false,
        message: "Webhook signature missing",
      });
    }

    // Step 2: Verify webhook signature (CRITICAL SECURITY)
    // req.rawBody should be set by middleware (see note below)
    const webhookBody = JSON.stringify(req.body);
    const isValid = verifyWebhookSignature(webhookBody, webhookSignature);

    if (!isValid) {
      console.error("Invalid webhook signature - potential security threat");
      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature",
      });
    }

    // Step 3: Process webhook event
    const event = req.body.event;
    const eventData = req.body;

    console.log(`Processing webhook event: ${event}`);

    // Delegate to service layer
    const result = await paymentService.handleWebhook(event, eventData);

    // Step 4: Always return 200 for successfully processed webhooks
    // This prevents Razorpay from retrying
    return res.status(200).json({
      success: true,
      message: result.message || "Webhook processed",
    });
  } catch (error) {
    console.error("Webhook processing error:", error);

    // Return 200 even on error to prevent retries
    // Log error for manual investigation
    return res.status(200).json({
      success: false,
      message: "Webhook processing failed",
    });
  }
});

/**
 * IMPORTANT WEBHOOK NOTES:
 *
 * 1. RAW BODY REQUIREMENT:
 *    - Webhook signature verification requires RAW request body
 *    - Express body parsers convert body to JSON
 *    - Solution: Add middleware to capture raw body
 *
 *    In app.js, BEFORE body parsers:
 *    ```
 *    app.use('/api/user/payments/webhook', (req, res, next) => {
 *      let data = '';
 *      req.on('data', chunk => { data += chunk; });
 *      req.on('end', () => {
 *        req.rawBody = data;
 *        next();
 *      });
 *    });
 *    ```
 *
 * 2. WEBHOOK SECRET:
 *    - Set in Razorpay dashboard under Webhooks settings
 *    - Add to .env: RAZORPAY_WEBHOOK_SECRET=your_secret
 *    - Different from API key secret
 *
 * 3. WEBHOOK EVENTS TO SUBSCRIBE:
 *    - payment.captured (mandatory)
 *    - payment.failed (mandatory)
 *    - order.paid (optional - redundant with payment.captured)
 *    - refund.processed (optional - for refund tracking)
 *
 * 4. TESTING WEBHOOKS LOCALLY:
 *    - Use ngrok or similar to expose localhost
 *    - Configure ngrok URL in Razorpay dashboard
 *    - Or use Razorpay's webhook testing tool
 *
 * 5. MONITORING:
 *    - Log all webhook events
 *    - Track duplicate webhooks
 *    - Alert on verification failures
 *    - Monitor processing errors for manual intervention
 */

export default router;
