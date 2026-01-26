import express from "express";
import * as controller from "./controller.js";
import * as validator from "./validator.js";
import { validateRequest } from "../../../utils/customValidators.js";

import {
  listEndpoint,
  buildFilterQuery,
} from "../../../utils/listQueryHandler.js";
import { Product } from "../../../models/model.js";
import Joi from "joi";
import { objectIdValidator } from "../../../utils/customValidators.js";

const router = express.Router();

// Public search endpoint
// No requireLogin
router.get(
  "/",
  ...listEndpoint({
    model: Product,
    searchFields: ["title", "description", "slug"],
    buildQuery: (filters, req) => ({
      ...buildFilterQuery(filters, { category: "category", brand: "brand" }),
      isActive: true,
      "moderation.status": "approved",
      status: "active",
    }),
    populate: [
      { path: "category", select: "name slug" },
      { path: "brand", select: "name" },
    ],
    select:
      "title price images moq status moderation isActive slug description category logistics support production",
    filters: Joi.object({
      category: objectIdValidator.optional(),
      minPrice: Joi.number().min(0).optional(),
      maxPrice: Joi.number().min(0).optional(),
      brand: objectIdValidator.optional(),
    }).unknown(true),
    sortFields: ["createdAt", "price.singlePrice", "title"],
    defaultSortField: "createdAt",
  }),
);

router.get(
  "/:id",
  validateRequest(validator.getByIdSchema, "params"),
  controller.getById,
);

export default router;
