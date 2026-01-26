import { User, BusinessProfile } from "../../../models/model.js";

export const getUserProfile = async (userId) => {
  return await User.findById(userId)
    .select("-password")
    .populate({
      path: "businessProfile",
      populate: [
        { path: "address", model: "Address" },
        { path: "logo", model: "File" },
        { path: "banners.file", model: "File" },
      ],
    });
};

export const updateUser = async (userId, updates) => {
  return await User.findByIdAndUpdate(userId, updates);
};

export const upsertBusinessProfile = async (userId, updates) => {
  let businessProfile = await BusinessProfile.findOne({ user: userId });
  if (!businessProfile) {
    businessProfile = new BusinessProfile({ user: userId });
  }
  Object.assign(businessProfile, updates);
  return await businessProfile.save();
};

export const linkBusinessProfileToUser = async (userId, profileId) => {
  return await User.findByIdAndUpdate(userId, { businessProfile: profileId });
};
