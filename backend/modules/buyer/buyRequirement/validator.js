import Joi from "joi";
import { createListSchema } from "../../../utils/listQueryHandler.js";

export const createRequirementSchema = Joi.object({
  productName: Joi.string().trim().min(2).max(200).required(),
  description: Joi.string().trim().min(10).max(2000).required(),
  quantity: Joi.number().integer().min(1).required(),
  unit: Joi.string().trim().min(1).max(50).required(),
}).unknown(false);

export const listSchema = createListSchema({
  filters: Joi.object({
    status: Joi.string().valid("active", "fulfilled", "expired").optional(),
    generatedByInquiry: Joi.boolean().truthy("true").falsy("false").optional(),
  }),
  sortFields: ["createdAt", "productName", "quantity"],
});

export const updateSchema = Joi.object({
  productName: Joi.string().trim().min(2).max(200).optional(),
  description: Joi.string().trim().min(10).max(2000).optional(),
  quantity: Joi.number().integer().min(1).optional(),
  unit: Joi.string().trim().min(1).max(50).optional(),
}).min(1).unknown(false);

export const updateStatusSchema = Joi.object({
  status: Joi.string().valid("active", "fulfilled", "expired").required(),
}).unknown(false);

export const validateCreateRequirement = (data) => createRequirementSchema.validate(data);
