import Joi from "joi";
import { objectIdValidator } from "../../../utils/customValidators.js";

export const saveStepSchema = Joi.object({
  step: Joi.string()
    .valid("businessKYC", "bankAccount", "additionalDetails", "pickupAddress")
    .required(),
  pan: Joi.string().trim().allow("", null).optional(),
  gstin: Joi.string().trim().allow("", null).optional(),
  accountNumber: Joi.string().trim().allow("", null).optional(),
  ifsc: Joi.string().trim().uppercase().allow("", null).optional(),
  accountHolder: Joi.string().trim().allow("", null).optional(),
  pickupAddress: Joi.object({
    addressLine1: Joi.string().trim().required(),
    addressLine2: Joi.string().trim().allow("", null).optional(),
    city: Joi.string().trim().required(),
    state: Joi.string().trim().required(),
    pincode: Joi.string().trim().pattern(/^\d{6}$/).required(),
    phone: Joi.string().trim().pattern(/^\d{10}$/).required(),
  })
    .allow(null)
    .optional(),
  contactPerson: Joi.string().trim().allow("", null).optional(),
  businessCategory: Joi.string().trim().allow("", null).optional(),
  employeeCount: Joi.string().trim().allow("", null).optional(),
  annualTurnover: Joi.string().trim().allow("", null).optional(),
  description: Joi.string().trim().max(1000).allow("", null).optional(),
  panFile: objectIdValidator.optional(),
  gstinFile: objectIdValidator.optional(),
  signatureFile: objectIdValidator.optional(),
  cancelledChequeFile: objectIdValidator.optional(),
}).unknown(false);
