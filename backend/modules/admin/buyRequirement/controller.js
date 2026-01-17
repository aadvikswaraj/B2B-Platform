import * as buyRequirementService from "./service.js";
import { sendResponse } from "../../../middleware/responseTemplate.js";
import { createListController } from "../../../utils/listQueryHandler.js";

/**
 * List all buy requirements with pagination, search, and filters
 */
export const list = createListController({
  service: buyRequirementService.list,
  searchFields: ["productName", "description"],
  filterMap: {
    quantity: (val) => ({ quantity: { $lte: val } }),
    unit: "unit",
    status: "status",
    verificationStatus: "verification.status",
  },
});

export const getById = async (req, res) => {
  try {
    const { buyRequirementId } = req.params;

    const buyRequirement = await buyRequirementService.getBuyRequirementById(buyRequirementId);
    if (!buyRequirement) {
      res.locals.response = {
        success: false,
        message: "Buy requirement not found",
        code: 404,
      };
    } else {
      res.locals.response = {
        success: true,
        message: "Buy requirement fetched successfully",
        data: { buyRequirement },
        code: 200,
      };
    }
  } catch (err) {
    res.locals.response = {
      success: false,
      message: "Error fetching brand",
      code: 500,
    };
  }
  return sendResponse(res);
};

export const verify = async (req, res) => {
  try {
    const { buyRequirementId } = req.params;
    const { status, category, rejectedReason } = req.body;

    const buyRequirement = await buyRequirementService.verifyBuyRequirement(
      buyRequirementId,
      {
        status,
        category,
        rejectedReason,
      },
      req.user._id
    );

    if (!buyRequirement) {
        res.locals.response = {
        success: false,
        message: "Buy requirement not found",
        code: 404,
      };
    } else {
        res.locals.response = {
        success: true,
        message: "Buy requirement verification decision updated successfully",
        code: 200,
        data: { buyRequirement },
      };
    }

    res.locals.response.data = buyRequirement;
  } catch (e) {
    res.locals.response.success = false;
    res.locals.response.message = "Error updating buy requirement verification decision";
    res.locals.response.status = 500;
}
return sendResponse(res);
};
