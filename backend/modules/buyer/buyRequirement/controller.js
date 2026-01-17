import * as buyRequirementService from "./service.js";
import { validateCreateRequirement } from "./validator.js";
import { sendResponse } from "../../../middleware/responseTemplate.js";
import { createListController } from "../../../utils/listQueryHandler.js";

/**
 * Create new buy requirement

 */
export const create = async (req, res) => {
  try {
    const { error } = validateCreateRequirement(req.body);
    if (error) {
      res.locals.response = {
        success: false,
        message: error.details[0].message,
        status: 400,
      };
      return sendResponse(res);
    }

    const { productName, description, quantity, unit } = req.body;

    const newRequirement = await buyRequirementService.createRequirement({
      user: req.user._id,
      productName,
      description,
      quantity,
      unit,
      status: "active",
      generatedByInquiry: false,
      verification: {
        status: "pending",
      },
    });

    res.locals.response = {
      success: true,
      message: "Buy requirement posted successfully",
      status: 201,
      data: newRequirement,
    };
  } catch (error) {
    console.error("Error posting buy requirement:", error);
    res.locals.response = {
      success: false,
      message: "Failed to post requirement",
      status: 500,
    };
  }
  return sendResponse(res);
};

/**
 * List all buy requirements with pagination, search, and filters
 */
export const list = createListController({
  service: buyRequirementService.list,
  searchFields: ["productName", "description"],
  buildQuery: (filters, req) => ({
    user: req.user._id,
    ...(filters?.status && { status: filters.status }),
    ...(filters?.generatedByInquiry !== undefined && {
      generatedByInquiry: filters.generatedByInquiry,
    }),
  }),
});

/**
 * Get buy requirement by ID
 */
export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const requirement = await buyRequirementService.getById(id, req.user._id);

    if (!requirement) {
      res.locals.response = {
        success: false,
        message: "Buy requirement not found",
        status: 404,
      };
    } else {
      res.locals.response = {
        success: true,
        data: requirement,
        status: 200,
      };
    }
  } catch (error) {
    console.error("Error in getById:", error);
    res.locals.response = {
      success: false,
      message: error.message || "Failed to fetch buy requirement",
      status: 500,
    };
  }
  return sendResponse(res);
};

/**
 * Update buy requirement
 */
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const requirement = await buyRequirementService.update(
      id,
      req.user._id,
      req.body
    );

    if (!requirement) {
      res.locals.response = {
        success: false,
        message: "Buy requirement not found",
        status: 404,
      };
    } else {
      res.locals.response = {
        success: true,
        message: "Buy requirement updated successfully",
        status: 200,
        data: requirement,
      };
    }
  } catch (error) {
    console.error("Error in update:", error);
    res.locals.response = {
      success: false,
      message: error.message || "Failed to update buy requirement",
      status: 500,
    };
  }
  return sendResponse(res);
};

/**
 * Update status
 */
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const requirement = await buyRequirementService.updateStatus(
      id,
      req.user._id,
      status
    );

    if (!requirement) {
      res.locals.response = {
        success: false,
        message: "Buy requirement not found",
        status: 404,
      };
    } else {
      res.locals.response = {
        success: true,
        message: `Buy requirement marked as ${status}`,
        status: 200,
        data: requirement,
      };
    }
  } catch (error) {
    console.error("Error in updateStatus:", error);
    res.locals.response = {
      success: false,
      message: error.message || "Failed to update status",
      status: 500,
    };
  }
  return sendResponse(res);
};

/**
 * Delete buy requirement
 */
export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await buyRequirementService.remove(id, req.user._id);

    if (!deleted) {
      res.locals.response = {
        success: false,
        message: "Buy requirement not found",
        status: 404,
      };
    } else {
      res.locals.response = {
        success: true,
        message: "Buy requirement deleted successfully",
        status: 200,
      };
    }
  } catch (error) {
    console.error("Error in remove:", error);
    res.locals.response = {
      success: false,
      message: error.message || "Failed to delete buy requirement",
      status: 500,
    };
  }
  return sendResponse(res);
};
