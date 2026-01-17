import { Brand } from "../../../models/model.js";

export const listBrands = async (match, skip, limit, sort = { createdAt: -1 }) => {
  const [docs, totalCount] = await Promise.all([
    Brand.find(match)
      .populate("user", "name email phone")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Brand.countDocuments(match),
  ]);
  return { docs, totalCount };
};

export const updateBrand = async (id, updateData) => {
  return await Brand.findByIdAndUpdate(id, { $set: updateData }, { new: true });
};

export const getBrandById = async (id) => {
  return await Brand.findById(id).populate([
    {
      path: "user",
      select:
        "_id name email phone phoneVerified isSeller isAdmin sellerSuspended userSuspended",
    },
    { path: "kyc.file" },
    { path: "kyc.verifiedBy", select: "_id name email phone" },
  ]);
};
