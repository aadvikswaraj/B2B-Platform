import { populate } from "dotenv";
import { BuyRequirement } from "../../../models/model.js";

export const list = async (query, skip, limit, sort = { createdAt: -1 }) => {
  const [docs, totalCount] = await Promise.all([
    BuyRequirement.find(query)
      .populate("user", "name email phone")
      .populate("verification.category", "name")
      .populate("verification.verifiedBy", "name")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    BuyRequirement.countDocuments(query),
  ]);
  return { docs, totalCount };
};

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
  if (verificationData.status === "verified") {
    update["verification.category"] = verificationData.category;
  } else {
    update["verification.rejectedReason"] = verificationData.rejectedReason;
  }

  return await BuyRequirement.findByIdAndUpdate(
    id,
    { $set: update },
    { new: true }
  );
};