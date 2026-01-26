// routes.js - Payment module routes (THIN LAYER)
// Routes handle HTTP routing, delegate logic to controller

import express from "express";
import * as controller from "./controller.js";
import * as validator from "./validator.js";
import requireAuthentication from "../../../middleware/requireAuthentication.js";
import { validateRequest } from "../../../utils/customValidators.js";

const router = express.Router();

/**
 * Create payment for an order
 * POST /api/user/payments/create
 */
// router.post(
//   "/create",
//   requireAuthentication,
//   validateRequest(validator.createPaymentSchema),
//   controller.createPayment,
// );

/**
 * Verify payment after frontend callback
 * POST /api/user/payments/verify
 */
router.post(
  "/verify",
  requireAuthentication,
  validateRequest(validator.verifyPaymentSchema),
  controller.verifyPayment,
);

/**
 * List payments for logged-in user
 * GET /api/user/payments
 */
router.get(
  "/",
  requireAuthentication,
  validateRequest(validator.listPaymentsSchema, "query"),
  controller.listPayments,
);

/**
 * Get payment details
 * GET /api/user/payments/:paymentId
 */
router.get("/:paymentId", requireAuthentication, controller.getPayment);

/**
 * Process refund
 * POST /api/user/payments/:paymentId/refund
 */
// router.post(
//   "/:paymentId/refund",
//   requireAuthentication,
//   validateRequest(validator.refundSchema),
//   controller.processRefund,
// );

/**
 * Razorpay Webhook endpoint
 * POST /api/user/payments/webhook
 *
 * SETUP NOTES:
 * 1. Configure webhook URL in Razorpay dashboard
 * 2. Set RAZORPAY_WEBHOOK_SECRET in .env
 * 3. Subscribe to: payment.captured, payment.failed
 */
// router.post("/webhook", controller.handleWebhook);

export default router;
