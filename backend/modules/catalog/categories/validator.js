import Joi from "joi";

// No complex validation for GET params needed usually
export const listCategoriesSchema = Joi.object({
    search: Joi.string().allow('', null),
    page: Joi.number().integer().min(1),
    pageSize: Joi.number().integer().min(1).max(100),
    parent: Joi.string().allow('any', 'root', null),
    depth: Joi.number().integer(),
    sort: Joi.string()
});

export const validateListCategories = (data) => listCategoriesSchema.validate(data);
