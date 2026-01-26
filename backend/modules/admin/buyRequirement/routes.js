import express from "express";
import * as controller from "./controller.js";
import { requirePermission } from "../../../middleware/requireAuthorisation.js";
import requireAuthentication from "../../../middleware/requireAuthentication.js";
import requireAdmin from "../../../middleware/requireAdmin.js";
import { validateRequest } from "../../../utils/customValidators.js";
import * as validator from "./validator.js";

import { listEndpoint } from "../../../utils/listQueryHandler.js";
import { BuyRequirement } from "../../../models/model.js";
import Joi from "joi";

const router = express.Router();
router.use(requireAuthentication, requireAdmin);

router.get(
  "/",
  requirePermission("buyRequirements", "view"),
  ...listEndpoint({
    model: BuyRequirement,
    searchFields: ["productName", "description"],
    filterMap: {
      quantity: (val) => ({ quantity: { $lte: val } }),
      unit: "unit",
      status: "status",
      verificationStatus: "verification.status",
    },
    populate: [
      { path: "user", select: "name email phone" },
      { path: "verification.category", select: "name" },
      { path: "verification.verifiedBy", select: "name" },
    ],
    filters: Joi.object({
      quantity: Joi.number().min(0).optional(),
      unit: Joi.string().optional(),
      status: Joi.string().valid("active", "fulfilled", "expired").optional(),
      verificationStatus: Joi.string()
        .valid("pending", "verified", "rejected")
        .optional(),
    }),
    sortFields: ["createdAt", "productName", "quantity", "status"],
  }),
);
router.get(
  "/:buyRequirementId",
  requirePermission("buyRequirements", "view"),
  controller.getById,
);

router.post(
  "/:buyRequirementId/verifyDecision",
  requirePermission("buyRequirements", "verify"),
  validateRequest(validator.verifyBuyRequirementSchema),
  controller.verify,
);
export default router;
