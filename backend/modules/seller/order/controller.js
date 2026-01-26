import * as orderService from "./service.js";
import { sendResponse } from "../../../middleware/responseTemplate.js";

export const getOrders = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const orders = await orderService.getSellerOrders(sellerId, req.query);

    res.locals.response = {
      success: true,
      data: orders,
    };
  } catch (error) {
    res.locals.response = {
      success: false,
      message: error.message,
      status: 500,
    };
  }
  return sendResponse(res);
};

export const updateMainStatus = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { status, reason } = req.body;
    const sellerId = req.user._id;

    const result = await orderService.updateItemFulfilment(
      orderId,
      itemId,
      sellerId,
      status,
      { reason },
    );

    res.locals.response = {
      success: true,
      message: `Item status updated to ${status}`,
      data: result,
    };
  } catch (error) {
    res.locals.response = {
      success: false,
      message: error.message,
      status: error.message.includes("Invalid state") ? 400 : 500,
    };
  }
  return sendResponse(res);
};

export const processRefund = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { decision, reason } = req.body; // decision: approved | denied
    const sellerId = req.user._id;

    const result = await orderService.handleRefundDecision(
      orderId,
      itemId,
      sellerId,
      decision,
      reason,
    );

    res.locals.response = {
      success: true,
      message: `Refund ${decision}`,
      data: result,
    };
  } catch (error) {
    res.locals.response = {
      success: false,
      message: error.message,
      status: 400,
    };
  }
  return sendResponse(res);
};
