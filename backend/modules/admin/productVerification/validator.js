import Joi from "joi";
import { objectIdValidator } from "../../../utils/customValidators.js";
import { createListSchema } from "../../../utils/listQueryHandler.js";

export const listSchema = createListSchema({
    filters: Joi.object({
        status: Joi.string().valid("pending", "approved", "rejected").optional(),
    }),
    sortFields: ["createdAt", "updatedAt"],
});

export const verifyDecisionSchema = Joi.object({
    decision: Joi.string().valid("approved", "rejected").required(),
    reason: Joi.string().when("decision", {
        is: "rejected",
        then: Joi.string().min(10).required(),
        otherwise: Joi.forbidden(),
    }),
}).unknown(false);
