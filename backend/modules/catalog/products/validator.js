import Joi from "joi";
import { createListSchema } from "../../../utils/listQueryHandler.js";
import { objectIdValidator } from "../../../utils/customValidators.js";

// listSchema removed

export const getByIdSchema = Joi.object({
  id: objectIdValidator.required(),
}).unknown(false);
