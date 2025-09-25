import express from "express";
import { User, SellerKYC, BusinessProfile, Address } from "../../models/model.js";
import { getFileUrl } from "../../middleware/fileUpload.js";
import { sendResponse } from "../../middleware/responseTemplate.js";

const router = express.Router();

// Helper: compute registration completion step
function getNextStep(kyc, profile) {
  if (!kyc?.pan?.pan || !kyc?.pan?.file || !kyc?.gstin?.gstin || !kyc?.gstin?.file || !kyc?.signature?.file) {
    return "businessKYC";
  }
  if (!kyc?.bankAccount?.accountNumber || !kyc?.bankAccount?.ifsc || !kyc?.bankAccount?.accountHolder || !kyc?.bankAccount?.cancelledCheque) {
    return "bankAccount";
  }
  if (!profile?.contactPersonName || !profile?.businessCategory || !profile?.employeeCount || !profile?.annualTurnover) {
    return "additionalDetails";
  }
  if (!kyc?.pickupAddress) {
    return "pickupAddress";
  }
  return "completed";
}

function computeVerificationStatus(kyc, profile) {
  const statuses = [
    kyc?.pan?.status,
    kyc?.gstin?.status,
    kyc?.signature?.status,
    kyc?.bankAccount?.status,
    profile?.verification?.status,
  ].filter(Boolean);
  if (statuses.includes("rejected")) return "rejected";
  if (["verified"].every(s => statuses.includes("verified"))) return "verified";
  return "pending";
}

// GET /admin/seller-verification/list
router.get("/list", async (req, res) => {
  try {
    let { search, status, page = 1, pageSize = 10 } = req.query;
    page = parseInt(page) || 1;
    pageSize = parseInt(pageSize) || 10;

    // Base query: users who have a SellerKYC document
    const kycQuery = {};
    const kycs = await SellerKYC.find(kycQuery)
      .populate([
        { path: "pan.file", model: "File" },
        { path: "gstin.file", model: "File" },
        { path: "signature.file", model: "File" },
        { path: "bankAccount.cancelledCheque", model: "File" },
      ])
      .lean();

    const userIds = kycs.map(k => k.user);
    const users = await User.find({ _id: { $in: userIds }, ...(search ? { $or: [ { name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }, { phone: { $regex: search, $options: 'i' } } ] } : {}) })
      .select("name email phone isSeller userSuspended createdAt")
      .lean();
    const profiles = await BusinessProfile.find({ user: { $in: userIds } }).select("user businessCategory employeeCount annualTurnover contactPersonName verification").lean();

    const profileByUser = new Map(profiles.map(p => [String(p.user), p]));
    const userById = new Map(users.map(u => [String(u._id), u]));

    let rows = kycs.map(kyc => {
      const profile = profileByUser.get(String(kyc.user)) || null;
      const user = userById.get(String(kyc.user)) || null;
      const step = getNextStep(kyc, profile);
      const verificationStatus = computeVerificationStatus(kyc, profile);
      return {
        user: user ? { _id: user._id, name: user.name, email: user.email, phone: user.phone, isSeller: user.isSeller, userSuspended: user.userSuspended, createdAt: user.createdAt } : null,
        profile: profile || null,
        kyc,
        step,
        verificationStatus,
      };
    });

    if (status) {
      rows = rows.filter(r => r.verificationStatus === status);
    }

    // Sort newest users first
    rows.sort((a, b) => new Date(b.user?.createdAt || 0) - new Date(a.user?.createdAt || 0));

    const totalCount = rows.length;
    const start = (page - 1) * pageSize;
    const paged = rows.slice(start, start + pageSize);

    res.locals.response.data = { items: paged, totalCount, page, pageSize };
    return res.json(res.locals.response);
  } catch (e) {
    console.error("Error listing seller verifications", e);
    res.locals.response.success = false;
    res.locals.response.message = "Internal server error";
    return res.status(500).json(res.locals.response);
  }
});

// GET /admin/seller-verification/:userId
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("name email phone isSeller userSuspended createdAt").lean();
    if (!user) {
      res.locals.response.success = false;
      res.locals.response.message = "User not found";
      return res.status(404).json(res.locals.response);
    }
    const kyc = await SellerKYC.findOne({ user: userId }).populate([
      { path: "pan.file", model: "File" },
      { path: "gstin.file", model: "File" },
      { path: "signature.file", model: "File" },
      { path: "bankAccount.cancelledCheque", model: "File" },
      { path: "pickupAddress", model: "Address" },
    ]);
    const profile = await BusinessProfile.findOne({ user: userId }).lean();
    if (!kyc) {
      res.locals.response.success = false;
      res.locals.response.message = "No seller registration found for user";
      return res.status(404).json(res.locals.response);
    }
    // Build file URLs
    const kycOut = {
      ...kyc.toObject(),
      pan: { ...kyc.pan, fileUrl: getFileUrl(kyc.pan?.file) },
      gstin: { ...kyc.gstin, fileUrl: getFileUrl(kyc.gstin?.file) },
      signature: { ...kyc.signature, fileUrl: getFileUrl(kyc.signature?.file) },
      bankAccount: { ...kyc.bankAccount, cancelledChequeUrl: getFileUrl(kyc.bankAccount?.cancelledCheque) },
    };
    const step = getNextStep(kyc, profile);
    const verificationStatus = computeVerificationStatus(kyc, profile);
    res.locals.response.data = { user, profile, kyc: kycOut, step, verificationStatus };
    return res.json(res.locals.response);
  } catch (e) {
    console.error("Error fetching seller verification detail", e);
    res.locals.response.success = false;
    res.locals.response.message = "Internal server error";
    return res.status(500).json(res.locals.response);
  }
});

