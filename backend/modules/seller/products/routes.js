import express from "express";
import * as controller from "./controller.js";
import * as validator from "./validator.js";
import requireAuthentication from "../../../middleware/requireAuthentication.js";
import requireSeller from "../../../middleware/requireSeller.js";
import { validateRequest } from "../../../utils/customValidators.js";

import {
  listEndpoint,
  buildFilterQuery,
} from "../../../utils/listQueryHandler.js";
import { Product } from "../../../models/model.js";
import Joi from "joi";

const router = express.Router();

const productFilterMap = {
  status: (v) => {
    if (v === "pending_update")
      return {
        "pendingUpdates.status": "pending",
        "moderation.status": "approved",
      };
    return { "moderation.status": v };
  },
  isActive: (v) => ({ isActive: v === "true" || v === true }),
  isOrder: (v) => ({ isOrder: v === "true" || v === true }),
};

// List products with pagination and filters
router.get(
  "/list",
  requireAuthentication,
  requireSeller,
  ...listEndpoint({
    model: Product,
    searchFields: ["title", "description"],
    buildQuery: (filters, req) => ({
      seller: req.user._id,
      ...buildFilterQuery(filters, productFilterMap),
    }),
    populate: [
      { path: "category", select: "name" },
      { path: "brand", select: "name" },
    ],
    filters: Joi.object({
      status: Joi.string()
        .valid("pending", "pending_update", "approved", "rejected")
        .optional(),
      isOrder: Joi.boolean().truthy("true").falsy("false").optional(),
      isActive: Joi.boolean().truthy("true").falsy("false").optional(),
    }),
    sortFields: ["createdAt", "updatedAt"],
  }),
);

// Get product by ID
router.get("/:id", requireAuthentication, requireSeller, controller.getById);

// Create product
router.post(
  "/new",
  requireAuthentication,
  requireSeller,
  validateRequest(validator.createSchema),
  controller.create,
);

// Update trade info (instant)
router.post(
  "/:id/trade",
  requireAuthentication,
  requireSeller,
  validateRequest(validator.updateTradeSchema),
  controller.updateTradeInfo,
);

// Update core info (draft)
router.post(
  "/:id/core",
  requireAuthentication,
  requireSeller,
  validateRequest(validator.updateCoreSchema),
  controller.updateCoreDraft,
);

// Discard draft
router.delete(
  "/:id/draft",
  requireAuthentication,
  requireSeller,
  controller.discardDraft,
);

export default router;
