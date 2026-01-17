import Joi from "joi";
import { objectIdValidator } from "../../../utils/customValidators.js";
import { createListSchema } from "../../../utils/listQueryHandler.js";

export const listSchema = createListSchema({
  filters: Joi.object({
    status: Joi.string().valid("pending", "verified", "rejected").optional(),
  }),
  sortFields: ["name", "createdAt"],
});

export const createSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  proofFile: objectIdValidator.required(),
}).unknown(false);

export const updateSchema = createSchema;

export const deleteSchema = Joi.object({
  newBrandId: objectIdValidator.optional(),
}).unknown(false);
