import * as sellerInfoService from "./service.js";
import { sendResponse } from "../../../middleware/responseTemplate.js";

/**
 * Get seller contact details
 * @route GET /api/catalog/seller-info/:sellerId/contact
 */
export const getContact = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const contact = await sellerInfoService.getSellerContact(sellerId);

    res.locals.response = {
      success: true,
      data: contact,
      message: "Seller contact details fetched successfully",
      status: 200,
    };
  } catch (error) {
    res.locals.response = {
      success: false,
      message: error.message,
      status: error.message === "Seller not found" ? 404 : 500,
    };
  }
  return sendResponse(res);
};
