import Joi from "joi";

export const profileSchema = Joi.object({
    name: Joi.string().optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().optional(),
    avatarUrl: Joi.string().optional(),
    productCategories: Joi.array().items(Joi.string()).optional(),
    socials: Joi.object().optional(),
    companyName: Joi.string().optional(),
    businessType: Joi.string().optional(),
    gstin: Joi.string().optional(),
    pan: Joi.string().optional(),
    address: Joi.object().optional(),
    website: Joi.string().optional(),
    description: Joi.string().optional()
}).unknown(true);

export const validateProfile = (data) => profileSchema.validate(data);
