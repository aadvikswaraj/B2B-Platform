import { BuyRequirement } from "../../../models/model.js";

/**
 * Create new buy requirement
 */
export const createRequirement = async (data) => {
  return await BuyRequirement.create(data);
};

/**
 * List buy requirements with query, pagination, and sorting
 */
export const list = async (match, skip, limit, sort = { createdAt: -1 }) => {
  const [docs, totalCount] = await Promise.all([
    BuyRequirement.find(match)
      .populate("inquiry", "productName message")
      .populate("verification.category", "name")
      .populate("verification.verifiedBy", "name email")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    BuyRequirement.countDocuments(match),
  ]);
  return { docs, totalCount };
};

/**
 * Get buy requirement by ID for a specific user
 */
export const getById = async (id, userId) => {
  return await BuyRequirement.findOne({ _id: id, user: userId })
    .populate("inquiry", "productName message product")
    .populate("verification.category", "name")
    .populate("verification.verifiedBy", "name email")
    .lean();
};

/**
 * Update buy requirement
 */
export const update = async (id, userId, data) => {
  return await BuyRequirement.findOneAndUpdate(
    { _id: id, user: userId },
    { $set: { ...data, updatedAt: new Date() } },
    { new: true, runValidators: true }
  )
    .populate("inquiry", "productName message")
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
    { new: true, runValidators: true }
  )
    .populate("inquiry", "productName message")
    .populate("verification.category", "name")
    .populate("verification.verifiedBy", "name email")
    .lean();
};

/**
 * Delete buy requirement
 */
export const remove = async (id, userId) => {
  return await BuyRequirement.findOneAndDelete({ _id: id, user: userId });
};

/**
 * Count buy requirements by user
 */
export const countByUser = async (userId) => {
  return await BuyRequirement.countDocuments({ user: userId });
};
