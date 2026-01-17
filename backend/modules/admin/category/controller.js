import * as categoryService from "./service.js";
import { sendResponse } from "../../../middleware/responseTemplate.js";

export const create = async (req, res) => {
  try {
    const body = req.body;

    const cat = await categoryService.createCategory(body);
    res.locals.response = {
      success: true,
      data: cat,
      message: "Category created successfully",
      status: 200
    }
  } catch (error) {
    if (error.code === 11000) {
      res.locals.response = {
        success: false,
        status: 409,
        message: "Category name already exists"
      };
    } else {
      res.locals.response = {
        success: false,
        status: 400,
        message: "Failed to create category: " + (error.message || "Unknown error")
      };
    }
  }
  return sendResponse(res);
};

export const getById = async (req, res) => {
  try {
    const cat = await categoryService.getCategoryById(req.params.id);

    if (!cat) {
      res.locals.response = {
        success: false,
        message: "Category not found",
        status: 404
      }
    }
    else {
      res.locals.response = {
        success: true,
        data: cat,
        message: "Category fetched successfully",
        status: 200
      }
    }
  } catch (e) {
    res.locals.response = {
      success: false,
      message: "Internal server error",
      status: 500
    }
  }
  return sendResponse(res);
};

export const update = async (req, res) => {
  try {
    let body = { ...req.body };
    
    // Extract and remove _originalImageId (used for cleanup, not stored)
    const originalImageId = body._originalImageId;
    delete body._originalImageId;

    const cat = await categoryService.updateCategory(req.params.id, body, originalImageId);

    if (!cat) {
      res.locals.response = {
        success: false,
        message: "Category not found",
        status: 404
      }
    } else {
      res.locals.response = {
        success: true,
        data: cat,
        message: "Category updated successfully",
        status: 200
      }
    }
  } catch (e) {
    res.locals.response = {
      success: false,
      message: e.message || "Update failed",
      status: 400
    }
  }
  return sendResponse(res);
};

export const remove = async (req, res) => {
  try {
    await categoryService.deleteCategory(req.params.id);
    res.locals.response = {
      success: true,
      message: "Category deleted successfully",
      status: 200
    }
  } catch (e) {
    res.locals.response = {
      success: false,
      message: e.message || "Delete failed",
      status: 400
    }
  }
  return sendResponse(res);
};
