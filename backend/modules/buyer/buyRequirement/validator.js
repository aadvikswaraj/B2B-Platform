import Joi from "joi";
// Force reload: Budget schema updated to Object

export const createRequirementSchema = Joi.object({
  productName: Joi.string().trim().min(2).max(200).required(),
  description: Joi.string().trim().min(10).max(2000).required(),
  quantity: Joi.number().integer().min(1).required(),
  unit: Joi.string().valid("pcs", "box", "kg", "ton", "ltr", "unit").required(),
  budget: Joi.object({
    min: Joi.number().min(0).required(),
    max: Joi.number().greater(Joi.ref("min")).required(),
  }).required(),
  city: Joi.string().trim().min(2).max(100).required(),
}).unknown(false);

// listSchema removed

export const updateStatusSchema = Joi.object({
  status: Joi.string().valid("active", "fulfilled").required(),
}).unknown(false);

export const validateCreateRequirement = (data) =>
  createRequirementSchema.validate(data);
