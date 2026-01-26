import * as buyLeadsService from "./service.js";

export const getBuyLeads = async (req, res, next) => {
  try {
    const { search, category, tags, city, minBudget, maxBudget, page, limit } =
      req.query;

    // Handle array param for tags correctly if passed as ?tags=a&tags=b or comma separated
    let tagsArray = tags;
    if (tags && !Array.isArray(tags)) {
      tagsArray = tags.split(",").map((t) => t.trim());
    }

    const result = await buyLeadsService.getBuyLeads({
      search,
      category,
      tags: tagsArray,
      city,
      minBudget,
      maxBudget,
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
