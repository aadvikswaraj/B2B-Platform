import * as inquiryService from "./service.js";
import { sendResponse } from "../../../middleware/responseTemplate.js";
import { createListController } from "../../../utils/listQueryHandler.js";

/**
 * List all inquiries received by seller
 */
export const list = createListController({
  service: inquiryService.list,
  searchFields: ["productName", "message"],
  filterMap: {
    requirementFulfilled: (v) => ({ requirementFulfilled: v }),
    product: (v) => ({ product: v }),
  },
  callService: (service, { query, skip, pageSize, sort, req }) =>
    service(req.user._id, query, skip, pageSize, sort),
});

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
 * Get inquiry statistics
 */
export const getStats = async (req, res) => {
  try {
    const stats = await inquiryService.getInquiryStats(req.user._id);

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
 * Get inquiries for a specific product
 */
export const getByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const inquiries = await inquiryService.getByProduct(productId, req.user._id);

    res.locals.response = {
      success: true,
      data: {
        inquiries,
        count: inquiries.length,
      },
      status: 200,
    };
  } catch (error) {
    console.error("Error in getByProduct:", error);
    res.locals.response = {
      success: false,
      message: error.message || "Failed to fetch product inquiries",
      status: error.message === "Product not found" ? 404 : 500,
    };
  }
  return sendResponse(res);
};

/**
 * Get recent inquiries
 */
export const getRecent = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const inquiries = await inquiryService.getRecentInquiries(req.user._id, limit);

    res.locals.response = {
      success: true,
      data: {
        inquiries,
        count: inquiries.length,
      },
      status: 200,
    };
  } catch (error) {
    console.error("Error in getRecent:", error);
    res.locals.response = {
      success: false,
      message: error.message || "Failed to fetch recent inquiries",
      status: 500,
    };
  }
  return sendResponse(res);
};
