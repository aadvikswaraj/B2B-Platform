import { Product, Specification } from "../../../models/model.js";

export const getById = async (id) => {
  const product = await Product.findById(id)
    .populate([
      { path: "seller", model: "User", select: "name email phone" },
      { path: "brand", model: "Brand", select: "name kyc" },
      { path: "category", model: "Category", select: "name" },
    ])
    .lean();

  if (!product) return null;

  // Populate pending updates specifications with names
  if (
    product.pendingUpdates?.updates?.specifications &&
    Array.isArray(product.pendingUpdates.updates.specifications)
  ) {
    const specs = product.pendingUpdates.updates.specifications;
    const existingSpecIds = specs
      .filter((s) => s.type === "existing" && s.existing?.specification)
      .map((s) => s.existing.specification);
    console.log(existingSpecIds);
    if (existingSpecIds.length > 0) {
      const specDocs = await Specification.find({
        _id: { $in: existingSpecIds },
      })
        .select("name")
        .lean();

      const specMap = specDocs.reduce((acc, curr) => {
        acc[curr._id.toString()] = curr.name;
        return acc;
      }, {});

      // Mutate the pending updates to include the resolved name
      product.pendingUpdates.updates.specifications = specs.map((s) => {
        if (s.type === "existing" && s.existing?.specification) {
          const specId = s.existing.specification.toString();
          return {
            ...s,
            existing: {
              ...s.existing,
              name: specMap[specId] || "Unknown Spec", // Inject name here
            },
          };
        }
        return s;
      });
    }
  }

  return {
    _id: product._id,
    title: product.title,
    isOrder: product.isOrder,
    description: product.description,
    specifications: product.specifications || [],
    price: product.price,
    currency: product.currency,
    minOrderQuantity: product.minOrderQuantity,
    status: product.status,
    isApproved: product.isApproved,
    moderation: product.moderation,
    pendingUpdates: product.pendingUpdates, // Include pending updates in details
    images: product.images || [],
    seller: product.seller || null,
    brand: product.brand || null,
    category: product.category || null,
    createdAt: product.createdAt,
  };
};

export const verifyProduct = async (id, decision, reason, adminId, isOrder) => {
  const product = await Product.findById(id);
  if (!product) return null;

  const now = new Date();

  // Update isOrder if provided
  if (isOrder !== undefined) {
    product.isOrder = isOrder;
  }

  // Initialize moderation if needed
  if (!product.moderation) {
    product.moderation = {};
  }

  product.moderation.updatedAt = now;

  // Check if we are verifying a pending UPDATE
  if (product.pendingUpdates && product.pendingUpdates.status === "pending") {
    if (decision === "approved") {
      const updates = product.pendingUpdates.updates || {};

      // Merge updates into product
      Object.assign(product, updates);

      // Clear pending updates
      product.pendingUpdates = null;

      // Log approval
      product.moderation.status = "approved";
      product.moderation.rejectedReason = undefined;
      product.moderation.approvedBy = adminId;
      product.moderation.approvedAt = now;
      product.isApproved = true;
    } else if (decision === "rejected") {
      // Reject the update
      product.pendingUpdates.status = "rejected";
      product.pendingUpdates.rejectedReason = reason || "Update rejected";

      // NOTE: Main product status remains whatever it was (e.g. active)
    }
  } else {
    // Standard Verification Flow (New/Draft Product)
    if (decision === "approved") {
      product.moderation.status = "approved";
      product.moderation.rejectedReason = undefined;
      product.moderation.approvedBy = adminId;
      product.moderation.approvedAt = now;

      product.isApproved = true;

      // Update product status if needed
      if (product.status === "draft" || product.status === "rejected") {
        product.status = "active";
      }
    } else if (decision === "rejected") {
      product.moderation.status = "rejected";
      product.moderation.rejectedReason = reason || "Product rejected";
      product.moderation.approvedBy = undefined;
      product.moderation.approvedAt = undefined;

      product.isApproved = false;
      product.status = "rejected";
    }
  }

  return await product.save();
};

export const updateTags = async (id, tags) => {
  return await Product.findByIdAndUpdate(
    id,
    { $set: { tags: tags } },
    { new: true },
  );
};
