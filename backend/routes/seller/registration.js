import express from "express";
const router = express.Router();

import { SellerKYC, BusinessProfile, User } from "../../models/model.js";
import {
  uploadAndSaveFiles,
  deleteFiles,
  getFileUrl,
} from "../../middleware/fileUpload.js";
import { sendResponse } from "../../middleware/responseTemplate.js";
import requireLogin from "../../middleware/requireLogin.js";

// Helper: determine next incomplete step
function getNextStep(kyc, profile) {
  // businessDetails now handled in BusinessProfile, not SellerKYC
  if (
    !kyc?.pan?.pan ||
    !kyc?.pan?.file ||
    !kyc?.gstin?.gstin ||
    !kyc?.gstin?.file ||
    !kyc?.signature?.file
  ) {
    return "businessKYC";
  }
  if (
    !kyc?.bankAccount?.accountNumber ||
    !kyc?.bankAccount?.ifsc ||
    !kyc?.bankAccount?.accountHolder ||
    !kyc?.bankAccount?.cancelledCheque
  ) {
    return "bankAccount";
  }
  // Check additionalDetails in BusinessProfile
  if (
    !profile?.contactPersonName ||
    !profile?.businessCategory ||
    !profile?.employeeCount ||
    !profile?.annualTurnover
  ) {
    return "additionalDetails";
  }
  if (!kyc?.pickupAddress) {
    return "pickupAddress";
  }
  return "completed";
}

