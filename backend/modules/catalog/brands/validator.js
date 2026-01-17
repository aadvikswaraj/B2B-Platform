import Joi from "joi";

// No validation needed for simple GET with query params usually, but can add if needed
export const listBrandsSchema = Joi.object({
    search: Joi.string().allow('', null),
    limit: Joi.number().integer().min(1).max(500)
});

export const validateListBrands = (data) => listBrandsSchema.validate(data);
