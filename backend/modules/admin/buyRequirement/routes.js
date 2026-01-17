import express from "express";
import * as controller from "./controller.js";
import { requirePermission } from "../../../middleware/requireAuthorisation.js";
import requireAuthentication from "../../../middleware/requireAuthentication.js";
import requireAdmin from "../../../middleware/requireAdmin.js";
import { validateRequest } from "../../../utils/customValidators.js";
import * as validator from "./validator.js";

const router = express.Router();
router.use(requireAuthentication, requireAdmin);

router.get(
  "/",
  requirePermission("buyRequirements", "view"),
  validateRequest(validator.listSchema, "query"),
  controller.list
);
router.get(
  "/:buyRequirementId",
  requirePermission("buyRequirements", "view"),
  controller.getById
);

router.post(
  "/:buyRequirementId/verifyDecision",
  requirePermission("buyRequirements", "verify"),
  validateRequest(validator.verifyBuyRequirementSchema),
  controller.verify
);
export default router;
