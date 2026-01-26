import Joi from "joi";
import { objectIdValidator } from "../../../utils/customValidators.js";
// listBrandsSchema removed

export const verifyDecisionSchema = Joi.object({
  decision: Joi.string().valid("verified", "rejected").required(),
  reason: Joi.string().when("decision", {
    is: "rejected",
    then: Joi.required(),
    otherwise: Joi.disallow(),
  }),
}).unknown(false);
