import express from "express";
import * as controller from "./controller.js";
import * as validator from "./validator.js";
import requireAuthentication from "../../../middleware/requireAuthentication.js";
import { validateRequest } from "../../../utils/customValidators.js";

import { listEndpoint } from "../../../utils/listQueryHandler.js";
import { BuyRequirement } from "../../../models/model.js";
import Joi from "joi";

const router = express.Router();

// List buy requirements
router.get(
  "/",
  requireAuthentication,
  ...listEndpoint({
    model: BuyRequirement,
    searchFields: ["productName", "description"],
    buildQuery: (filters, req) => ({
      user: req.user._id,
      ...(filters?.status && { status: filters.status }),
    }),
    populate: [
      { path: "verification.category", select: "name" },
      { path: "verification.verifiedBy", select: "name email" },
    ],
    filters: Joi.object({
      status: Joi.string().valid("active", "fulfilled").optional(),
    }),
    sortFields: ["createdAt", "productName"],
  }),
);

// Get buy requirement by ID
router.get("/:id", requireAuthentication, controller.getById);

// Create buy requirement
router.post(
  "/new",
  requireAuthentication,
  validateRequest(validator.createRequirementSchema),
  controller.create,
);

// Update status
router.put(
  "/:id/status",
  requireAuthentication,
  validateRequest(validator.updateStatusSchema),
  controller.updateStatus,
);

export default router;
