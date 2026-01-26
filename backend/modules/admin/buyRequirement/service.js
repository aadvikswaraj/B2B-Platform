import { populate } from "dotenv";
import { BuyRequirement } from "../../../models/model.js";

// list function removed

export const getBuyRequirementById = async (id) => {
  return await BuyRequirement.findById(id)
    .populate([
      { path: "user", select: "name email phone" },
      {
        path: "verification.category",
        populate: {
          path: "parentCategory",
          populate: { path: "parentCategory", select: "name" },
          select: "name",
        },
      },
      { path: "verification.verifiedBy", select: "name" },
    ])
    .lean();
};

export const verifyBuyRequirement = async (id, verificationData, adminId) => {
  const update = {
    "verification.status": verificationData.status,
    "verification.verifiedBy": adminId,
    "verification.verifiedAt": new Date(),
  };

  if (verificationData.tags) {
    update["tags"] = verificationData.tags;
  }

  if (verificationData.status === "verified") {
    update["verification.category"] = verificationData.category;
  } else {
    update["verification.rejectedReason"] = verificationData.rejectedReason;
  }

  return await BuyRequirement.findByIdAndUpdate(
    id,
    { $set: update },
    { new: true },
  );
};
