import express from "express";
import * as controller from "./controller.js";
import * as validator from "./validator.js";
import { requirePermission } from "../../../middleware/requireAuthorisation.js";
import requireAuthentication from "../../../middleware/requireAuthentication.js";
import requireAdmin from "../../../middleware/requireAdmin.js";
import { validateRequest } from "../../../utils/customValidators.js";

const router = express.Router();
router.use(requireAuthentication, requireAdmin);

// List product verifications
router.get(
  "/list",
  requirePermission("productVerification", "view"),
  validateRequest(validator.listSchema, "query"),
  controller.list
);

// Get product verification by ID
router.get(
  "/:productId",
  requirePermission("productVerification", "view"),
  controller.getById
);

// Verify decision (approve or reject)
router.post(
  "/:productId/verify",
  requirePermission("productVerification", "verify"),
  validateRequest(validator.verifyDecisionSchema),
  controller.verifyDecision
);

export default router;
