import express from "express";
import * as controller from "./controller.js";
import { requirePermission } from "../../../middleware/requireAuthorisation.js";
import requireAuthentication from "../../../middleware/requireAuthentication.js";
import requireAdmin from "../../../middleware/requireAdmin.js";
import * as validator from "./validator.js";
import { validateRequest } from "../../../utils/customValidators.js";

const router = express.Router();
router.use(requireAuthentication, requireAdmin);

router.get(
  "/",
  requirePermission("brands", "view"),
  validateRequest(validator.listBrandsSchema, "query"),
  controller.list
);

router.get(
  "/:brandId",
  requirePermission("brands", "view"),
  controller.getById
);

router.post(
  "/:brandId/verifyDecision",
  requirePermission("brands", "verify"),
  validateRequest(validator.verifyDecisionSchema),
  controller.verifyDecision
);
export default router;
