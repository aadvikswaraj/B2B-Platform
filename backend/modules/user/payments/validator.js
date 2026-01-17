// validator.js - Joi validation schemas for payment endpoints
// Validates request data before processing

import Joi from "joi";
import { objectIdValidator } from "../../../utils/customValidators.js";

/**
 * Schema for creating a payment
 * 
 * Frontend sends only orderId
 * Backend calculates amount from Order (security)
 */
export const createPaymentSchema = Joi.object({
  orderId: objectIdValidator.required(),
}).unknown(false);

/**
 * Schema for verifying payment after frontend callback
 * 
 * These fields come from Razorpay frontend SDK
 * - razorpay_order_id: Razorpay's order ID
 * - razorpay_payment_id: Razorpay's payment ID
 * - razorpay_signature: HMAC signature for verification
 */
export const verifyPaymentSchema = Joi.object({
  razorpay_order_id: Joi.string().required(),
  razorpay_payment_id: Joi.string().required(),
  razorpay_signature: Joi.string().required(),
}).unknown(false);

/**
 * Schema for refund processing
 * 
 * Amount is optional - if not provided, full refund
 */
export const refundSchema = Joi.object({
  paymentId: objectIdValidator.required(),
  amount: Joi.number().positive().precision(2).optional(),
  reason: Joi.string().trim().max(500).optional(),
}).unknown(false);

/**
 * Schema for listing payments with filters
 */
export const listPaymentsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string()
    .valid("created", "authorized", "paid", "failed", "refunded")
    .optional(),
}).unknown(false);
