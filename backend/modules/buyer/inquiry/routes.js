import express from "express";
import * as controller from "./controller.js";
import * as validator from "./validator.js";
import requireAuthentication from "../../../middleware/requireAuthentication.js";
import { validateRequest } from "../../../utils/customValidators.js";

const router = express.Router();

// List inquiries
router.get(
  "/",
  requireAuthentication,
  validateRequest(validator.listSchema, "query"),
  controller.list
);

// Get inquiry by ID
router.get("/:id", requireAuthentication, controller.getById);

// Create inquiry
router.post(
  "/",
  requireAuthentication,
  validateRequest(validator.createSchema),
  controller.create
);

// Update fulfillment status
router.post(
  "/:id/fulfillment",
  requireAuthentication,
  validateRequest(validator.updateFulfillmentSchema),
  controller.updateFulfillment
);

export default router;
