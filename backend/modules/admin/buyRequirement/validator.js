import Joi from "joi";
import { objectIdValidator } from "../../../utils/customValidators.js";
import { createListSchema } from "../../../utils/listQueryHandler.js";

export const listSchema = createListSchema({
  filters: Joi.object({
    quantity: Joi.number().min(0).optional(),
    unit: Joi.string().optional(),
    status: Joi.string().valid("active", "fulfilled", "expired").optional(),
    verificationStatus: Joi.string()
      .valid("pending", "verified", "rejected")
      .optional(),
  }),
  sortFields: ["createdAt", "productName", "quantity", "status"],
});

export const getBuyRequirementSchema = Joi.object({
  buyRequirementId: objectIdValidator.required(),
}).unknown(false);

export const verifyBuyRequirementSchema = Joi.object({
  status: Joi.string().valid("verified", "rejected").required(),
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
