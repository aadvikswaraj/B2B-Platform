import { SellerKYC, BusinessProfile, User } from "../../../models/model.js";

export const getKYCByUserId = async (userId) => {
  return await SellerKYC.findOne({ user: userId }).populate([
    { path: "pan.file", model: "File" },
    { path: "gstin.file", model: "File" },
    { path: "signature.file", model: "File" },
    { path: "bankAccount.cancelledCheque", model: "File" },
  ]);
};

export const getProfileByUserId = async (userId) => {
  return await BusinessProfile.findOne({ user: userId });
};

export const getUser = async (userId) => {
  return await User.findById(userId).select("name phone");
};

export const updateUserName = async (userId, name) => {
  return await User.findByIdAndUpdate(userId, { name }, { new: true });
};

export const updateUserPhone = async (userId, phone) => {
  return await User.findByIdAndUpdate(userId, { phone }, { new: true });
};

export const getKYCByUserIdForUpdate = async (userId) => {
  return await SellerKYC.findOne({ user: userId });
};

export const createKYC = async (data) => {
  return await SellerKYC.create(data);
};

export const createProfile = async (data) => {
  const profile = await BusinessProfile.create(data);
  return profile;
};
