import { Inquiry, Product } from "../../../models/model.js";

// list function removed

/**
 * Get inquiry by ID (seller access)
 */
export const getById = async (id, sellerId) => {
  return await Inquiry.findOne({ _id: id, seller: sellerId })
    .populate("user", "name email phone")
    .populate("product", "title price images seller")
    .populate("buyRequirement", "productName status verification")
    .lean();
};

/**
 * Get inquiry statistics for seller
 */
export const getInquiryStats = async (sellerId) => {
  const stats = await Inquiry.aggregate([
    { $match: { seller: sellerId } },
    {
      $group: {
        _id: null,
        totalInquiries: { $sum: 1 },
        fulfilledInquiries: {
          $sum: { $cond: [{ $eq: ["$requirementFulfilled", true] }, 1, 0] },
        },
        pendingInquiries: {
          $sum: { $cond: [{ $eq: ["$requirementFulfilled", false] }, 1, 0] },
        },
        conversionRate: {
          $avg: { $cond: [{ $eq: ["$requirementFulfilled", true] }, 100, 0] },
        },
      },
    },
  ]);

  return (
    stats[0] || {
      totalInquiries: 0,
      fulfilledInquiries: 0,
      pendingInquiries: 0,
      conversionRate: 0,
    }
  );
};

/**
 * Get inquiries by product
 */
export const getByProduct = async (productId, sellerId) => {
  // Verify product belongs to seller
  const product = await Product.findOne({
    _id: productId,
    seller: sellerId,
  }).lean();

  if (!product) {
    throw new Error("Product not found");
  }

  return await Inquiry.find({ product: productId, seller: sellerId })
    .populate("user", "name email phone")
    .populate("buyRequirement", "productName status")
    .sort({ createdAt: -1 })
    .lean();
};

/**
 * Count inquiries by seller
 */
export const countBySeller = async (sellerId) => {
  return await Inquiry.countDocuments({ seller: sellerId });
};

/**
 * Get recent inquiries
 */
export const getRecentInquiries = async (sellerId, limit = 10) => {
  return await Inquiry.find({ seller: sellerId })
    .populate("user", "name email phone")
    .populate("product", "title price")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};
