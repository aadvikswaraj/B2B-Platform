import { Category, File, Specification } from "../../../models/model.js";
import { cleanupOldFile } from "../../../utils/fileCleanup.js";

/**
 * Helper to resolve specifications from frontend format to backend documents
 * Handles both creation of new specs and updates of existing ones
 */
const resolveSpecifications = async (specsData) => {
  if (!specsData || !Array.isArray(specsData)) return [];

  const specIds = [];
  let displayOrder = 0;

  for (const spec of specsData) {
    // 1. Map frontend flat structure to backend nested structure
    const specPayload = {
      name: spec.name,
      required: spec.required || false,
      displayOrder: displayOrder++,
      value: {
        type: spec.type,
        options: spec.options,
        range: spec.range,
        maxLength: spec.maxLength,
      },
    };

    // 2. Upsert logic
    if (spec._id) {
      // Update existing spec
      // We use findByIdAndUpdate to ensure we get a valid ID back even if it didn't change much
      const updated = await Specification.findByIdAndUpdate(
        spec._id,
        specPayload,
        { new: true, upsert: true }, // Upsert ensures if ID provided but not found, it's handled (though usually _id implies existence)
      );
      if (updated) specIds.push(updated._id);
    } else {
      // Create new spec
      const newSpec = await Specification.create(specPayload);
      specIds.push(newSpec._id);
    }
  }

  return specIds;
};

export const listCategories = async (
  query,
  skip,
  limit,
  sort = { createdAt: -1 },
) => {
  const [docs, totalCount] = await Promise.all([
    Category.find(query)
      .populate([
        {
          path: "parentCategory",
          populate: {
            path: "parentCategory", // grandparent
          },
        },
        { path: "specifications" },
        { path: "image", select: "relativePath originalName mimeType" },
      ])
      .select("-__v")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Category.countDocuments(query),
  ]);
  return { docs, totalCount };
};

export const getTreeData = async (query, limit) => {
  return await Category.find(query)
    .select("name slug parentCategory depth ancestors")
    .sort({ depth: 1, name: 1 })
    .limit(limit)
    .lean();
};

export const getSuggestions = async (query, limit) => {
  return await Category.find(query)
    .select("name slug depth parentCategory")
    .limit(limit)
    .lean();
};

export const getCategoryById = async (id) => {
  console.log("Fetching category by ID:", id);
  return await Category.findById(id)
    .populate([
      {
        path: "parentCategory",
        populate: {
          path: "parentCategory", // grandparent
        },
      },
      { path: "specifications" },
      { path: "image", select: "relativePath originalName mimeType" },
    ])
    .lean();
};

export const getAncestors = async (ids) => {
  return await Category.find({ _id: { $in: ids } })
    .select("commission")
    .lean();
};
export const updateBulkStatus = async (ids, isActive) => {
  return await Category.updateMany(
    { _id: { $in: ids } },
    { $set: { isActive } },
  );
};

export const createCategory = async (data) => {
  if (data.image) {
    const fileExists = await File.exists({ _id: data.image });
    if (!fileExists) {
      throw new Error("File not found");
    }
  }
  if (data.parentCategory) {
    const parentExists = await Category.exists({ _id: data.parentCategory });
    if (!parentExists) {
      throw new Error("Parent category not found");
    }
  }

  // Handle specifications
  if (data.specifications) {
    data.specifications = await resolveSpecifications(data.specifications);
  }

  return await Category.create(data);
};

export const updateCategory = async (id, data, originalImageId = null) => {
  // Get current category to check for image change
  const currentCategory = await Category.findById(id).select("image").lean();
  const dbImageId =
    currentCategory?.image?.toString?.() || currentCategory?.image;

  // Use originalImageId from frontend if provided, otherwise use DB value
  // This handles the case where frontend tracks the original value more reliably
  const oldImageId = originalImageId || dbImageId;

  if (data.image) {
    const fileExists = await File.exists({ _id: data.image });
    if (!fileExists) {
      throw new Error("File not found");
    }
  }

  // Handle specifications
  if (data.specifications) {
    data.specifications = await resolveSpecifications(data.specifications);
  }

  // Don't allow parentCategory change in edit mode
  // Parent is immutable after creation to maintain tree integrity
  delete data.parentCategory;

  const updatedCategory = await Category.findByIdAndUpdate(id, data, {
    new: true,
  });

  // Cleanup old image file if it was replaced or removed
  const newImageId = data.image?.toString?.() || data.image || null;
  if (oldImageId && oldImageId !== newImageId) {
    // Fire and forget - don't block the response
    cleanupOldFile(oldImageId, newImageId).catch((err) => {
      console.warn("Failed to cleanup old category image:", err);
    });
  }

  return updatedCategory;
};

export const deleteCategory = async (id) => {
  return await Category.findByIdAndDelete(id);
};
