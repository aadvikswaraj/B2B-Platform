import Joi from "joi";
import { objectIdValidator } from "../../../utils/customValidators.js";
import { createListSchema } from "../../../utils/listQueryHandler.js";

export const listBrandsSchema = createListSchema({
  filters: Joi.object({
    status: Joi.string().valid("pending", "approved", "rejected").optional(),
  }),
  sortFields: ["name", "createdAt", "updatedAt"],
});

export const verifyDecisionSchema = Joi.object({
  decision: Joi.string().valid("verified", "rejected").required(),
  reason: Joi.string().when("decision", {
    is: "rejected",
    then: Joi.required(),
    otherwise: Joi.disallow(),
  }),
}).unknown(false);
