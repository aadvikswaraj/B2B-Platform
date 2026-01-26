import Joi from "joi";
import { objectIdValidator } from "../../../utils/customValidators.js";
// listSchema removed

export const verifyDecisionSchema = Joi.object({
  decision: Joi.string().valid("approved", "rejected").required(),
  isOrder: Joi.boolean().optional(),
  reason: Joi.string().when("decision", {
    is: "rejected",
    then: Joi.string().min(10).required(),
    otherwise: Joi.forbidden(),
  }),
}).unknown(false);
