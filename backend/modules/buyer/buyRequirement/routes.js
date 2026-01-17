import express from "express";
import * as controller from "./controller.js";
import * as validator from "./validator.js";
import requireAuthentication from "../../../middleware/requireAuthentication.js";
import { validateRequest } from "../../../utils/customValidators.js";

const router = express.Router();

// List buy requirements
router.get(
  "/",
  requireAuthentication,
  validateRequest(validator.listSchema, "query"),
  controller.list
);

// Get buy requirement by ID
router.get("/:id", requireAuthentication, controller.getById);

// Create buy requirement
router.post(
  "/new",
  requireAuthentication,
  validateRequest(validator.createRequirementSchema),
  controller.create
);

// Update buy requirement
router.put(
  "/:id",
  requireAuthentication,
  validateRequest(validator.updateSchema),
  controller.update
);

// Update status
router.put(
  "/:id/status",
  requireAuthentication,
  validateRequest(validator.updateStatusSchema),
  controller.updateStatus
);

// Delete buy requirement
router.delete("/:id", requireAuthentication, controller.remove);

export default router;
