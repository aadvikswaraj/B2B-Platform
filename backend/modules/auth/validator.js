import Joi from "joi";

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
}).unknown(false);

export const verifyEmailSchema = Joi.object({
    action: Joi.string().valid("send-verification", "verify-otp").required(),
    email: Joi.string().email().required(),
    name: Joi.string().trim().min(2).when('action', {
        is: 'send-verification',
        then: Joi.required(),
        otherwise: Joi.forbidden()
    }),
    phone: Joi.string().pattern(/^[0-9]{10}$/).when('action', {
        is: 'send-verification',
        then: Joi.required(),
        otherwise: Joi.forbidden()
    }),
    password: Joi.string().min(6).when('action', {
        is: 'send-verification',
        then: Joi.required(),
        otherwise: Joi.forbidden()
    }),
    otp: Joi.string().length(6).when('action', {
        is: 'verify-otp',
        then: Joi.required(),
        otherwise: Joi.forbidden()
    }),
}).unknown(false);

export const signupSchema = Joi.object({
    key: Joi.string().required(),
}).unknown(false);
