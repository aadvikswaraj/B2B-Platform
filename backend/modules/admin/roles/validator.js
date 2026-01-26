import Joi from "joi";
import { objectIdValidator } from "../../../utils/customValidators.js";
// listSchema removed

export const createSchema = Joi.object({
  roleName: Joi.string().trim().min(3).max(100).required(),
  isSuperAdmin: Joi.boolean().default(false),
  permissions: Joi.object().default({}),
  isActive: Joi.boolean().default(true),
}).unknown(false);

export const updateSchema = Joi.object({
  roleName: Joi.string().trim().min(3).max(100).optional(),
  isSuperAdmin: Joi.boolean().optional(),
  permissions: Joi.object().optional(),
  isActive: Joi.boolean().optional(),
})
  .min(1)
  .unknown(false);

export const deleteSchema = Joi.object({
  strategy: Joi.string()
    .valid("reassign", "delete-users", "none")
    .default("none"),
  targetRoleId: Joi.string().when("strategy", {
    is: "reassign",
    then: objectIdValidator.required(),
    otherwise: Joi.forbidden(),
  }),
}).unknown(false);
