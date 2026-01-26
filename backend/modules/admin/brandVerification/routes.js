import express from "express";
import * as controller from "./controller.js";
import { requirePermission } from "../../../middleware/requireAuthorisation.js";
import requireAuthentication from "../../../middleware/requireAuthentication.js";
import requireAdmin from "../../../middleware/requireAdmin.js";
import * as validator from "./validator.js";
import { validateRequest } from "../../../utils/customValidators.js";

import { listEndpoint } from "../../../utils/listQueryHandler.js";
import { Brand } from "../../../models/model.js";
import Joi from "joi";

const router = express.Router();
router.use(requireAuthentication, requireAdmin);

router.get(
  "/",
  requirePermission("brands", "view"),
  ...listEndpoint({
    model: Brand,
    searchFields: ["name", "slug"],
    filterMap: {
      status: (v) => ({ "kyc.status": v }),
    },
    populate: { path: "user", select: "name email phone" },
    filters: Joi.object({
      status: Joi.string().valid("verified", "rejected", "pending").optional(),
    }),
    sortFields: ["name", "createdAt", "updatedAt"],
  }),
);

router.get(
  "/:brandId",
  requirePermission("brands", "view"),
  controller.getById,
);

router.post(
  "/:brandId/verifyDecision",
  requirePermission("brands", "verify"),
  validateRequest(validator.verifyDecisionSchema),
  controller.verifyDecision,
);
export default router;
