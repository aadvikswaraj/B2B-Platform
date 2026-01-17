import express from "express";
import * as controller from "./controller.js";
import * as validator from "./validator.js";
import { requirePermission } from "../../../middleware/requireAuthorisation.js";
import requireAuthentication from "../../../middleware/requireAuthentication.js";
import requireAdmin from "../../../middleware/requireAdmin.js";
import { validateRequest } from "../../../utils/customValidators.js";

const router = express.Router();
router.use(requireAuthentication, requireAdmin);

// List seller verifications
router.get(
  "/list",
  requirePermission("sellerVerification", "view"),
  validateRequest(validator.listSchema, "query"),
  controller.list
);

// Get seller verification by user ID
router.get(
  "/:userId",
  requirePermission("sellerVerification", "view"),
  controller.getById
);

// Verify individual KYC section (pan, gstin, signature, bankAccount)
router.post(
  "/:userId/verify-section",
  requirePermission("sellerVerification", "verify"),
  validateRequest(validator.verifyKYCSectionSchema),
  controller.verifyKYCSection
);

// Verify global seller status
router.post(
  "/:userId/verifyDecision",
  requirePermission("sellerVerification", "verify"),
  validateRequest(validator.verifyDecisionSchema),
  controller.verifyDecision
);

export default router;
