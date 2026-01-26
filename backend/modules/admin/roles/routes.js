import express from "express";
import * as controller from "./controller.js";
import * as validator from "./validator.js";
import { requirePermission } from "../../../middleware/requireAuthorisation.js";
import requireAuthentication from "../../../middleware/requireAuthentication.js";
import requireAdmin from "../../../middleware/requireAdmin.js";
import { validateRequest } from "../../../utils/customValidators.js";

import { listEndpoint } from "../../../utils/listQueryHandler.js";
import { AdminRole } from "../../../models/model.js";
import Joi from "joi";

const router = express.Router();
router.use(requireAuthentication, requireAdmin);

// List roles (MUST come before /:id route)
router.get(
  "/list",
  requirePermission("adminRoles", "view"),
  ...listEndpoint({
    model: AdminRole,
    searchFields: ["roleName"],
    filterMap: {
      isActive: (v) => ({ isActive: v }),
      isSuperAdmin: (v) => ({ isSuperAdmin: v }),
    },
    filters: Joi.object({
      isActive: Joi.boolean().truthy("true").falsy("false").optional(),
      isSuperAdmin: Joi.boolean().truthy("true").falsy("false").optional(),
    }),
    sortFields: ["roleName", "createdAt", "updatedAt"],
  }),
);

// Get users count by role (MUST come before /:id route)
router.get(
  "/:id/users-count",
  requirePermission("adminRoles", "view"),
  controller.getUsersCount,
);

// Get users by role (MUST come before /:id route)
router.get(
  "/:id/users",
  requirePermission("users", "view"),
  controller.getUsers,
);

// Get role by ID
router.get("/:id", requirePermission("adminRoles", "view"), controller.getById);

// Create role
router.post(
  "/new",
  requirePermission("adminRoles", "create"),
  validateRequest(validator.createSchema),
  controller.create,
);

// Update role
router.put(
  "/:id",
  requirePermission("adminRoles", "edit"),
  validateRequest(validator.updateSchema),
  controller.update,
);

// Delete role with optional strategy
router.delete(
  "/:id",
  requirePermission("adminRoles", "delete"),
  validateRequest(validator.deleteSchema),
  controller.remove,
);

export default router;
