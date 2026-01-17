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

export const listCategoriesForTree = async (query, limit) => {
  return await Category.find(query)
    .select("name parentCategory depth")
    .sort({ depth: 1, name: 1 })
    .limit(limit)
    .lean();
};

export const getCategoryById = async (id) => {
  return await Category.findById(id)
    .populate([
      {
        path: "parentCategory",
        populate: {
          path: "parentCategory", // grandparent
        },
      }
    ])
    .lean();
};

export const getCategoryByIdForCommission = async (id) => {
  return await Category.findById(id);
};
