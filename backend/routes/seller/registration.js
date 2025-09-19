import express from "express";
const router = express.Router();

import { SellerKYC } from "../../models/model.js";
import { uploadAndSaveFiles, deleteFiles } from "../../middleware/fileUpload.js";
import { sendResponse } from "../../middleware/responseTemplate.js";
import requireLogin from "../../middleware/requireLogin.js";

// Helper: determine next incomplete step
function getNextStep(kyc) {
  // businessDetails now handled in BusinessProfile, not SellerKYC
  if (!kyc?.pickupAddress) {
    return "pickupAddress";
  }
  if (!kyc?.pan?.pan || !kyc?.pan?.file || !kyc?.gstin?.gstin || !kyc?.gstin?.file || !kyc?.signature?.file) {
    return "businessKYC";
  }
  if (!kyc?.bankAccount?.accountNumber || !kyc?.bankAccount?.ifsc || !kyc?.bankAccount?.accountHolder || !kyc?.bankAccount?.cancelledCheque) {
    return "bankAccount";
  }
  return "completed";
}

// GET /seller/registration/progress
router.get("/progress", requireLogin, async (req, res) => {
  try {
    console.log("Fetching KYC progress for user:", req.user);
    const userId = req.user?._id;
    let kyc = await SellerKYC.findOne({ user: userId });
    let step = "businessKYC";
    let message = "Not started";
    if (kyc) {
      step = getNextStep(kyc);
      message =
        step === "completed"
          ? "Registration complete"
          : `Continue from step: ${step}`;
    };
    res.locals.response.message = message;
    res.locals.response.data = { step, kyc };
  } catch (e) {
    console.log("Error fetching KYC progress", e);
    res.locals.response.success = false;
    res.locals.response.message = "Internal server error";
    res.locals.response.status = 500;
  }
  sendResponse(res);
});

// POST /seller/registration/save-step
router.post(
  "/save-step",
  requireLogin,
  uploadAndSaveFiles([
    { name: "panFile", maxCount: 1 },
    { name: "gstinFile", maxCount: 1 },
    { name: "signatureFile", maxCount: 1 },
    { name: "cancelledChequeFile", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const userId = req.user?._id;
      let kyc = await SellerKYC.findOne({ user: userId });
      if (!kyc) {
        kyc = new SellerKYC({ user: userId });
      }
      // Update only provided fields
      const { pan, gstin, accountNumber, ifsc, accountHolder, pickupAddress } = req.body;
      // Pickup address (expects address ObjectId)
      if (pickupAddress) {
        kyc.pickupAddress = pickupAddress;
      }
      // Validate required fields for each step (example: pan must be valid if present)
      // If validation fails, delete uploaded files and return error
      if (pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
        await deleteFiles(Object.values(req.filesId || {}));
        res.locals.response = { success: false, message: "Invalid PAN format", status: 400 };
        return sendResponse(res);
      }
      // Use fileIds from handleFiles
      if (req.filesId?.panFile) kyc.pan = { ...kyc.pan, file: req.filesId.panFile };
      if (req.filesId?.gstinFile) kyc.gstin = { ...kyc.gstin, file: req.filesId.gstinFile };
      if (req.filesId?.signatureFile) kyc.signature = { ...kyc.signature, file: req.filesId.signatureFile };
      if (req.filesId?.cancelledChequeFile) {
        kyc.bankAccount = { ...kyc.bankAccount, cancelledCheque: req.filesId.cancelledChequeFile };
      }
      if (pan) kyc.pan = { ...kyc.pan, pan };
      if (gstin) kyc.gstin = { ...kyc.gstin, gstin };
      if (accountNumber) kyc.bankAccount = { ...kyc.bankAccount, accountNumber };
      if (ifsc) kyc.bankAccount = { ...kyc.bankAccount, ifsc };
      if (accountHolder) kyc.bankAccount = { ...kyc.bankAccount, accountHolder };
      await kyc.save();
      const step = getNextStep(kyc);
      res.locals.response = {
        success: true,
        message: "Step saved",
        data: { step, kyc },
        status: 200,
      };
      return sendResponse(res);
    } catch (e) {
      res.locals.response = {
        success: false,
        message: "Server error",
        status: 500,
      };
      return sendResponse(res);
    }
  }
);

export default router;
