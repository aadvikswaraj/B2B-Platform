import { Product, Category } from "../../../models/model.js";
import { generateReadUrl } from "../../user/file/service.js";

/**
 * Get categories for search filters (only categories with active approved products)
 */
export const getSearchCategories = async () => {
  // Get distinct category IDs from approved active products
  const categoryIds = await Product.distinct("category", {
    isActive: true,
    "moderation.status": "approved",
  });

  // Fetch category details
  const categories = await Category.find({
    _id: { $in: categoryIds },
    isActive: true,
  })
    .select("name slug _id")
    .sort({ name: 1 })
    .lean();

  return categories;
};

/**
 * Search products with filters
 */
export const searchProducts = async ({
  query = {},
  skip = 0,
  limit = 24,
  sort = { createdAt: -1 },
}) => {
  let [docs, totalCount] = await Promise.all([
    Product.find(query)
      .select(
        "title price images moq status slug description category brand logistics support",
      )
      .populate("category", "name slug")
      .populate("brand", "name")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(query),
  ]);

  await Promise.all(
    docs.map(async (doc) => {
      try {
        doc.image = doc.images?.length
          ? (await generateReadUrl(doc.images[0])).url
          : null;
      } catch {
        doc.image = null;
      }
      return doc;
    }),
  );

  return { docs, totalCount };
};
