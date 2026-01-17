import * as sellerVerificationService from "./service.js";
import { sendResponse } from "../../../middleware/responseTemplate.js";
import { parseListParams, buildSortObject, sendListResponse, sendErrorResponse } from "../../../utils/listQueryHandler.js";


/**
 * List all seller verifications with pagination, search, and filters
 */
export const list = async (req, res) => {
    try {
        const { search, filters, sort, page, pageSize, skip } = parseListParams(req);
        const sortObj = buildSortObject(sort);

        const { docs, totalCount } = await sellerVerificationService.list(
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
 * Get seller verification by user ID

 */
export const getById = async (req, res) => {
    try {
        const { userId } = req.params;
        const data = await sellerVerificationService.getById(userId);

        if (!data) {
            res.locals.response = {
                success: false,
                message: "Seller verification not found",
                status: 404
            };
        }
        else {
            // Return raw kyc data, frontend will handle file URLs

            res.locals.response = {
                success: true,
                message: "Seller verification fetched successfully",
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
 * Verify individual KYC section (pan, gstin, signature, bankAccount)
 */
export const verifyKYCSection = async (req, res) => {
    try {
        const { userId } = req.params;
        const { section, decision, reason } = req.body;

        // Get KYC and profile
        const kyc = await sellerVerificationService.getKYCForUpdate(userId);
        const profile = await sellerVerificationService.getProfileForUpdate(userId);

        if (!kyc || !profile) {
            res.locals.response = {
                success: false,
                message: "Seller registration not found",
                status: 404
            };
            return sendResponse(res);
        }

        const adminUserId = req.user?._id;
        const now = new Date();

        // Verify or reject the specific section
        if (decision === "verified") {
            if (section === "pan" || section === "gstin" || section === "signature") {
                kyc[section] = kyc[section] || {};
                kyc[section].status = "verified";
                kyc[section].verifiedBy = adminUserId;
                kyc[section].verifiedAt = now;
                kyc[section].rejectedReason = undefined;
            } else if (section === "bankAccount") {
                kyc.bankAccount = kyc.bankAccount || {};
                kyc.bankAccount.status = "verified";
                kyc.bankAccount.verifiedBy = adminUserId;
                kyc.bankAccount.verifiedAt = now;
                kyc.bankAccount.rejectedReason = undefined;
            }
        } else if (decision === "rejected") {
            if (section === "pan" || section === "gstin" || section === "signature") {
                kyc[section] = kyc[section] || {};
                kyc[section].status = "rejected";
                kyc[section].rejectedReason = reason || `${section.toUpperCase()} rejected`;
                kyc[section].verifiedBy = undefined;
                kyc[section].verifiedAt = undefined;
            } else if (section === "bankAccount") {
                kyc.bankAccount = kyc.bankAccount || {};
                kyc.bankAccount.status = "rejected";
                kyc.bankAccount.rejectedReason = reason || "Bank account rejected";
                kyc.bankAccount.verifiedBy = undefined;
                kyc.bankAccount.verifiedAt = undefined;
            }
        }

        await kyc.save();

        // Check if all sections are verified for auto-approval
        const allVerified = 
            kyc.pan?.status === "verified" &&
            kyc.gstin?.status === "verified" &&
            kyc.signature?.status === "verified" &&
            kyc.bankAccount?.status === "verified";

        let message = `${section.toUpperCase()} ${decision} successfully`;

        if (allVerified) {
            // Auto-approve seller profile
            profile.verification = profile.verification || {};
            profile.verification.status = "verified";
            profile.verification.updatedAt = now;
            profile.verification.rejectedReason = undefined;
            await profile.save();
            await sellerVerificationService.updateUserSellerStatus(userId, true);
            message += ". All KYC sections verified - Seller auto-approved";
        }

        res.locals.response = {
            success: true,
            message,
            status: 200,
            data: {
                section,
                decision,
                allVerified,
                autoApproved: allVerified
            }
        };
    } catch (error) {
        console.error("Error in verifyKYCSection:", error);
        res.locals.response = {
            success: false,
            message: error.message,
            status: 500
        };
    }
    return sendResponse(res);
};

export const verifyDecision = async (req, res) => {
    try {
        const { userId } = req.params;
        const { decision, reason } = req.body;
        
        await sellerVerificationService.updateVerificationStatus(userId, decision, reason, req.user._id);

        res.locals.response = {
            success: true,
            message: `Seller ${decision} successfully`,
            status: 200
        };
    } catch (error) {
        res.locals.response = {
            success: false,
            message: error.message,
            status: 500
        };
    }
    return sendResponse(res);
};
