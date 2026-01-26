import Joi from "joi";
import { objectIdValidator } from "../../../utils/customValidators.js";

export const searchSchema = Joi.object({
  // Pagination
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(24),

  // Search query
  q: Joi.string().trim().allow("", null).optional(),

  // Filters
  category: objectIdValidator.optional(),
  brand: objectIdValidator.optional(),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),
  inStock: Joi.boolean().truthy("true", "1").falsy("false", "0").optional(),

  // Sort
  sortBy: Joi.string()
    .valid("relevance", "newest", "priceLow", "priceHigh", "title")
    .default("relevance"),
}).unknown(false);
