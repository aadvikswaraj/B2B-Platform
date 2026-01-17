import * as productVerificationService from "./service.js";
import { sendResponse } from "../../../middleware/responseTemplate.js";
import { parseListParams, buildSortObject, sendListResponse, sendErrorResponse } from "../../../utils/listQueryHandler.js";


/**
 * List all product verifications with pagination, search, and filters
 */
export const list = async (req, res) => {
    try {
        const { search, filters, sort, page, pageSize, skip } = parseListParams(req);
        const sortObj = buildSortObject(sort);

        const { docs, totalCount } = await productVerificationService.list(
            {},
            search,
            filters?.status,
            skip,
            pageSize,
            sortObj
        );

        return sendListResponse(res, { docs, totalCount, page, pageSize });
    } catch (error) {
        return sendErrorResponse(res, error);
    }
};

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
                status: 404
            };
        }
        else {
            // Return raw image data, frontend will handle URLs

            res.locals.response = {
                success: true,
                message: "Product verification fetched successfully",
                status: 200,
                data
            };
        }
    } catch (error) {
        console.error("Error in getById:", error);
        res.locals.response = {
            success: false,
            message: error.message,
            status: 500
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
        const { decision, reason } = req.body;

        // Get product for update
        const product = await productVerificationService.getForUpdate(productId);
        if (!product) {
            res.locals.response = {
                success: false,
                message: "Product not found",
                status: 404
            };
            return sendResponse(res);
        }

        const adminUserId = req.user?._id;
        const now = new Date();

        if (decision === "approved") {
            product.moderation = product.moderation || {};
            product.moderation.status = "approved";
            product.moderation.rejectedReason = undefined;
            product.moderation.approvedBy = adminUserId;
            product.moderation.approvedAt = now;
            product.moderation.updatedAt = now;
            product.isApproved = true;
            
            // Update product status if needed
            if (product.status === "draft" || product.status === "rejected") {
                product.status = "active";
            }

            await product.save();

            res.locals.response = {
                success: true,
                message: "Product approved successfully",
                status: 200,
                data: {
                    _id: product._id,
                    status: product.status,
                    isApproved: product.isApproved,
                    moderation: product.moderation
                }
            };
        } else if (decision === "rejected") {
            product.moderation = product.moderation || {};
            product.moderation.status = "rejected";
            product.moderation.rejectedReason = reason || "Product rejected";
            product.moderation.approvedBy = undefined;
            product.moderation.approvedAt = undefined;
            product.moderation.updatedAt = now;
            product.isApproved = false;
            product.status = "rejected";

            await product.save();

            res.locals.response = {
                success: true,
                message: "Product rejected successfully",
                status: 200,
                data: {
                    _id: product._id,
                    status: product.status,
                    isApproved: product.isApproved,
                    moderation: product.moderation
                }
            };
        } else {
            res.locals.response = {
                success: false,
                message: "Invalid decision. Use 'approved' or 'rejected'",
                status: 400
            };
        }
    } catch (error) {
        console.error("Error in verifyDecision:", error);
        res.locals.response = {
            success: false,
            message: error.message,
            status: 500
        };
    }
    return sendResponse(res);
};
