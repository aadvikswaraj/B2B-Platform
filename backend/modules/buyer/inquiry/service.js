import { Inquiry, Product, BuyRequirement } from "../../../models/model.js";

/**
 * Create new inquiry
 */
export const create = async (data) => {
  // Get product details to extract seller
  const product = await Product.findById(data.product).select("seller").lean();
  
  if (!product) {
    throw new Error("Product not found");
  }

  return await Inquiry.create({
    ...data,
    seller: product.seller,
  });
};

/**
 * List inquiries with query, pagination, and sorting
 */
export const list = async (match, skip, limit, sort = { createdAt: -1 }) => {
  const [docs, totalCount] = await Promise.all([
    Inquiry.find(match)
      .populate("product", "title price images")
      .populate("seller", "name email phone")
      .populate("buyRequirement", "productName status verification")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Inquiry.countDocuments(match),
  ]);
  return { docs, totalCount };
};

/**
 * Get inquiry by ID for a specific user
 */
export const getById = async (id, userId) => {
  return await Inquiry.findOne({ _id: id, user: userId })
    .populate("product", "title price images")
    .populate("seller", "name email phone")
    .populate("buyRequirement", "productName status verification")
    .lean();
};

/**
 * Update fulfillment status and optionally create buy requirement
 */
export const updateFulfillment = async (id, userId, requirementFulfilled) => {
  const inquiry = await Inquiry.findOne({ _id: id, user: userId });
  
  if (!inquiry) {
    throw new Error("Inquiry not found");
  }

  // Update fulfillment status
  inquiry.requirementFulfilled = requirementFulfilled;
  inquiry.fulfilledAt = requirementFulfilled ? new Date() : null;

  // If marking as NOT fulfilled and no buy requirement exists, create one
  if (!requirementFulfilled && !inquiry.buyRequirement) {
    const buyReq = await BuyRequirement.create({
      user: userId,
      productName: inquiry.productName,
      description: `Generated from inquiry for ${inquiry.productName}. Original inquiry: ${inquiry.message || 'N/A'}`,
      quantity: inquiry.quantity,
      unit: inquiry.unit,
      generatedByInquiry: true,
      inquiry: inquiry._id,
      status: "active",
      verification: {
        status: "pending",
      },
    });

    inquiry.buyRequirement = buyReq._id;
  }

  await inquiry.save();
  
  return await Inquiry.findById(id)
    .populate("product", "title price images")
    .populate("seller", "name email phone")
    .populate("buyRequirement", "productName status verification")
    .lean();
};

/**
 * Count inquiries by user
 */
export const countByUser = async (userId) => {
  return await Inquiry.countDocuments({ user: userId });
};
