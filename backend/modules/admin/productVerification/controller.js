import * as productVerificationService from "./service.js";
import { sendResponse } from "../../../middleware/responseTemplate.js";
// list function removed

/**
 * Get product verification by ID
 */
export const getById = async (req, res) => {
  try {
    const { productId } = req.params;
    const data = await productVerificationService.getById(productId);

    if (!data) {
      res.locals.response = {
        success: false,
        message: "Product not found",
        status: 404,
      };
    } else {
      // Return raw image data, frontend will handle URLs

      res.locals.response = {
        success: true,
        message: "Product verification fetched successfully",
        status: 200,
        data,
      };
    }
  } catch (error) {
    console.error("Error in getById:", error);
    res.locals.response = {
      success: false,
      message: error.message,
      status: 500,
    };
  }
  return sendResponse(res);
};

/**
 * Verify or reject product
 */
export const verifyDecision = async (req, res) => {
  try {
    const { productId } = req.params;
    const { decision, reason, isOrder } = req.body;

    if (decision !== "approved" && decision !== "rejected") {
      res.locals.response = {
        success: false,
        message: "Invalid decision. Use 'approved' or 'rejected'",
        status: 400,
      };
      return sendResponse(res);
    }

    const product = await productVerificationService.verifyProduct(
      productId,
      decision,
      reason,
      req.user?._id,
      isOrder,
    );

    if (!product) {
      res.locals.response = {
        success: false,
        message: "Product not found",
        status: 404,
      };
      return sendResponse(res);
    }

    res.locals.response = {
      success: true,
      message: `Product ${decision} successfully`,
      status: 200,
      data: {
        _id: product._id,
        status: product.status,
        isApproved: product.isApproved,
        moderation: product.moderation,
      },
    };
  } catch (error) {
    console.error("Error in verifyDecision:", error);
    res.locals.response = {
      success: false,
      message: error.message,
      status: 500,
    };
  }
  return sendResponse(res);
};

/**
 * Update product tags
 */
export const updateTags = async (req, res) => {
  try {
    const { productId } = req.params;
    const { tags } = req.body;

    if (!Array.isArray(tags)) {
      res.locals.response = {
        success: false,
        message: "Tags must be an array",
        status: 400,
      };
      return sendResponse(res);
    }

    const product = await productVerificationService.updateTags(
      productId,
      tags,
    );

    if (!product) {
      res.locals.response = {
        success: false,
        message: "Product not found",
        status: 404,
      };
      return sendResponse(res);
    }

    res.locals.response = {
      success: true,
      message: "Tags updated successfully",
      status: 200,
      data: {
        _id: product._id,
        tags: product.tags,
      },
    };
  } catch (error) {
    console.error("Error in updateTags:", error);
    res.locals.response = {
      success: false,
      message: error.message,
      status: 500,
    };
  }
  return sendResponse(res);
};
