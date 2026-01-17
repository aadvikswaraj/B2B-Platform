import { Brand, Product, File } from "../../../models/model.js";
import { generateReadUrl } from "../../user/file/service.js";
import isEqual from "lodash/isEqual.js";

/**
 * List brands with query, pagination, and sorting
 */
export const list = async (match, skip, limit, sort = { createdAt: -1 }) => {
  const [docs, totalCount] = await Promise.all([
    Brand.find(match)
      .populate("kyc.file", "relativePath")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Brand.countDocuments(match),
  ]);
  return { docs, totalCount };
};

/**
 * Create new brand
 */
export const create = async (data) => {
  if (data.proofFile) {
    const proofFileExists = await File.exists({ _id: data.proofFile });
    if (!proofFileExists) {
      throw new Error("File not found");
    }
  }
  if (await Brand.exists({name:data.name, user:data.user})) {
    throw new Error("Brand with this name already exists for the user");
  }
  return await Brand.create({
    name: data.name,
    user: data.user,
    kyc: { file: data.proofFile, status: "pending" },
  });
};

/**
 * Get brand by ID for a specific seller with populated file
 */
export const getById = async (id, userId) => {
  const brand = await Brand.findOne({ _id: id, user: userId })
    .lean();
  brand.kyc.file = await generateReadUrl(brand.kyc.file);
  return brand;
};

/**
 * Get brand by ID for update operations
 */
export const update = async (id, userId, data) => {
  const brand = await Brand.findOne({ _id: id, user: userId })
    .select("name kyc")
    .lean();

  if (!brand) return { updated: false, brand: null };

  const nameChanged = brand.name !== data.name;
  const fileChanged = data.proofFile && brand.kyc?.file?.toString() !== data.proofFile;

  if (nameChanged || fileChanged) {
    const newData = {
      name: data.name,
      updatedAt: new Date(),
      "kyc.status": "pending", // Reset status on update
    };

    if (fileChanged) {
      newData["kyc.file"] = data.proofFile;
    }

    const updatedBrand = await Brand.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: newData },
      { new: true, runValidators: true }
    ).lean();

    return { updated: true, brand: updatedBrand };
  }

  return { updated: false, brand };
};

/**
 * Resubmit brand proof
 */
export const resubmit = async (id, userId, proofFile) => {
  return await Brand.findOneAndUpdate(
    { _id: id, user: userId },
    {
      $set: {
        "kyc.file": proofFile,
        "kyc.status": "pending",
        "kyc.rejectedReason": "",
        "kyc.verifiedBy": null,
        "kyc.verifiedAt": null,
        updatedAt: new Date(),
      },
    },
    { new: true, runValidators: true }
  )
    .populate("kyc.file", "relativePath")
    .lean();
};

/**
 * Count products associated with a brand
 */
export const countProductsByBrand = async (brandId) => {
  return await Product.countDocuments({ brand: brandId });
};

/**
 * Reassign products from one brand to another
 */
export const reassignProducts = async (oldBrandId, newBrandId) => {
  const result = await Product.updateMany(
    { brand: oldBrandId },
    { $set: { brand: newBrandId, updatedAt: new Date() } }
  );
  return result;
};

/**
 * Delete brand and associated file
 */
export const remove = async (id, userId) => {
  // Get brand to retrieve file ID before deletion
  const brand = await Brand.findOne({ _id: id, user: userId }).lean();
  
  if (!brand) {
    throw new Error("Brand not found");
  }

  // Delete the brand
  await Brand.findOneAndDelete({ _id: id, user: userId });

  // Delete associated file if exists
  if (brand.kyc?.file) {
    try {
      await File.findByIdAndDelete(brand.kyc.file);
    } catch (fileError) {
      console.error("Error deleting brand file:", fileError);
      // Continue even if file deletion fails
    }
  }

  return { deleted: true };
};
