import express from "express";
import * as controller from "./controller.js";
import * as validator from "./validator.js";
import { requirePermission } from "../../../middleware/requireAuthorisation.js";
import requireAuthentication from "../../../middleware/requireAuthentication.js";
import requireAdmin from "../../../middleware/requireAdmin.js";
import { validateRequest } from "../../../utils/customValidators.js";

const router = express.Router();

// List users
router.get(
  "/",
  requireAuthentication,
  requireAdmin,
  requirePermission("users", "view"),
  validateRequest(validator.listSchema, "query"),
  controller.list
);

// Get user by ID
router.get(
  "/:id",
  requireAuthentication,
  requireAdmin,
  requirePermission("users", "view"),
  controller.getById
);

// Create admin user
router.post(
  "/new-admin",
  requireAuthentication,
  requireAdmin,
  requirePermission("users", "create"),
  validateRequest(validator.createAdminSchema),
  controller.createAdmin
);

// Update user
router.put(
  "/:id",
  requireAuthentication,
  requireAdmin,
  requirePermission("users", "edit"),
  validateRequest(validator.updateSchema),
  controller.update
);

// Delete user
router.delete(
  "/:id",
  requireAuthentication,
  requireAdmin,
  requirePermission("users", "delete"),
  controller.remove
);

export default router;
