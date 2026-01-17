import express from "express";
import Joi from "joi";
import * as controller from "./controller.js";
import * as validator from "./validator.js";
import { Category } from "../../../models/model.js";
import { requirePermission } from "../../../middleware/requireAuthorisation.js";
import requireAuthentication from "../../../middleware/requireAuthentication.js";
import requireAdmin from "../../../middleware/requireAdmin.js";
import {
  validateRequest,
  objectIdValidator,
} from "../../../utils/customValidators.js";
import { listEndpoint } from "../../../utils/listQueryHandler.js";

const router = express.Router();
router.use(requireAuthentication, requireAdmin);

router.get(
  "/",
  requirePermission("category", "view"),
  ...listEndpoint({
    model: Category,
    searchFields: ["name", "slug", "description"],
    filterMap: {
      parentCategory: "parentCategory",
      depth: "depth",
      isActive: "isActive",
    },
    filters: Joi.object({
      depth: Joi.number().integer().min(0).max(2).optional(),
      isActive: Joi.boolean().truthy("true").falsy("false").optional(),
      parentCategory: objectIdValidator.optional(),
    }),
    sortFields: ["name", "createdAt", "updatedAt", "depth"],
    populate: { path: "parentCategory", select: "name slug" },
  })
);
router.get("/:id", requirePermission("category", "view"), controller.getById);
router.post(
  "/new",
  requirePermission("category", "create"),
  validateRequest(validator.createCategorySchema),
  controller.create
);
router.post(
  "/:id/edit",
  requirePermission("category", "edit"),
  validateRequest(validator.updateCategorySchema),
  controller.update
);
router.delete(
  "/:id",
  requirePermission("category", "delete"),
  controller.remove
);
export default router;
