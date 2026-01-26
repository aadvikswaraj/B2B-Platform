import Joi from "joi";
import { objectIdValidator } from "../../../utils/customValidators.js";

export const getContactSchema = Joi.object({
  sellerId: objectIdValidator.required(),
}).unknown(false);
