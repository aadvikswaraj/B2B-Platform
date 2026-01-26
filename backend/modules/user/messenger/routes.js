import express from "express";
import * as controller from "./controller.js";
import requireAuthentication from "../../../middleware/requireAuthentication.js";
import { validateRequest } from "../../../utils/customValidators.js";
import * as validator from "./validators.js";

const router = express.Router();

router.get(
  "/contacts",
  requireAuthentication,
  validateRequest(validator.getContactsSchema, "query"),
  controller.getContacts,
);

router.get(
  "/conversations/:conversationId",
  requireAuthentication,
  // No body/query validation needed for just ID param which is usually checked by route matching or handled in controller/service
  // But we can validate param if we want. usually we rely on controller handling 'not found'.
  controller.getConversation,
);

router.get(
  "/:conversationId/messages",
  requireAuthentication,
  validateRequest(validator.getMessagesSchema, "query"),
  controller.getMessages,
);

router.post(
  "/send",
  requireAuthentication,
  validateRequest(validator.sendMessageSchema),
  controller.sendMessage,
);

router.post(
  "/start",
  requireAuthentication,
  validateRequest(validator.startConversationSchema),
  controller.startConversation,
);

router.patch(
  "/:conversationId/meta",
  requireAuthentication,
  validateRequest(validator.updateConversationMetaSchema),
  controller.updateConversationMeta,
);

export default router;
