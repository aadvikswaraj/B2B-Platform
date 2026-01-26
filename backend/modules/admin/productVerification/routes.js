import express from "express";
import * as controller from "./controller.js";
import * as validator from "./validator.js";
import { requirePermission } from "../../../middleware/requireAuthorisation.js";
import requireAuthentication from "../../../middleware/requireAuthentication.js";
import requireAdmin from "../../../middleware/requireAdmin.js";
import { listEndpoint } from "../../../utils/listQueryHandler.js";
import { Product } from "../../../models/model.js";
import Joi from "joi";
import { validateRequest } from "../../../utils/customValidators.js";

const router = express.Router();
router.use(requireAuthentication, requireAdmin);

// List product verifications
router.get(
  "/list",
  requirePermission("productVerification", "view"),
  ...listEndpoint({
    model: Product,
    searchFields: ["title", "description"],
    filterMap: {
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
    },
    populate: [
      { path: "seller", model: "User", select: "name email" },
      { path: "brand", model: "Brand", select: "name" },
      { path: "category", model: "Category", select: "name" },
    ],
    filters: Joi.object({
      status: Joi.string()
        .valid("pending", "pending_update", "approved", "rejected")
        .optional(),
      isOrder: Joi.boolean().truthy("true").falsy("false").optional(),
    }),
    sortFields: ["createdAt", "updatedAt"],
  }),
);

// Get product verification by ID
router.get(
  "/:productId",
  requirePermission("productVerification", "view"),
  controller.getById,
);

// Verify decision (approve or reject)
router.post(
  "/:productId/verify",
  requirePermission("productVerification", "verify"),
  validateRequest(validator.verifyDecisionSchema),
  controller.verifyDecision,
);

export default router;
