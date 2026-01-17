import * as registrationService from "./service.js";
import { sendResponse } from "../../../middleware/responseTemplate.js";
import { SellerKYC, BusinessProfile } from "../../../models/model.js";

function getNextStep(kyc, profile) {
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

/**
 * Get seller registration progress
 */
export const getProgress = async (req, res) => {
  try {
    const userId = req.user?._id;
    let kyc = await registrationService.getKYCByUserId(userId);
    const profile = await registrationService.getProfileByUserId(userId);
    const user = await registrationService.getUserPhone(userId);

    let step = "businessKYC";
    let message = "Not started";
    if (kyc) {
      step = getNextStep(kyc, profile);
      message =
        step === "completed"
          ? "Registration complete"
          : `Continue from step: ${step}`;
    }

    const kycOut = kyc ? kyc.toObject() : null;

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
      message,
      status: 200,
      data: { step, kyc: kycOut, profile: profileOut, user: { phone: user?.phone || null } },
    };
  } catch (error) {
    console.error("Error in getProgress:", error);
    res.locals.response = {
      success: false,
      message: error.message,
      status: 500,
    };
  }
  return sendResponse(res);
};


/**
 * Save registration step
 */
export const saveStep = async (req, res) => {
  try {
    const {
      step: currentStep,
      pan,
      gstin,
      accountNumber,
      ifsc,
      accountHolder,
      pickupAddress,
      contactPerson,
      businessCategory,
      employeeCount,
      annualTurnover,
      description,
      panFile,
      gstinFile,
      signatureFile,
      cancelledChequeFile,
    } = req.body;

    const userId = req.user?._id;
    let kyc = await registrationService.getKYCByUserIdForUpdate(userId);
    let profile = await registrationService.getProfileByUserId(userId);

    if (!kyc) {
      kyc = new SellerKYC({ user: userId });
    }
    if (!profile) {
      profile = new BusinessProfile({ user: userId });
    }

    // Check if this is first time completing each step
    const isFirstTimeBusinessKYC =
      currentStep === "businessKYC" &&
      (!kyc?.pan?.pan ||
        !kyc?.pan?.file ||
        !kyc?.gstin?.gstin ||
        !kyc?.gstin?.file ||
        !kyc?.signature?.file);

    const isFirstTimeBankAccount =
      currentStep === "bankAccount" &&
      (!kyc?.bankAccount?.accountNumber ||
        !kyc?.bankAccount?.ifsc ||
        !kyc?.bankAccount?.accountHolder ||
        !kyc?.bankAccount?.cancelledCheque);

    const isFirstTimeAdditionalDetails =
      currentStep === "additionalDetails" &&
      (!profile?.contactPersonName ||
        !profile?.businessCategory ||
        !profile?.employeeCount ||
        !profile?.annualTurnover);

    // Validate required fields for first-time completion
    if (isFirstTimeBusinessKYC) {
      if (!pan || !panFile || !gstin || !gstinFile || !signatureFile) {
        res.locals.response = {
          success: false,
          message:
            "Please complete all Business KYC fields (PAN, GSTIN, Signature files are required)",
          status: 400,
        };
        return sendResponse(res);
      }
    }

    if (isFirstTimeBankAccount) {
      if (
        !accountNumber ||
        !ifsc ||
        !accountHolder ||
        !cancelledChequeFile
      ) {
        res.locals.response = {
          success: false,
          message:
            "Please complete all Bank Account fields (Account Number, IFSC, Account Holder, Cancelled Cheque are required)",
          status: 400,
        };
        return sendResponse(res);
      }
    }

    if (isFirstTimeAdditionalDetails) {
      if (
        !contactPerson ||
        !businessCategory ||
        !employeeCount ||
        !annualTurnover
      ) {
        res.locals.response = {
          success: false,
          message:
            "Please complete all Additional Details (Contact Person, Business Category, Employee Count, Annual Turnover are required)",
          status: 400,
        };
        return sendResponse(res);
      }
    }

    // Update KYC files
    if (panFile) kyc.pan = { ...kyc.pan, file: panFile };
    if (gstinFile) kyc.gstin = { ...kyc.gstin, file: gstinFile };
    if (signatureFile) kyc.signature = { ...kyc.signature, file: signatureFile };
    if (cancelledChequeFile)
      kyc.bankAccount = {
        ...kyc.bankAccount,
        cancelledCheque: cancelledChequeFile,
      };

    // Update KYC text fields
    if (pan) kyc.pan = { ...kyc.pan, pan };
    if (gstin) kyc.gstin = { ...kyc.gstin, gstin };
    if (accountNumber)
      kyc.bankAccount = { ...kyc.bankAccount, accountNumber };
    if (ifsc) kyc.bankAccount = { ...kyc.bankAccount, ifsc };
    if (accountHolder)
      kyc.bankAccount = { ...kyc.bankAccount, accountHolder };
    if (pickupAddress) kyc.pickupAddress = pickupAddress;

    // Update profile fields
    if (contactPerson !== undefined)
      profile.contactPersonName = contactPerson;
    if (businessCategory !== undefined)
      profile.businessCategory = businessCategory;
    if (employeeCount !== undefined) profile.employeeCount = employeeCount;
    if (annualTurnover !== undefined)
      profile.annualTurnover = annualTurnover;
    if (description !== undefined) profile.description = description;

    await kyc.save();
    await profile.save();

    // Populate files
    await kyc.populate([
      { path: "pan.file", model: "File" },
      { path: "gstin.file", model: "File" },
      { path: "signature.file", model: "File" },
      { path: "bankAccount.cancelledCheque", model: "File" },
    ]);
    profile = await registrationService.getProfileByUserId(userId);

    const nextStep = getNextStep(kyc, profile);

    // Return raw kyc data, frontend will handle file URLs
    const kycOut = kyc ? kyc.toObject() : null;

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
      status: 200,
      data: { step: nextStep, kyc: kycOut, profile: profileOut },
    };
  } catch (error) {
    console.error("Error in saveStep:", error);
    res.locals.response = {
      success: false,
      message: error.message,
      status: 500,
    };
  }
  return sendResponse(res);
};

