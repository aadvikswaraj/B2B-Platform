import express from "express";
import * as controller from "./controller.js";
import * as validator from "./validator.js";
import requireAuthentication from "../../../middleware/requireAuthentication.js";
import requireSeller from "../../../middleware/requireSeller.js";
import { validateRequest } from "../../../utils/customValidators.js";

const router = express.Router();

// Get inquiry statistics
router.get("/stats", requireAuthentication, requireSeller, controller.getStats);

// Get recent inquiries
router.get(
  "/recent",
  requireAuthentication,
  requireSeller,
  controller.getRecent,
);

// Get inquiries by product
router.get(
  "/product/:productId",
  requireAuthentication,
  requireSeller,
  controller.getByProduct,
);

import { listEndpoint } from "../../../utils/listQueryHandler.js";
import { Inquiry } from "../../../models/model.js";
import Joi from "joi";
import { objectIdValidator } from "../../../utils/customValidators.js";

// List inquiries
router.get(
  "/",
  requireAuthentication,
  requireSeller,
  ...listEndpoint({
    model: Inquiry,
    searchFields: ["productName", "message"],
    buildQuery: (filters, req) => ({
      seller: req.user._id,
      ...(filters?.isRead !== undefined && {
        isRead: filters.isRead,
      }),
    }),
    populate: [
      { path: "user", select: "name email phone" },
      { path: "product", select: "title price images" },
      { path: "buyRequirement", select: "productName status verification" },
    ],
    filters: Joi.object({
      isRead: Joi.boolean().truthy("true").falsy("false").optional(),
    }),
    sortFields: ["createdAt", "productName"],
  }),
);

// Get inquiry by ID
router.get("/:id", requireAuthentication, requireSeller, controller.getById);

export default router;
