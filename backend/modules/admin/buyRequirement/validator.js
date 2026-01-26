import Joi from "joi";
import { objectIdValidator } from "../../../utils/customValidators.js";
// listSchema removed

export const getBuyRequirementSchema = Joi.object({
  buyRequirementId: objectIdValidator.required(),
}).unknown(false);

export const verifyBuyRequirementSchema = Joi.object({
  status: Joi.string().valid("verified", "rejected").required(),
  tags: Joi.array()
    .items(Joi.string())
    .allow("bulk", "local", "export", "sample_required")
    .optional(),
  category: objectIdValidator.when("status", {
    is: "verified",
    then: Joi.required(),
    otherwise: Joi.disallow(),
  }),
  rejectedReason: Joi.string().when("status", {
    is: "rejected",
    then: Joi.required(),
    otherwise: Joi.disallow(),
  }),
}).unknown(false);
