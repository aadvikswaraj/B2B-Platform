import Joi from "joi";

export const addressSchema = Joi.object({
    isDefault: Joi.boolean().optional(),
    name: Joi.string().required(),
    phone: Joi.string().regex(/^[6-9]\d{9}$/).required(),
    addressLine1: Joi.string().required(),
    addressLine2: Joi.string().optional(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    pincode: Joi.string().regex(/^[1-9][0-9]{5}$/).required(),
    // Add other address fields as needed, e.g. street, city, etc.
    // For now allowing unknown to match existing flexibility
}).unknown(true);

export const validateAddress = (data) => addressSchema.validate(data);
