import express from "express";
import * as controller from "./controller.js";
import * as validator from "./validator.js";
import requireAuthentication from "../../../middleware/requireAuthentication.js";
import { validateRequest } from "../../../utils/customValidators.js";

const router = express.Router();

// Get order statistics
router.get("/stats", requireAuthentication, controller.getStats);

// List orders
router.get(
  "/",
  requireAuthentication,
  validateRequest(validator.listSchema, "query"),
  controller.list,
);

// Get order by ID
router.get("/:id", requireAuthentication, controller.getById);

// Create order
router.post(
  "/",
  requireAuthentication,
  validateRequest(validator.createOrderSchema),
  controller.createOrder,
);

// Add shipping address to order
router.put(
  "/:id/shipping-address",
  requireAuthentication,
  validateRequest(validator.addShippingAddressSchema),
  controller.addShippingAddress,
);

// Create payment for order
router.post(
  "/:orderId/payment",
  requireAuthentication,
  controller.createPaymentForOrder,
);

// Verify payment
router.post(
  "/payment/verify",
  requireAuthentication,
  validateRequest(validator.verifyPaymentSchema),
  controller.verifyPayment,
);

// Demo payment (for testing and portfolio demonstration)
router.post(
  "/:id/demo-payment",
  requireAuthentication,
  validateRequest(validator.demoPaymentSchema),
  controller.demoPayment,
);

// Cancel order
router.put(
  "/:id/cancel",
  requireAuthentication,
  validateRequest(validator.cancelOrderSchema),
  controller.cancelOrder,
);

// Request refund
router.post(
  "/:id/items/:itemId/refund",
  requireAuthentication,
  controller.requestRefund,
);

export default router;
