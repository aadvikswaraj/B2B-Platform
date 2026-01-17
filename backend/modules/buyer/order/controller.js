import * as orderService from "./service.js";
import { sendResponse } from "../../../middleware/responseTemplate.js";
import { createListController } from "../../../utils/listQueryHandler.js";

/**
 * Create order from cart or provided items
 */
export const createOrder = async (req, res) => {
  try {
    const { shippingAddress, items } = req.body;

    const orders = await orderService.createOrder(
      req.user._id,
      shippingAddress,
      items
    );

    res.locals.response = {
      success: true,
      message: `${orders.length} order(s) created successfully`,
      status: 201,
      data: {
        orders,
        orderCount: orders.length,
      },
    };
  } catch (error) {
    console.error("Error in createOrder:", error);
    const status =
      error.message === "Shipping address not found"
        ? 404
        : error.message.includes("not found") || error.message.includes("not available") || error.message.includes("Minimum order")
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
 * Create payment for order

 */
export const createPayment = async (req, res) => {
  try {
    const { orderId } = req.params;

    const paymentData = await orderService.createPayment(orderId, req.user._id);

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
      razorpaySignature
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
 * List all orders
 */
export const list = createListController({
  service: orderService.list,
  searchFields: ["items.title"],
  buildQuery: (filters, req) => ({
    buyerId: req.user._id,
    ...(filters?.status && { status: filters.status }),
    ...(filters?.paymentStatus && { paymentStatus: filters.paymentStatus }),
    ...(filters?.sellerId && { sellerId: filters.sellerId }),
  }),
});

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
        : error.message.includes("Cannot cancel") || error.message.includes("already")
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
