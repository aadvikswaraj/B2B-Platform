import Joi from "joi";
import { objectIdValidator } from "../../../utils/customValidators.js";

export const MIME = {
  IMAGE: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  VIDEO: ["video/mp4", "video/webm", "video/quicktime"],
  PDF: ["application/pdf"],
};

export const fileIdSchema = Joi.object({
  fileId: objectIdValidator.required(),
}).unknown(false);
