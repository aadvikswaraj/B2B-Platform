import Joi from "joi";
import { objectIdValidator } from "../../../utils/customValidators.js";

export const addToCartSchema = Joi.object({
  product: objectIdValidator.required(),
  quantity: Joi.number().integer().min(1).required(),
}).unknown(false);

export const updateQuantitySchema = Joi.object({
  quantity: Joi.number().integer().min(1).required(),
}).unknown(false);

export const removeFromCartSchema = Joi.object({
  product: objectIdValidator.required(),
}).unknown(false);
