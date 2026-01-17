import Joi from "joi";
import { objectIdValidator } from "../../../utils/customValidators.js";
import { createListSchema } from "../../../utils/listQueryHandler.js";

export const listSchema = createListSchema({
    filters: Joi.object({
        status: Joi.string().valid("pending", "verified", "rejected").optional(),
    }),
    sortFields: ["createdAt", "updatedAt"],
});

export const verifyKYCSectionSchema = Joi.object({
    section: Joi.string().valid("pan", "gstin", "signature", "bankAccount").required(),
    decision: Joi.string().valid("verified", "rejected").required(),
    reason: Joi.string().when("decision", {
        is: "rejected",
        then: Joi.string().min(10).required(),
        otherwise: Joi.forbidden(),
    }),
}).unknown(false);

export const verifyDecisionSchema = Joi.object({
    decision: Joi.string().valid("verified", "rejected").required(),
    reason: Joi.string().when("decision", {
        is: "rejected",
        then: Joi.string().min(10).required(),
        otherwise: Joi.optional(),
    }),
}).unknown(false);
