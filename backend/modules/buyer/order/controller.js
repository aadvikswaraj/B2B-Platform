import * as orderService from "./service.js";
import { sendResponse } from "../../../middleware/responseTemplate.js";
import { createListController } from "../../../utils/listQueryHandler.js";
import { getOrCreateCart } from "../cart/service.js";

/**
 * Create order from cart or provided items
 */
export const createOrder = async (req, res) => {
  try {
    let { cartCheckout, items } = req.body;
    let userId = req.session?.user?._id;
    if (cartCheckout) {
      items = (await getOrCreateCart(userId))?.items;
    }

    if (!items || items.length === 0) {
      res.locals.response = {
        success: false,
        message: "No items to order",
        status: 400,
      };
      return sendResponse(res);
    }

    const order = await orderService.createOrder(userId, cartCheckout, items);

    res.locals.response = {
      success: true,
      message: "Order created successfully",
      status: 201,
      data: {
        order,
      },
    };
  } catch (error) {
    console.error("Error in createOrder:", error);
    const status =
      error.message.includes("not found") ||
      error.message.includes("not available") ||
      error.message.includes("Minimum order")
        ? 400
        : 500;

    res.locals.response = {
      success: false,
      message: error.message || "Failed to create order",
      status,
    };
  }
  return sendResponse(res);
};
/**
 * Add shipping address to order
 */
export const addShippingAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { shippingAddressId } = req.body;
    const userId = req.session?.user?._id;

    await orderService.addShippingAddressToOrder(id, shippingAddressId, userId);

    res.locals.response = {
      success: true,
      message: "Shipping address added successfully",
      status: 200,
    };
  } catch (error) {
    console.error("Error in addShippingAddress:", error);
    const status = error.message.includes("not found") ? 404 : 500;

    res.locals.response = {
      success: false,
      message: error.message || "Failed to add shipping address",
      status,
    };
  }
  return sendResponse(res);
};

/**
 * Create payment for order
 */
export const createPaymentForOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const paymentData = await orderService.createPaymentForOrder(
      orderId,
      req.user._id,
    );

    res.locals.response = {
      success: true,
      message: "Payment created successfully",
      status: 201,
      data: paymentData,
    };
  } catch (error) {
    console.error("Error in createPayment:", error);
    const status =
      error.message === "Order not found"
        ? 404
        : error.message === "Order already paid"
          ? 400
          : 500;

    res.locals.response = {
      success: false,
      message: error.message || "Failed to create payment",
      status,
    };
  }
  return sendResponse(res);
};

/**
 * Verify payment
 */
export const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const result = await orderService.verifyPayment(
      req.user._id,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    );

    res.locals.response = {
      success: true,
      message: "Payment verified successfully",
      status: 200,
      data: result,
    };
  } catch (error) {
    console.error("Error in verifyPayment:", error);
    const status =
      error.message === "Payment not found"
        ? 404
        : error.message === "Invalid payment signature"
          ? 400
          : 500;

    res.locals.response = {
      success: false,
      message: error.message || "Payment verification failed",
      status,
    };
  }
  return sendResponse(res);
};

/**
 * Demo payment (for testing and portfolio demonstration)
 * Allows user-controlled payment outcome simulation
 */
export const demoPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, source } = req.body;
    const userId = req.session?.user?._id;

    const result = await orderService.processDemoPayment(id, userId, status);

    res.locals.response = {
      success: true,
      message: `Demo payment marked as ${status.toLowerCase()}`,
      status: 200,
      data: result,
    };
  } catch (error) {
    console.error("Error in demoPayment:", error);
    const status = error.message === "Order not found" ? 404 : 500;

    res.locals.response = {
      success: false,
      message: error.message || "Failed to process demo payment",
      status,
    };
  }
  return sendResponse(res);
};

/**
 * List all orders
 */
/**
 * List orders with unified view (Orders vs Returns)
 */
export const list = async (req, res) => {
  try {
    const { view, status, page, limit } = req.query;
    const result = await orderService.listOrders(req.user._id, {
      view,
      status,
      page,
      limit,
    });

    res.locals.response = {
      success: true,
      data: result.docs,
      meta: {
        total: result.totalCount,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
      },
      status: 200,
    };
  } catch (error) {
    console.error("Error in listOrders:", error);
    res.locals.response = {
      success: false,
      message: error.message || "Failed to fetch orders",
      status: 500,
    };
  }
  return sendResponse(res);
};

/**
 * Get order by ID
 */
export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await orderService.getById(id, req.user._id);

    if (!data) {
      res.locals.response = {
        success: false,
        message: "Order not found",
        status: 404,
      };
    } else {
      res.locals.response = {
        success: true,
        data,
        status: 200,
      };
    }
  } catch (error) {
    console.error("Error in getById:", error);
    res.locals.response = {
      success: false,
      message: error.message || "Failed to fetch order",
      status: 500,
    };
  }
  return sendResponse(res);
};

/**
 * Cancel order
 */
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await orderService.cancelOrder(id, req.user._id, reason);

    res.locals.response = {
      success: true,
      message: "Order cancelled successfully",
      status: 200,
      data: order,
    };
  } catch (error) {
    console.error("Error in cancelOrder:", error);
    const status =
      error.message === "Order not found"
        ? 404
        : error.message.includes("Cannot cancel") ||
            error.message.includes("already")
          ? 400
          : 500;

    res.locals.response = {
      success: false,
      message: error.message || "Failed to cancel order",
      status,
    };
  }
  return sendResponse(res);
};

/**
 * Get order statistics
 */
export const getStats = async (req, res) => {
  try {
    const stats = await orderService.getOrderStats(req.user._id);

    res.locals.response = {
      success: true,
      data: stats,
      status: 200,
    };
  } catch (error) {
    console.error("Error in getStats:", error);
    res.locals.response = {
      success: false,
      message: error.message || "Failed to fetch statistics",
      status: 500,
    };
  }
  return sendResponse(res);
};

/**
 * Request refund for an item
 */
export const requestRefund = async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      throw new Error("Refund reason is required");
    }

    const order = await orderService.requestRefund(
      id,
      itemId,
      req.user._id,
      reason,
    );

    res.locals.response = {
      success: true,
      message: "Refund requested successfully",
      status: 200,
      data: order,
    };
  } catch (error) {
    console.error("Error in requestRefund:", error);
    res.locals.response = {
      success: false,
      message: error.message || "Failed to request refund",
      status: error.message.includes("not found") ? 404 : 400,
    };
  }
  return sendResponse(res);
};
