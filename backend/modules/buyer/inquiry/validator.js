import Joi from "joi";
import { objectIdValidator } from "../../../utils/customValidators.js";
import { createListSchema } from "../../../utils/listQueryHandler.js";

export const createSchema = Joi.object({
  product: objectIdValidator.required(),
  quantity: Joi.number().integer().min(1).required(),
  message: Joi.string().trim().max(1000).optional(),
  files: Joi.array().items(objectIdValidator).max(5).optional(),
}).unknown(false);

export const listSchema = createListSchema({
  filters: Joi.object({
    requirementFulfilled: Joi.boolean().truthy("true").falsy("false").optional(),
    product: objectIdValidator.optional(),
  }),
  sortFields: ["createdAt", "productName", "quantity"],
});

export const updateFulfillmentSchema = Joi.object({
  requirementFulfilled: Joi.boolean().required(),
}).unknown(false);
