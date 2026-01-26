import { BuyRequirement } from "../../../models/model.js";

/**
 * Get verified buy leads for sellers with filtering and pagination
 * @param {Object} query - Query parameters
 * @param {string} query.search - Search term for product name
 * @param {string} query.category - Category ID
 * @param {string[]} query.tags - Array of tags
 * @param {string} query.city - City name
 * @param {number} query.minBudget - Minimum budget
 * @param {number} query.maxBudget - Maximum budget
 * @param {number} query.page - Page number
 * @param {number} query.limit - Items per page
 * @returns {Promise<Object>} - Paginated results
 */
export const getBuyLeads = async ({
  search,
  category,
  tags,
  city,
  minBudget,
  maxBudget,
  page = 1,
  limit = 20,
}) => {
  const query = {
    "verification.status": "verified",
    status: "active",
  };

  if (search) {
    query.productName = { $regex: search, $options: "i" };
  }

  if (category) {
    query["verification.category"] = category;
  }

  if (tags && tags.length > 0) {
    query.tags = { $in: tags };
  }

  if (city) {
    query.city = { $regex: city, $options: "i" };
  }

  if (minBudget || maxBudget) {
    query["budget.min"] = {};
    if (minBudget) query["budget.min"].$gte = Number(minBudget);
    // Ideally user filters by their budget range vs requirement budget range,
    // but for simplicity we'll check if requirement's min budget fits.
    // Or strictly checking overlap:
    // This simple logic filters requirements where the *minimum* budget is within the requested range.
    if (maxBudget) query["budget.min"].$lte = Number(maxBudget);

    // Cleanup empty object if one condition is missing
    if (Object.keys(query["budget.min"]).length === 0)
      delete query["budget.min"];
  }

  const skip = (page - 1) * limit;

  const [leads, total] = await Promise.all([
    BuyRequirement.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name") // Show buyer name? careful with privacy. Maybe just generic info.
      // Keeping user populated for now, frontend can decide what to show (e.g. "V***")
      .populate("verification.category", "name"),
    BuyRequirement.countDocuments(query),
  ]);

  return {
    leads,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
  };
};
