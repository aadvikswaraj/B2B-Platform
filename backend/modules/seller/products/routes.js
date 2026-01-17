import express from "express";
import * as controller from "./controller.js";
import * as validator from "./validator.js";
import requireAuthentication from "../../../middleware/requireAuthentication.js";
import requireSeller from "../../../middleware/requireSeller.js";
import { validateRequest } from "../../../utils/customValidators.js";

const router = express.Router();

// List products with pagination and filters
router.get(
  "/list",
  requireAuthentication,
  requireSeller,
  validateRequest(validator.listSchema, "query"),
  controller.list
);

// Get product by ID
router.get("/:id", requireAuthentication, requireSeller, controller.getById);

// Create product
router.post(
  "/new",
  requireAuthentication,
  requireSeller,
  validateRequest(validator.createSchema),
  controller.create
);

// Update product
router.post(
  "/:id",
  requireAuthentication,
  requireSeller,
  validateRequest(validator.updateSchema),
  controller.update
);

// Update trade info (instant)
router.post(
  "/:id/trade",
  requireAuthentication,
  requireSeller,
  validateRequest(validator.updateTradeSchema),
  controller.updateTradeInfo
);

// Update core info (draft)
router.post(
  "/:id/core",
  requireAuthentication,
  requireSeller,
  validateRequest(validator.updateCoreSchema),
  controller.updateCoreDraft
);

// Discard draft
router.delete(
  "/:id/draft",
  requireAuthentication,
  requireSeller,
  controller.discardDraft
);

// Delete product (soft delete)
router.delete("/:id", requireAuthentication, requireSeller, controller.remove);

export default router;
