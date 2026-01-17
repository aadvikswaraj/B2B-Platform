import { Product, Brand, Category } from "../../../models/model.js";

/**
 * Get category by ID
 */
export const getCategoryById = async (id) => {
  return await Category.findById(id).select("_id").lean();
};

/**
 * Get verified brand for seller
 */
export const getVerifiedBrand = async (brandId, userId) => {
  return await Brand.findOne({
    _id: brandId,
    user: userId,
    "kyc.status": "verified",
  })
    .select("_id")
    .lean();
};

/**
 * List products for seller with filters and pagination
 */
export const list = async (sellerId, match, skip, limit, sort = { createdAt: -1 }) => {
  // Add seller filter
  const query = {
    ...match,
    seller: sellerId,
    status: { $ne: "deleted" }, // Exclude deleted products
  };

  const [docs, totalCount] = await Promise.all([
    Product.find(query)
      .populate("category", "name")
      .populate("brand", "name")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(query),
  ]);

  return { docs, totalCount };
};

/**
 * Get product by ID for seller
 */
export const getById = async (productId, sellerId) => {
  return await Product.findOne({
    _id: productId,
    seller: sellerId,
    status: { $ne: "deleted" },
  })
    .populate("category", "name")
    .populate("brand", "name")
    .lean();
};

/**
 * Create new product
 */
export const create = async (data) => {
  return await Product.create(data);
};

/**
 * Update product
 * If product was approved, reset moderation status to pending for reverification
 */
export const update = async (productId, sellerId, data) => {
  // Fetch current product
  const product = await Product.findOne({
    _id: productId,
    seller: sellerId,
    status: { $ne: "deleted" },
  });

  if (!product) {
    return null;
  }

  // Check if product was previously approved
  const wasApproved = product.moderation?.status === "approved" || product.isApproved;

  // If product was approved, push for reverification
  if (wasApproved) {
    data.moderation = {
      status: "pending",
      rejectedReason: "",
      updatedAt: new Date(),
    };
    data.isApproved = false;
  }

  // Update product
  return await Product.findByIdAndUpdate(
    productId,
    { $set: data },
    { new: true, runValidators: true }
  );
};

/**
 * Soft delete product (flag as deleted)
 */
export const remove = async (productId, sellerId) => {
  return await Product.findOneAndUpdate(
    {
      _id: productId,
      seller: sellerId,
      status: { $ne: "deleted" },
    },
    {
      $set: {
        status: "deleted",
        isApproved: false,
      },
    },
    { new: true }
  );
};

/**
 * Update trade info (instant update, logs history)
 * Does NOT affect moderation status
 */
export const updateTradeInfo = async (productId, sellerId, updateData) => {
  const product = await Product.findOne({ _id: productId, seller: sellerId });
  if (!product) return null;

  // Snapshot current state for history
  const historyEntry = {
    updatedAt: new Date(),
    price: product.price,
    stock: product.stock,
    moq: product.moq, // Note: moq is inside price object in schema? No, checked model, moq is inside price schema
    // actually, let's check model again to be sure
  };

  // Re-read model to confirm moq location
  // price: { ..., moq: { type: Number ... } }
  // So product.price.moq is the value. 
  // But history schema I added has `moq` at top level. I'll just store copy.

  // NOTE: Schema for priceStockHistory: { price: Object, stock: Number, moq: Number ... }
  // product.price is the object.

  return await Product.findByIdAndUpdate(
    productId,
    { 
      $set: updateData,
      $push: { 
        priceStockHistory: {
          updatedAt: new Date(),
          price: product.price,
          stock: product.stock,
          moq: product.price?.moq, // best effort extraction
          updatedBy: sellerId
        } 
      }
    },
    { new: true, runValidators: true }
  );
};

/**
 * Update core product info as pending draft
 * Does NOT update live fields
 */
export const updateCoreDraft = async (productId, sellerId, draftData) => {
  return await Product.findOneAndUpdate(
    { _id: productId, seller: sellerId },
    { $set: { pendingUpdates: draftData } },
    { new: true }
  );
};

/**
 * Discard pending updates
 */
export const discardDraft = async (productId, sellerId) => {
  return await Product.findOneAndUpdate(
    { _id: productId, seller: sellerId },
    { $set: { pendingUpdates: null } },
    { new: true }
  );
};
