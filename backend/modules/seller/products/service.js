import mongoose from "mongoose";
import {
  Product,
  Brand,
  Category,
  ProductSpecification,
  Specification,
} from "../../../models/model.js";

/**
 * Get category by ID with full hierarchy & specifications
 */
export const getCategoryById = async (id) => {
  return await Category.findById(id)
    .populate([
      {
        path: "parentCategory",
        populate: {
          path: "parentCategory", // grandparent
        },
      },
      { path: "specifications" },
    ])
    .lean();
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

async function loadSpecsById(specs) {
  return await Specification.find({ _id: { $in: specs } }).lean();
}

/**
 * Get product by ID for seller
 */
export const getById = async (productId, sellerId) => {
  const product = await Product.findOne({
    _id: productId,
    seller: sellerId,
  })
    .populate({
      path: "category",
      select: "name specifications parentCategory depth commission",
      populate: [
        {
          path: "specifications",
          model: "Specification",
        },
        {
          path: "parentCategory",
          select: "name specifications parentCategory depth commission",
          populate: [
            {
              path: "specifications",
              model: "Specification",
            },
            {
              path: "parentCategory",
              select: "name specifications parentCategory depth commission",
              populate: {
                path: "specifications",
                model: "Specification",
              },
            },
          ],
        },
      ],
    })
    .populate("brand", "name")
    .populate("images")
    .lean();

  if (
    product &&
    product.pendingUpdates?.status === "pending" &&
    product.pendingUpdates?.updates
  ) {
    const pendingSpecs = product.pendingUpdates.updates.specifications || [];
    const loadSpecsIds = [];

    for (const spec of pendingSpecs) {
      if (spec.type === "existing" && spec.existing?.specification) {
        loadSpecsIds.push(spec.existing.specification);
      }
    }

    if (loadSpecsIds.length > 0) {
      const specs = await loadSpecsById(loadSpecsIds);
      const specMap = new Map(specs.map((s) => [s._id.toString(), s]));

      for (const spec of pendingSpecs) {
        if (spec.type === "existing" && spec.existing?.specification) {
          const specId = spec.existing.specification.toString();
          if (specMap.has(specId)) {
            spec.existing.specification = specMap.get(specId);
          }
        }
      }
    }
  }
  return product;
};

/**
 * Create new product
 */
export const create = async (data) => {
  return await Product.create(data);
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
          updatedBy: sellerId,
        },
      },
    },
    { new: true, runValidators: true },
  );
};

/**
 * Update core product info as pending draft
 * Does NOT update live fields
 */
/**
 * Deep equality check for primitives, arrays, and objects
 */
const isEqual = (a, b) => {
  if (a === b) return true;
  if (a === null || a === undefined || b === null || b === undefined)
    return a === b;

  // Handle ObjectId vs String comparison
  if (
    (a instanceof mongoose.Types.ObjectId && typeof b === "string") ||
    (b instanceof mongoose.Types.ObjectId && typeof a === "string")
  ) {
    return a.toString() === b.toString();
  }

  if (typeof a !== typeof b) return false;

  // Handle Arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    // For arrays of IDs (strings) or simple values
    // Determine if order matters. For images/specs, order usually matters.
    for (let i = 0; i < a.length; i++) {
      if (!isEqual(a[i], b[i])) return false;
    }
    return true;
  }

  // Handle Objects
  if (typeof a === "object") {
    // Handle ObjectIds (check toString)
    if (a.toString && b.toString && mongoose.isValidObjectId(a.toString())) {
      return a.toString() === b.toString();
    }
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
      if (!keysB.includes(key) || !isEqual(a[key], b[key])) return false;
    }
    return true;
  }

  return false;
};

/**
 * Check if strings differ ONLY by case
 */
const isCaseVariant = (a, b) => {
  if (typeof a !== "string" || typeof b !== "string") return false;
  return a !== b && a.toLowerCase() === b.toLowerCase();
};

/**
 * Update core product info as pending draft
 * - Compares with LIVE product
 * - Removes from draft if matches LIVE (undo)
 * - Updates LIVE directly if only casing changed
 * - Merges into draft if real change
 */
export const updateCoreDraft = async (productId, sellerId, draftData) => {
  const product = await Product.findOne({ _id: productId, seller: sellerId });
  if (!product) throw new Error("Product not found");

  // Edge Case: If product is already pending (new submission), update DIRECTLY.
  // No need for draft logic.
  if (product.moderation?.status === "pending") {
    return await Product.findOneAndUpdate(
      { _id: productId },
      { $set: { ...draftData, pendingUpdates: null } },
      { new: true },
    );
  }

  let currentDraft = product.pendingUpdates?.updates || {};

  const directUpdates = {};
  let hasDirectUpdates = false;

  // Fields mapping to compare against live product
  // We iterate over the INCOMING draftData to decide what to do
  for (const [key, newValue] of Object.entries(draftData)) {
    const liveValue = product[key];

    // 1. Check strict equality
    if (isEqual(liveValue, newValue)) {
      // If it matches live, it shouldn't be in the draft (Undo effect)
      if (currentDraft[key] !== undefined) {
        delete currentDraft[key];
      }
      continue;
    }

    // 2. Check casing variance (Strings only)
    if (isCaseVariant(liveValue, newValue)) {
      // "apple" -> "Apple": Direct update, do not draft
      directUpdates[key] = newValue;
      hasDirectUpdates = true;
      // Remove from draft if present
      if (currentDraft[key] !== undefined) {
        delete currentDraft[key];
      }
      continue;
    }

    // 3. Real change -> Add/Update in Draft
    currentDraft[key] = newValue;
  }

  // Apply direct updates (casing fixes)
  if (hasDirectUpdates) {
    await Product.updateOne({ _id: productId }, { $set: directUpdates });
  }

  // Save the updated draft
  const isEmptyDraft = Object.keys(currentDraft).length === 0;

  if (isEmptyDraft) {
    return await Product.findOneAndUpdate(
      { _id: productId },
      { $unset: { pendingUpdates: 1 } }, // Clear entire pendingUpdates object
      { new: true },
    );
  }

  return await Product.findOneAndUpdate(
    { _id: productId },
    {
      $set: {
        "pendingUpdates.updates": currentDraft,
        "pendingUpdates.status": "pending",
        "pendingUpdates.rejectedReason": null, // Clear previous rejection
        "pendingUpdates.approvedBy": null,
        "pendingUpdates.approvedAt": null,
      },
    },
    { new: true },
  );
};

/**
 * Discard pending draft
 */
export const discardDraft = async (productId, sellerId) => {
  return await Product.findOneAndUpdate(
    { _id: productId, seller: sellerId },
    { $unset: { pendingUpdates: 1 } },
    { new: true },
  );
};
