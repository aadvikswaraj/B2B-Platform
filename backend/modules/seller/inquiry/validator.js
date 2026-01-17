import Joi from "joi";
import { objectIdValidator } from "../../../utils/customValidators.js";
import { createListSchema } from "../../../utils/listQueryHandler.js";

export const listSchema = createListSchema({
  filters: Joi.object({
    requirementFulfilled: Joi.boolean().truthy("true").falsy("false").optional(),
    product: objectIdValidator.optional(),
  }),
  sortFields: ["createdAt", "productName", "quantity"],
});

export const respondSchema = Joi.object({
  response: Joi.string().trim().min(10).max(1000).required(),
}).unknown(false);