// PATCH /admin/seller-verification/:userId/status
router.patch("/:userId/status", async (req, res) => {
  try {
    const { userId } = req.params;
    const { pan, gstin, signature, bankAccount, profile } = req.body || {};
    const adminUserId = req.user?._id;
    const kyc = await SellerKYC.findOne({ user: userId });
    const business = await BusinessProfile.findOne({ user: userId });
    if (!kyc || !business) {
      res.locals.response.success = false;
      res.locals.response.message = "Registration not found";
      return res.status(404).json(res.locals.response);
    }
    const now = new Date();
    const setDoc = (target, payload) => {
      if (!payload || !target) return;
      if (payload.status) target.status = payload.status;
      if (payload.rejectedReason !== undefined) target.rejectedReason = payload.rejectedReason;
      if (payload.status === 'verified') {
        target.verifiedBy = adminUserId;
        target.verifiedAt = now;
      }
    };
    setDoc(kyc.pan, pan);
    setDoc(kyc.gstin, gstin);
    setDoc(kyc.signature, signature);
    if (bankAccount?.status) {
      kyc.bankAccount.status = bankAccount.status;
      if (bankAccount.rejectedReason !== undefined) kyc.bankAccount.rejectedReason = bankAccount.rejectedReason;
      if (bankAccount.status === 'verified') {
        kyc.bankAccount.verifiedBy = adminUserId;
        kyc.bankAccount.verifiedAt = now;
      }
    }
    if (profile?.status) {
      business.verification = business.verification || {};
      business.verification.status = profile.status;
      business.verification.updatedAt = now;
    }
    await kyc.save();
    await business.save();
    res.locals.response.message = "Statuses updated";
    return res.json(res.locals.response);
  } catch (e) {
    console.error("Error updating seller statuses", e);
    res.locals.response.success = false;
    res.locals.response.message = "Internal server error";
    return res.status(500).json(res.locals.response);
  }
});

// POST /admin/seller-verification/:userId/approve
router.post("/:userId/approve", async (req, res) => {
  try {
    const { userId } = req.params;
    const adminUserId = req.user?._id;
    const [kyc, business] = await Promise.all([
      SellerKYC.findOne({ user: userId }),
      BusinessProfile.findOne({ user: userId }),
    ]);
    if (!kyc || !business) {
      res.locals.response.success = false;
      res.locals.response.message = "Registration not found";
      return res.status(404).json(res.locals.response);
    }
    const now = new Date();
    const markV = (doc) => { if (!doc) return; doc.status = 'verified'; doc.verifiedBy = adminUserId; doc.verifiedAt = now; };
    markV(kyc.pan); markV(kyc.gstin); markV(kyc.signature);
    kyc.bankAccount = kyc.bankAccount || {};
    kyc.bankAccount.status = 'verified';
    kyc.bankAccount.verifiedBy = adminUserId;
    kyc.bankAccount.verifiedAt = now;
    business.verification = business.verification || {};
    business.verification.status = 'verified';
    business.verification.updatedAt = now;
    await kyc.save();
    await business.save();
    await User.findByIdAndUpdate(userId, { isSeller: true });
    res.locals.response.message = "Seller approved";
    return res.json(res.locals.response);
  } catch (e) {
    console.error("Error approving seller", e);
    res.locals.response.success = false;
    res.locals.response.message = "Internal server error";
    return res.status(500).json(res.locals.response);
  }
});

// POST /admin/seller-verification/:userId/reject
router.post("/:userId/reject", async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body || {};
    const business = await BusinessProfile.findOne({ user: userId });
    if (!business) {
      res.locals.response.success = false;
      res.locals.response.message = "Registration not found";
      return res.status(404).json(res.locals.response);
    }
    const now = new Date();
    business.verification = business.verification || {};
    business.verification.status = 'rejected';
    business.verification.updatedAt = now;
    await business.save();
    res.locals.response.message = "Seller rejected";
    res.locals.response.data = { reason: reason || null };
    return res.json(res.locals.response);
  } catch (e) {
    console.error("Error rejecting seller", e);
    res.locals.response.success = false;
    res.locals.response.message = "Internal server error";
    return res.status(500).json(res.locals.response);
  }
});

export default router;
