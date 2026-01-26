import { Brand } from "../../../models/model.js";

// listBrands function removed

export const updateBrand = async (id, updateData) => {
  return await Brand.findByIdAndUpdate(id, { $set: updateData }, { new: true });
};

export const getBrandById = async (id) => {
  return await Brand.findById(id)
    .populate([
      {
        path: "user",
        select:
          "_id name email phone phoneVerified isSeller isAdmin sellerSuspended userSuspended",
      },
      { path: "kyc.file" },
      { path: "kyc.verifiedBy", select: "_id name email phone" },
    ])
    .lean();
};
