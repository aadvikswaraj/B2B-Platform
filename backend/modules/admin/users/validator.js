import Joi from "joi";
import { objectIdValidator } from "../../../utils/customValidators.js";
import { createListSchema } from "../../../utils/listQueryHandler.js";

export const listSchema = createListSchema({
    filters: Joi.object({
        status: Joi.string().valid("active", "suspended").optional(),
        role: Joi.string().valid("admin", "seller", "buyer").optional(),
    }),
    sortFields: ["name", "email", "createdAt", "updatedAt"],
});

export const createAdminSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    adminRoleId: objectIdValidator.required(),
}).unknown(false);

export const updateSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).optional(),
    email: Joi.string().email().optional(),
    isAdmin: Joi.boolean().optional(),
    isSeller: Joi.boolean().optional(),
    userSuspended: Joi.boolean().optional(),
    adminRole: objectIdValidator.optional(),
}).min(1).unknown(false);
