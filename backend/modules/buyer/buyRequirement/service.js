import { BuyRequirement } from "../../../models/model.js";

/**
 * Create new buy requirement
 */
export const createRequirement = async (data) => {
  return await BuyRequirement.create(data);
};

// list function removed

/**
 * Get buy requirement by ID for a specific user
 */
export const getById = async (id, userId) => {
  return await BuyRequirement.findOne({ _id: id, user: userId })
    .populate("verification.category", "name")
    .populate("verification.verifiedBy", "name email")
    .lean();
};

/**
 * Update status
 */
export const updateStatus = async (id, userId, status) => {
  return await BuyRequirement.findOneAndUpdate(
    { _id: id, user: userId },
    { $set: { status, updatedAt: new Date() } },
    { new: true, runValidators: true },
  )
    .populate("verification.category", "name")
    .populate("verification.verifiedBy", "name email")
    .lean();
};
