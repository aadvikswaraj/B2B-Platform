import Joi from "joi";
import { objectIdValidator } from "../../../utils/customValidators.js";
// listSchema removed

export const respondSchema = Joi.object({
  response: Joi.string().trim().min(10).max(1000).required(),
}).unknown(false);