// GET /seller/registration/progress
router.get("/progress", requireLogin, async (req, res) => {
  try {
    const userId = req.user?._id;
    let kyc = await SellerKYC.findOne({ user: userId }).populate([
      { path: "pan.file", model: "File" },
      { path: "gstin.file", model: "File" },
      { path: "signature.file", model: "File" },
      { path: "bankAccount.cancelledCheque", model: "File" },
    ]);
    // Fetch business profile and user phone
    const profile = await BusinessProfile.findOne({ user: userId });
    const user = await User.findById(userId).select("phone");
    let step = "businessKYC";
    let message = "Not started";
    if (kyc) {
      step = getNextStep(kyc, profile);
      message =
        step === "completed"
          ? "Registration complete"
          : `Continue from step: ${step}`;
    }
    // Attach file URLs for frontend preview (if file exists)
    const kycOut = kyc
      ? {
          ...kyc.toObject(),
          pan: {
            ...kyc.pan,
            fileUrl: getFileUrl(kyc.pan?.file)
          },
          gstin: {
            ...kyc.gstin,
            fileUrl: getFileUrl(kyc.gstin?.file)
          },
          signature: {
            ...kyc.signature,
            fileUrl: getFileUrl(kyc.signature?.file)
          },
          bankAccount: {
            ...kyc.bankAccount,
            cancelledChequeUrl: getFileUrl(kyc.bankAccount?.cancelledCheque)
          },
        }
      : null;
    const profileOut = profile
      ? {
          contactPersonName: profile.contactPersonName || null,
          businessCategory: profile.businessCategory || null,
          employeeCount: profile.employeeCount || null,
          annualTurnover: profile.annualTurnover || null,
          description: profile.description || null,
        }
      : null;
    res.locals.response.message = message;
    res.locals.response.data = { step, kyc: kycOut, profile: profileOut, user: { phone: user?.phone || null } };
  } catch (e) {
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
      // Extract step parameter and other fields from request body
      const { 
        step: currentStep, 
        pan, 
        gstin, 
        accountNumber, 
        ifsc, 
        accountHolder, 
        pickupAddress,
        // additional details
        contactPerson, 
        businessCategory,
        employeeCount,
        annualTurnover,
        description,
      } = req.body;
      
      const userId = req.user?._id;
      let kyc = await SellerKYC.findOne({ user: userId });
      let profile = await BusinessProfile.findOne({ user: userId });
      
      if (!kyc) {
        kyc = new SellerKYC({ user: userId });
      }
      if (!profile) {
        profile = new BusinessProfile({ user: userId });
      }

      // Determine if this is the first time completing this step
      const isFirstTimeBusinessKYC = currentStep === "businessKYC" && (
        !kyc?.pan?.pan || !kyc?.pan?.file || !kyc?.gstin?.gstin || 
        !kyc?.gstin?.file || !kyc?.signature?.file
      );
      const isFirstTimeBankAccount = currentStep === "bankAccount" && (
        !kyc?.bankAccount?.accountNumber || !kyc?.bankAccount?.ifsc || 
        !kyc?.bankAccount?.accountHolder || !kyc?.bankAccount?.cancelledCheque
      );
      const isFirstTimeAdditionalDetails = currentStep === "additionalDetails" && (
        !profile?.contactPersonName || !profile?.businessCategory || !profile?.employeeCount || !profile?.annualTurnover
      );

      // Validate required fields only on first time completing the step
      if (isFirstTimeBusinessKYC) {
        if (!pan || !req.filesId?.panFile || !gstin || !req.filesId?.gstinFile || !req.filesId?.signatureFile) {
          await deleteFiles(Object.values(req.filesId || {}));
          res.locals.response = {
            success: false,
            message: "Please complete all Business KYC fields (PAN, GSTIN, Signature files are required)",
            status: 400,
          };
          return sendResponse(res);
        }
      }

      if (isFirstTimeBankAccount) {
        if (!accountNumber || !ifsc || !accountHolder || !req.filesId?.cancelledChequeFile) {
          await deleteFiles(Object.values(req.filesId || {}));
          res.locals.response = {
            success: false,
            message: "Please complete all Bank Account fields (Account Number, IFSC, Account Holder, Cancelled Cheque are required)",
            status: 400,
          };
          return sendResponse(res);
        }
      }

      if (isFirstTimeAdditionalDetails) {
        if (!contactPerson || !businessCategory || !employeeCount || !annualTurnover) {
          await deleteFiles(Object.values(req.filesId || {}));
          res.locals.response = {
            success: false,
            message: "Please complete all Additional Details (Contact Person, Business Category, Employee Count, Annual Turnover are required)",
            status: 400,
          };
          return sendResponse(res);
        }
      }

      // Update fields only if provided (allowing partial updates after first completion)
      if (req.filesId?.panFile) {
        kyc.pan = { ...kyc.pan, file: req.filesId.panFile };
      }
      if (req.filesId?.gstinFile) {
        kyc.gstin = { ...kyc.gstin, file: req.filesId.gstinFile };
      }
      if (req.filesId?.signatureFile) {
        kyc.signature = { ...kyc.signature, file: req.filesId.signatureFile };
      }
      if (req.filesId?.cancelledChequeFile) {
        kyc.bankAccount = {
          ...kyc.bankAccount,
          cancelledCheque: req.filesId.cancelledChequeFile,
        };
      }

      // Update text fields only if provided
      if (pan) kyc.pan = { ...kyc.pan, pan };
      if (gstin) kyc.gstin = { ...kyc.gstin, gstin };
      if (accountNumber) {
        kyc.bankAccount = { ...kyc.bankAccount, accountNumber };
      }
      if (ifsc) {
        kyc.bankAccount = { ...kyc.bankAccount, ifsc };
      }
      if (accountHolder) {
        kyc.bankAccount = { ...kyc.bankAccount, accountHolder };
      }
      if (pickupAddress) {
        kyc.pickupAddress = pickupAddress;
      }

      // Update Additional Details (BusinessProfile) only if provided
      if (contactPerson !== undefined) profile.contactPersonName = contactPerson;
      if (businessCategory !== undefined) profile.businessCategory = businessCategory;
      if (employeeCount !== undefined) profile.employeeCount = employeeCount;
      if (annualTurnover !== undefined) profile.annualTurnover = annualTurnover;
      if (description !== undefined) profile.description = description;

      await kyc.save();
      await profile.save();
      
      // Re-populate for response
      await kyc.populate([
        { path: "pan.file", model: "File" },
        { path: "gstin.file", model: "File" },
        { path: "signature.file", model: "File" },
        { path: "bankAccount.cancelledCheque", model: "File" },
      ]);
      // Re-fetch minimal profile for response
      profile = await BusinessProfile.findOne({ user: userId });

      const nextStep = getNextStep(kyc, profile);
      
      // Attach file URLs for frontend preview
      const kycOut = {
        ...kyc.toObject(),
        pan: {
          ...kyc.pan,
          fileUrl: getFileUrl(kyc.pan?.file)
        },
        gstin: {
          ...kyc.gstin,
          fileUrl: getFileUrl(kyc.gstin?.file)
        },
        signature: {
          ...kyc.signature,
          fileUrl: getFileUrl(kyc.signature?.file)
        },
        bankAccount: {
          ...kyc.bankAccount,
          cancelledChequeUrl: getFileUrl(kyc.bankAccount?.cancelledCheque)
        },
      };
      const profileOut = profile
        ? {
            contactPersonName: profile.contactPersonName || null,
            businessCategory: profile.businessCategory || null,
            employeeCount: profile.employeeCount || null,
            annualTurnover: profile.annualTurnover || null,
            description: profile.description || null,
          }
        : null;

      res.locals.response = {
        success: true,
        message: "Step saved successfully",
        data: { step: nextStep, kyc: kycOut, profile: profileOut },
        status: 200,
      };
      return sendResponse(res);
    } catch (e) {
      console.log("Error saving KYC step", e);
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
