import Joi from "joi";
import { objectIdValidator } from "../../../utils/customValidators.js";
// listSchema removed

export const createSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  proofFile: objectIdValidator.required(),
}).unknown(false);

export const updateSchema = createSchema;

export const deleteSchema = Joi.object({
  newBrandId: objectIdValidator.optional(),
}).unknown(false);
