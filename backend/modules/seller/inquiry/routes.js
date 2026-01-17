import express from "express";
import * as controller from "./controller.js";
import * as validator from "./validator.js";
import requireAuthentication from "../../../middleware/requireAuthentication.js";
import requireSeller from "../../../middleware/requireSeller.js";
import { validateRequest } from "../../../utils/customValidators.js";

const router = express.Router();

// Get inquiry statistics
router.get("/stats", requireAuthentication, requireSeller, controller.getStats);

// Get recent inquiries
router.get(
  "/recent",
  requireAuthentication,
  requireSeller,
  controller.getRecent
);

// Get inquiries by product
router.get(
  "/product/:productId",
  requireAuthentication,
  requireSeller,
  controller.getByProduct
);

// List inquiries
router.get(
  "/",
  requireAuthentication,
  requireSeller,
  validateRequest(validator.listSchema, "query"),
  controller.list
);

// Get inquiry by ID
router.get("/:id", requireAuthentication, requireSeller, controller.getById);

export default router;
