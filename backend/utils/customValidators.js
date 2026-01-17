import Joi from "joi";
import mongoose from "mongoose";
import { sendResponse } from "../middleware/responseTemplate.js";

export const validateRequest = (schema, source = "body") => {
  return (req, res, next) => {
    const dataToValidate =
      source === "query"
        ? req.query
        : source === "params"
        ? req.params
        : req.body;

    const { error, value } = schema.validate(dataToValidate);
    if (error) {
      res.locals.response = {
        success: false,
        message: "Invalid request data error: " + error.message,
        status: 400,
      };
      return sendResponse(res);
    } else {
      if (source === "query") {
        // Store validated query with parsed objects on req.validatedQuery because req.query is immutable
        req.validatedQuery = value;
      } else if (source === "params") {
        req.params = value;
      } else {
        req.body = value;
      }
      next();
    }
  };
};

export const fileObjectValidator = Joi.any()
  .custom((value, helpers) => {
    const ALLOWED_MIME_TYPES = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "application/pdf",
    ];
    // allow null / undefined if optional
    if (!value) return helpers.error("any.required");

    // multer-style file object
    if (typeof value !== "object") {
      return helpers.error("any.invalid");
    }

    const { mimetype } = value;

    if (!mimetype || !ALLOWED_MIME_TYPES.includes(mimetype)) {
      return helpers.error("file.invalidMime");
    }

    return value;
  }, "File object validation")
  .messages({
    "any.required": "File is required",
    "any.invalid": "Invalid file object",
    "file.invalidMime": "Unsupported file type",
  });

export const jsonStringToObject = (innerSchema = Joi.object()) =>
  Joi.custom((value, helpers) => {
    // Allow null or undefined
    if (value === null || value === undefined) {
      return value;
    }

    // Handle empty string or whitespace
    if (typeof value === "string" && value.trim() === "") {
      return null;
    }

    let parsed = value;

    // Parse JSON string
    if (typeof value === "string") {
      try {
        parsed = JSON.parse(value);
      } catch {
        return helpers.error("any.invalid");
      }
    }

    // Validate against inner schema
    const { error, value: validated } = innerSchema.validate(parsed);
    if (error) {
      return helpers.error("any.invalid");
    }
    return validated;
  }, "JSON string to object");

export const objectIdValidator = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
}, "ObjectId validation");

export const reqFileValidator = ({ allowedMimeTypes = [] } = {}) =>
  Joi.object({
    mimetype: Joi.string().required(),
    buffer: Joi.any().optional(), // some devices may not expose buffer
  }).custom((file, helpers) => {
    if (allowedMimeTypes.length && !allowedMimeTypes.includes(file.mimetype)) {
      return helpers.error("any.invalid");
    }
    return file;
  }, "File mimetype validation");
