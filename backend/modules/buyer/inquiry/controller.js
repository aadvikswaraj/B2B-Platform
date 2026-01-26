import * as inquiryService from "./service.js";
import { Conversation, Message } from "../../../models/model.js";
import { sendResponse } from "../../../middleware/responseTemplate.js";
// list function removed

/**
 * Create new inquiry
 */
export const create = async (req, res) => {
  try {
    const data = {
      ...req.body,
      user: req.user._id,
    };

    const inquiry = await inquiryService.create(data);

    res.locals.response = {
      success: true,
      message: "Inquiry sent successfully",
      status: 201,
      data: inquiry,
    };
  } catch (error) {
    console.error("Error in create:", error);
    res.locals.response = {
      success: false,
      message: error.message || "Failed to send inquiry",
      status: error.message === "Product not found" ? 404 : 500,
    };
  }
  return sendResponse(res);
};

/**
 * Get inquiry by ID
 */
export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const inquiry = await inquiryService.getById(id, req.user._id);

    if (!inquiry) {
      res.locals.response = {
        success: false,
        message: "Inquiry not found",
        status: 404,
      };
    } else {
      res.locals.response = {
        success: true,
        data: inquiry,
        status: 200,
      };
    }
  } catch (error) {
    console.error("Error in getById:", error);
    res.locals.response = {
      success: false,
      message: error.message || "Failed to fetch inquiry",
      status: 500,
    };
  }
  return sendResponse(res);
};

/**
 * Update fulfillment status
 */
export const updateFulfillment = async (req, res) => {
  try {
    const { id } = req.params;
    const { requirementFulfilled } = req.body;

    const inquiry = await inquiryService.updateFulfillment(
      id,
      req.user._id,
      requirementFulfilled,
    );

    const message = requirementFulfilled
      ? "Inquiry marked as fulfilled"
      : "Inquiry marked as not fulfilled and buy requirement created";

    res.locals.response = {
      success: true,
      message,
      status: 200,
      data: inquiry,
    };
  } catch (error) {
    console.error("Error in updateFulfillment:", error);
    res.locals.response = {
      success: false,
      message: error.message || "Failed to update fulfillment status",
      status: error.message === "Inquiry not found" ? 404 : 500,
    };
  }
  return sendResponse(res);
};
