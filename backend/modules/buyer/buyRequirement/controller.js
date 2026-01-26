import * as buyRequirementService from "./service.js";

import { sendResponse } from "../../../middleware/responseTemplate.js";
import { createListController } from "../../../utils/listQueryHandler.js";

/**
 * Create new buy requirement

 */
export const create = async (req, res) => {
  try {
    const { productName, description, quantity, unit, budget, city } = req.body;

    const newRequirement = await buyRequirementService.createRequirement({
      user: req.user._id,
      productName,
      description,
      quantity,
      unit,
      budget,
      city,
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
// list function removed

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
 * Update status
 */
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const requirement = await buyRequirementService.updateStatus(
      id,
      req.user._id,
      status,
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
