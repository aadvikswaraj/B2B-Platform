import * as searchService from "./service.js";
import { sendResponse } from "../../../middleware/responseTemplate.js";

/**
 * Search products with filters, sort, and pagination
 * Returns products, categories for filters, and pagination info
 */
export const search = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 24,
      q,
      category,
      brand,
      minPrice,
      maxPrice,
      inStock,
      sortBy = "relevance",
    } = req.validatedQuery || req.query;

    // Parse pagination
    const parsedPage = parseInt(page) || 1;
    const parsedPageSize = Math.min(100, parseInt(pageSize) || 24);
    const skip = (parsedPage - 1) * parsedPageSize;

    // Build base query - MANDATORY: only active, approved products
    const query = {
      isActive: true,
      "moderation.status": "approved",
    };

    // Text search
    if (q && q.trim()) {
      query.$or = [
        { title: { $regex: q.trim(), $options: "i" } },
        { description: { $regex: q.trim(), $options: "i" } },
      ];
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Brand filter
    if (brand) {
      query.brand = brand;
    }

    // Price filter (using singlePrice for simplicity)
    if (minPrice !== undefined || maxPrice !== undefined) {
      query["price.singlePrice"] = {};
      if (minPrice !== undefined) {
        query["price.singlePrice"].$gte = parseFloat(minPrice);
      }
      if (maxPrice !== undefined) {
        query["price.singlePrice"].$lte = parseFloat(maxPrice);
      }
    }

    // Stock filter
    if (inStock === true || inStock === "true") {
      query.stock = { $gt: 0 };
    }

    // Build sort object
    let sort = { createdAt: -1 };
    switch (sortBy) {
      case "newest":
        sort = { createdAt: -1 };
        break;
      case "priceLow":
        sort = { "price.singlePrice": 1 };
        break;
      case "priceHigh":
        sort = { "price.singlePrice": -1 };
        break;
      case "title":
        sort = { title: 1 };
        break;
      case "relevance":
      default:
        // For relevance, if there's a search query, we could use text score
        // For now, default to newest
        sort = { createdAt: -1 };
        break;
    }

    // Fetch products and categories in parallel
    const [searchResult, categories] = await Promise.all([
      searchService.searchProducts({
        query,
        skip,
        limit: parsedPageSize,
        sort,
      }),
      searchService.getSearchCategories(),
    ]);

    const { docs, totalCount } = searchResult;
    const totalPages = Math.ceil(totalCount / parsedPageSize);

    // Build response
    res.locals.response.data = {
      products: docs,
      categories,
      pagination: {
        page: parsedPage,
        pageSize: parsedPageSize,
        totalCount,
        totalPages,
        hasNextPage: parsedPage < totalPages,
        hasPrevPage: parsedPage > 1,
      },
      query: {
        q: q || "",
        category: category || null,
        brand: brand || null,
        minPrice: minPrice || null,
        maxPrice: maxPrice || null,
        inStock: inStock || false,
        sortBy,
      },
    };
    res.locals.response.message = "Search results fetched successfully";
    return sendResponse(res);
  } catch (error) {
    console.error("Search error:", error);
    res.locals.response.success = false;
    res.locals.response.message = error.message;
    res.locals.response.status = 500;
    return sendResponse(res);
  }
};
