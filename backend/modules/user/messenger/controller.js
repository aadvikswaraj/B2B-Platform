import * as service from "./services.js";
import { sendResponse } from "../../../middleware/responseTemplate.js";

export const getContacts = async (req, res) => {
  try {
    const contacts = await service.getContactsService(req.user._id, req.query);
    res.locals.response = {
      success: true,
      data: contacts,
      message: "Contacts fetched successfully",
      status: 200,
    };
  } catch (error) {
    console.error("getContacts Error:", error);
    res.locals.response = {
      success: false,
      message: error.message,
      status: 500,
    };
  }
  return sendResponse(res);
};

export const getConversation = async (req, res) => {
  try {
    const conversation = await service.getConversationService(
      req.params.conversationId,
      req.user._id,
    );
    res.locals.response = {
      success: true,
      data: conversation,
      message: "Conversation fetched successfully",
      status: 200,
    };
  } catch (error) {
    console.error("getConversation Error:", error);
    res.locals.response = {
      success: false,
      message: error.message,
      status: 500,
    };
  }
  return sendResponse(res);
};

export const getMessages = async (req, res) => {
  try {
    const messages = await service.getMessagesService(
      req.params.conversationId,
      req.user._id,
      req.query,
    );
    res.locals.response = {
      success: true,
      data: messages,
      message: "Messages fetched successfully",
      status: 200,
    };
  } catch (error) {
    console.error("getMessages Error:", error);
    res.locals.response = {
      success: false,
      message: error.message,
      status: 500,
    };
  }
  return sendResponse(res);
};

export const sendMessage = async (req, res) => {
  try {
    const message = await service.sendMessageService(
      req.user._id,
      req.body,
      req.io,
    );
    res.locals.response = {
      success: true,
      data: message,
      message: "Message sent successfully",
      status: 200,
    };
  } catch (error) {
    console.error("sendMessage Error:", error);
    res.locals.response = {
      success: false,
      message: error.message,
      status: 500,
    };
  }
  return sendResponse(res);
};

export const updateConversationMeta = async (req, res) => {
  try {
    const updated = await service.updateConversationMetaService(
      req.params.conversationId,
      req.user._id,
      req.body,
    );
    res.locals.response = {
      success: true,
      data: updated,
      message: "Conversation meta updated successfully",
      status: 200,
    };
  } catch (error) {
    console.error("updateConversationMeta Error:", error);
    res.locals.response = {
      success: false,
      message: error.message,
      status: 500,
    };
  }
  return sendResponse(res);
};

export const startConversation = async (req, res) => {
  try {
    const conversation = await service.startConversationService(
      req.user._id,
      req.body,
    );
    res.locals.response = {
      success: true,
      data: conversation,
      message: "Conversation started successfully",
      status: 200,
    };
  } catch (err) {
    console.error("startConversation Error:", err);
    res.locals.response = { success: false, message: err.message, status: 500 };
  }
  return sendResponse(res);
};
