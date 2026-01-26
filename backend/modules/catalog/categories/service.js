import { populate } from "dotenv";
import { Category } from "../../../models/model.js";

export const listCategories = async (query, sort, skip, limit) => {
  const [items, total] = await Promise.all([
    Category.find(query)
      .select("name slug depth parentCategory")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Category.countDocuments(query),
  ]);
  return { items, total };
};

export const getCategoryById = async (id) => {
  return Category.findById(id)
    .populate("specifications")
    .populate({
      path: "parentCategory",
      populate: {
        path: "specifications",
      },
    })
    .lean();
};
