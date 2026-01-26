import { api, generateQuery } from "@/utils/api/base";

const base = "/catalog/search";

export const searchProducts = async (params = {}) => {
  const queryString = generateQuery(params);
  return api(`${base}?${queryString}`);
};


export const parseSearchParams = (params = {}) => {
  return {
    q: params?.q || "",
    page: parseInt(params?.page) || 1,
    pageSize: parseInt(params?.pageSize) || 24,
    category: params?.category || null,
    brand: params?.brand || null,
    minPrice: params?.minPrice ? parseFloat(params.minPrice) : null,
    maxPrice: params?.maxPrice ? parseFloat(params.maxPrice) : null,
    inStock: params?.inStock === "true",
    sortBy: params?.sortBy || "relevance",
  };
};

/**
 * Build URL query string from search params (for client-side navigation)
 * @param {Object} params - Search parameters
 * @returns {string} URL query string
 */
export const buildSearchQuery = (params) => {
  const query = new URLSearchParams();

  if (params.q) query.set("q", params.q);
  if (params.page && params.page > 1) query.set("page", params.page.toString());
  if (params.pageSize && params.pageSize !== 24)
    query.set("pageSize", params.pageSize.toString());
  if (params.category) query.set("category", params.category);
  if (params.brand) query.set("brand", params.brand);
  if (params.minPrice) query.set("minPrice", params.minPrice.toString());
  if (params.maxPrice) query.set("maxPrice", params.maxPrice.toString());
  if (params.inStock) query.set("inStock", "true");
  if (params.sortBy && params.sortBy !== "relevance")
    query.set("sortBy", params.sortBy);

  return query.toString();
};

export default {
  searchProducts,
  parseSearchParams,
  buildSearchQuery,
};
