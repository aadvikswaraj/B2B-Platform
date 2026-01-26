import express from "express";
import * as controller from "./controller.js";
import * as validator from "./validator.js";
import { requirePermission } from "../../../middleware/requireAuthorisation.js";
import requireAuthentication from "../../../middleware/requireAuthentication.js";
import requireAdmin from "../../../middleware/requireAdmin.js";
import { validateRequest } from "../../../utils/customValidators.js";

import { listEndpoint } from "../../../utils/listQueryHandler.js";
import { User } from "../../../models/model.js";
import Joi from "joi";

const router = express.Router();

// List users
router.get(
  "/",
  requireAuthentication,
  requireAdmin,
  requirePermission("users", "view"),
  ...listEndpoint({
    model: User,
    searchFields: ["name", "email", "phone"],
    filterMap: {
      status: (v) => ({ userSuspended: v === "suspended" }),
      role: (v) => {
        if (v === "admin") return { isAdmin: true };
        if (v === "seller") return { isSeller: true };
        if (v === "buyer") return { isAdmin: false, isSeller: false };
        return {};
      },
    },
    populate: { path: "adminRole", select: "roleName" },
    filters: Joi.object({
      status: Joi.string().valid("active", "suspended").optional(),
      role: Joi.string().valid("admin", "seller", "buyer").optional(),
    }),
    sortFields: ["name", "email", "createdAt", "updatedAt"],
  }),
);

// Get user by ID
router.get(
  "/:id",
  requireAuthentication,
  requireAdmin,
  requirePermission("users", "view"),
  controller.getById,
);

// Create admin user
router.post(
  "/new-admin",
  requireAuthentication,
  requireAdmin,
  requirePermission("users", "create"),
  validateRequest(validator.createAdminSchema),
  controller.createAdmin,
);

// Update user
router.put(
  "/:id",
  requireAuthentication,
  requireAdmin,
  requirePermission("users", "edit"),
  validateRequest(validator.updateSchema),
  controller.update,
);

// Delete user
router.delete(
  "/:id",
  requireAuthentication,
  requireAdmin,
  requirePermission("users", "delete"),
  controller.remove,
);

export default router;
