import * as brandService from "./service.js";
import { sendResponse } from "../../../middleware/responseTemplate.js";
import { createListController } from "../../../utils/listQueryHandler.js";

export const list = createListController({
  service: brandService.list,
  searchFields: ["name"],
  buildQuery: (filters, req) => ({
    user: req.user._id,
    ...(filters?.status && { "kyc.status": filters.status }),
  }),
});

export const create = async (req, res) => {
  try {
    const body = req.body;

    body.user = req.user._id;
    const brand = await brandService.create(body);

    res.locals.response = {
      success: true,
      message: "Brand created successfully, pending verification",
      status: 201,
      data: brand,
    };
  } catch (error) {
    if (error.code === 11000) {
      console.error("Duplicate key error in create:", error);
      res.locals.response = {
        success: false,
        message: "Brand with this name already exists",
        status: 409,
      };
    } else {
      console.error("Error in create:", error);
      res.locals.response = {
        success: false,
        message:
          "Failed to create brand: " + (error.message || "Unknown error"),
        status: 500,
      };
    }
  }
  return sendResponse(res);
};

export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await brandService.getById(id, req.user._id);

    if (!brand) {
      res.locals.response = {
        success: false,
        message: "Brand not found",
        status: 404,
      };
    } else {
      res.locals.response = {
        success: true,
        message: "Brand fetched successfully",
        status: 200,
        data: brand,
      };
    }
  } catch (error) {
    res.locals.response = {
      success: false,
      message: "Failed to fetch brand: " + (error.message || "Unknown error"),
      status: 500,
    };
  }
  return sendResponse(res);
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const { updated, brand } = await brandService.update(
      id,
      req.user._id,
      body
    );

    if (!brand) {
      res.locals.response = {
        success: false,
        message: "Brand not found",
        status: 404,
      };
    } else {
      res.locals.response = {
        success: true,
        message: updated ? "Brand updated successfully" : "No changes detected",
        status: 200,
        data: { brand, updated },
      };
    }
  } catch (error) {
    res.locals.response = {
      success: false,
      message: "Failed to update brand: " + error.message || "Unknown error",
      status: 500,
    };
  }
  return sendResponse(res);
};

export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const { newBrandId } = req.body;
    const userId = req.user._id;

    // Check if brand exists and belongs to user
    const brand = await brandService.getById(id, userId);
    if (!brand) {
      res.locals.response = {
        success: false,
        message: "Brand not found",
        status: 404,
      };
      return sendResponse(res);
    }

    // Check if brand has associated products
    const productCount = await brandService.countProductsByBrand(id);
    
    if (productCount > 0) {
      // If products exist but no newBrandId provided
      if (!newBrandId) {
        res.locals.response = {
          success: false,
          message: `Cannot delete brand. ${productCount} product(s) are associated with this brand. Provide a newBrandId to reassign products or delete those products first.`,
          status: 400,
          data: { productCount },
        };
        return sendResponse(res);
      }

      // Verify newBrand exists and belongs to user
      const newBrand = await brandService.getById(newBrandId, userId);
      if (!newBrand) {
        res.locals.response = {
          success: false,
          message: "New brand not found or doesn't belong to you",
          status: 404,
        };
        return sendResponse(res);
      }

      // Verify newBrand is verified (can't reassign to pending/rejected brand)
      if (newBrand.kyc?.status !== "verified") {
        res.locals.response = {
          success: false,
          message: `Cannot reassign products to unverified brand. New brand status: ${newBrand.kyc?.status}`,
          status: 400,
        };
        return sendResponse(res);
      }

      // Reassign products to new brand
      await brandService.reassignProducts(id, newBrandId);
    }

    // Delete the brand and associated file
    await brandService.remove(id, userId);

    res.locals.response = {
      success: true,
      message: productCount > 0 
        ? `Brand deleted successfully. ${productCount} product(s) reassigned to new brand.`
        : "Brand deleted successfully",
      status: 200,
      data: productCount > 0 ? { reassignedCount: productCount } : undefined,
    };
  } catch (error) {
    console.error("Error in remove:", error);
    res.locals.response = {
      success: false,
      message: "Failed to delete brand: " + (error.message || "Unknown error"),
      status: 500,
    };
  }
  return sendResponse(res);
};
