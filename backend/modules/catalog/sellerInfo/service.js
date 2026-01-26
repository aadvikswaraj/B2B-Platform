import { User } from "../../../models/model.js";

/**
 * Get seller contact details by seller ID
 * @param {string} sellerId
 * @returns {Promise<Object>}
 */
export const getSellerContact = async (sellerId) => {
  const seller = await User.findById(sellerId)
    .select("name email phone isSeller businessProfile mobile") // Ensure fields match schema
    .populate("businessProfile", "companyName address website")
    .lean();

  if (!seller) {
    throw new Error("Seller not found");
  }

  // Ensure only sellers are returned or handle as needed
  // if (!seller.isSeller) {
  //   throw new Error("User is not a seller");
  // }

  return {
    _id: seller._id,
    name: seller.name,
    email: seller.email,
    phone: seller.phone || seller.mobile, // Handle different field names if any
    companyName: seller.businessProfile?.companyName,
    website: seller.businessProfile?.website,
    address: seller.businessProfile?.address
  };
};
