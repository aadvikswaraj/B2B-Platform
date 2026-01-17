import Joi from "joi";
import { objectIdValidator } from "../../../utils/customValidators.js";
import { createListSchema } from "../../../utils/listQueryHandler.js";

export const createOrderSchema = Joi.object({
  shippingAddress: objectIdValidator.required(),
  items: Joi.array().items(
    Joi.object({
      productId: objectIdValidator.required(),
      quantity: Joi.number().integer().min(1).required(),
    })
  ).min(1).required(),
}).unknown(false);

export const listSchema = createListSchema({
  filters: Joi.object({
    status: Joi.string().valid("placed", "confirmed", "shipped", "delivered", "cancelled").optional(),
    paymentStatus: Joi.string().valid("pending", "paid", "failed", "refunded").optional(),
    sellerId: objectIdValidator.optional(),
  }),
  sortFields: ["createdAt", "totalAmount", "status"],
});

export const cancelOrderSchema = Joi.object({
  reason: Joi.string().trim().min(10).max(500).optional(),
}).unknown(false);

export const verifyPaymentSchema = Joi.object({
  razorpayOrderId: Joi.string().required(),
  razorpayPaymentId: Joi.string().required(),
  razorpaySignature: Joi.string().required(),
}).unknown(false);
