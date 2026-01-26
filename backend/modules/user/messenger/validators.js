import Joi from "joi";
import { objectIdValidator } from "../../../utils/customValidators.js";

// GET /contacts
export const getContactsSchema = Joi.object({
  filter: Joi.string().valid("all", "unread", "starred").optional(),
  search: Joi.string().allow("").optional(),
});

// GET /:conversationId/messages
export const getMessagesSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

// POST /send
export const sendMessageSchema = Joi.object({
  conversationId: objectIdValidator.required(),
  content: Joi.string().allow("").optional(),
  files: Joi.array().items(objectIdValidator).optional(),
  type: Joi.string().valid("text", "image", "file", "system").default("text"),
  metadata: Joi.object().optional(),
}).or("content", "files"); // Require at least one of content or files

// PATCH /:conversationId/meta
export const updateConversationMetaSchema = Joi.object({
  muted: Joi.boolean().optional(),
  pinned: Joi.boolean().optional(),
  blocked: Joi.boolean().optional(),
  tags: Joi.array()
    .items(
      Joi.object({
        text: Joi.string().required(),
        color: Joi.string().optional(),
      }),
    )
    .optional(),
  notes: Joi.string().allow("").optional(),
}).min(1);

// POST /start
export const startConversationSchema = Joi.object({
  targetUserId: objectIdValidator.required(),
  context: Joi.object({
    type: Joi.string().required(),
    id: objectIdValidator.required(),
  }).optional(),
  initialMessage: Joi.string().allow("").optional(),
});
