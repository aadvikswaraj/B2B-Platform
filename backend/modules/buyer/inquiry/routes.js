import express from "express";
import * as controller from "./controller.js";
import * as validator from "./validator.js";
import requireAuthentication from "../../../middleware/requireAuthentication.js";
import { validateRequest } from "../../../utils/customValidators.js";

import { listEndpoint } from "../../../utils/listQueryHandler.js";
import { Inquiry } from "../../../models/model.js";
import Joi from "joi";
import { objectIdValidator } from "../../../utils/customValidators.js";

const router = express.Router();

// List inquiries
router.get(
  "/",
  requireAuthentication,
  ...listEndpoint({
    model: Inquiry,
    searchFields: ["productName", "message"],
    buildQuery: (filters, req) => ({
      user: req.user._id,
      ...(filters?.requirementFulfilled !== undefined && {
        requirementFulfilled: filters.requirementFulfilled,
      }),
      ...(filters?.product && { product: filters.product }),
    }),
    populate: [
      { path: "product", select: "title price images" },
      { path: "seller", select: "name email phone" },
      { path: "buyRequirement", select: "productName status verification" },
    ],
    filters: Joi.object({
      requirementFulfilled: Joi.boolean()
        .truthy("true")
        .falsy("false")
        .optional(),
      product: objectIdValidator.optional(),
    }),
    sortFields: ["createdAt", "productName", "quantity"],
  }),
);

// Get inquiry by ID
router.get("/:id", requireAuthentication, controller.getById);

// Create inquiry
router.post(
  "/",
  requireAuthentication,
  validateRequest(validator.createSchema),
  controller.create,
);

// Update fulfillment status
router.post(
  "/:id/fulfillment",
  requireAuthentication,
  validateRequest(validator.updateFulfillmentSchema),
  controller.updateFulfillment,
);

export default router;
