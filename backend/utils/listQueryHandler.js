import Joi from "joi";
import { sendResponse } from "../middleware/responseTemplate.js";
import { jsonStringToObject, validateRequest } from "./customValidators.js";

/**
 * Parse and normalize list query parameters from request
 */
export const parseListParams = (req) => {
  const { search, filters, sort, page, pageSize } = req.validatedQuery || req.query;
  
  const parsedPage = parseInt(page) || 1;
  const parsedPageSize = Math.min(100, parseInt(pageSize) || 10);
  const skip = (parsedPage - 1) * parsedPageSize;

  return {
    search: search?.trim() || null,
    filters: filters || {},
    sort,
    page: parsedPage,
    pageSize: parsedPageSize,
    skip,
  };
};

/**
 * Build MongoDB text search query for multiple fields
 */
export const buildSearchQuery = (search, fields = []) => {
  if (!search || !fields.length) return {};
  
  return {
    $or: fields.map(field => ({
      [field]: { $regex: search, $options: "i" }
    }))
  };
};

/**
 * Build MongoDB sort object from sort params
 */
export const buildSortObject = (sort, defaultSort = { createdAt: -1 }) => {
  if (!sort?.field) return defaultSort;
  return { [sort.field]: sort.order === "desc" ? -1 : 1 };
};


export const buildFilterQuery = (filters, filterMap = {}) => {
  const query = {};
  
  for (const [key, builder] of Object.entries(filterMap)) {
    const value = filters[key];
    if (value !== undefined && value !== null && value !== "") {
      Object.assign(query, typeof builder === "function" ? builder(value) : { [builder]: value });
    }
  }
  
  return query;
};

/**
 * Send standardized list response
 */
export const sendListResponse = (res, { docs, totalCount, page, pageSize }) => {
  res.locals.response = {
    success: true,
    status: 200,
    data: {
      docs,
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    },
  };
  return sendResponse(res);
};

/**
 * Send standardized error response
 */
export const sendErrorResponse = (res, error, status = 500) => {
  console.error("List query error:", error);
  res.locals.response = {
    success: false,
    message: error.message || "Internal server error",
    status,
  };
  return sendResponse(res);
};
 
export const createListController = ({
  service,
  searchFields = [],
  filterMap = {},
  defaultSort = { createdAt: -1 },
  buildQuery = null,
  callService = null,
}) => {
  return async (req, res) => {
    try {
      const { search, filters, sort, page, pageSize, skip } = parseListParams(req);

      // Build query: custom builder or default
      const query = buildQuery 
        ? {
            ...buildSearchQuery(search, searchFields),
            ...buildQuery(filters, req),
          }
        : {
            ...buildSearchQuery(search, searchFields),
            ...buildFilterQuery(filters, filterMap),
          };

      const sortObj = buildSortObject(sort, defaultSort);
      
      // Call service: custom caller or default
      const result = callService
        ? await callService(service, { query, skip, pageSize, sort: sortObj, req })
        : await service(query, skip, pageSize, sortObj);

      const { docs, totalCount } = result;

      return sendListResponse(res, { docs, totalCount, page, pageSize });
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  };
};

// ============================================================
// VALIDATOR HELPERS
// ============================================================

export const createListSchema = ({
  filters = Joi.object({}),
  sortFields = ["createdAt"],
  defaultSortField = "createdAt",
  defaultSortOrder = "desc",
} = {}) => {
  return Joi.object({
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().allow("", null).optional(),
    filters: jsonStringToObject(filters.default({})),
    sort: jsonStringToObject(
      Joi.object({
        field: Joi.string().valid(...sortFields).default(defaultSortField),
        order: Joi.string().valid("asc", "desc").default(defaultSortOrder),
      }).default({ field: defaultSortField, order: defaultSortOrder })
    ),
  }).unknown(false);
};

// ============================================================
// SERVICE HELPERS  
// ============================================================


export const createListService = (Model, { populate = null } = {}) => {
  return async (query, skip, limit, sort = { createdAt: -1 }) => {
    let findQuery = Model.find(query).sort(sort).skip(skip).limit(limit);
    
    if (populate) {
      findQuery = Array.isArray(populate) 
        ? populate.reduce((q, p) => q.populate(p), findQuery)
        : findQuery.populate(populate);
    }

    const [docs, totalCount] = await Promise.all([
      findQuery.lean(),
      Model.countDocuments(query),
    ]);

    return { docs, totalCount };
  };
};

// ============================================================
// ROUTE HELPERS
// ============================================================

/**
 * Create list route middleware array (validation + controller)
 * Returns array of middlewares to spread into router
 * 
 * @example
 * // In routes.js
 * router.get("/", requirePermission("category", "view"), ...createListRoute({
 *   service: categoryService.list,
 *   searchFields: ["name", "slug"],
 *   filterMap: { depth: "depth", isActive: "isActive" },
 *   filters: Joi.object({
 *     depth: Joi.number().integer().min(0).max(2).optional(),
 *     isActive: Joi.boolean().truthy("true").falsy("false").optional(),
 *   }),
 *   sortFields: ["name", "createdAt"],
 * }));
 */
export const createListRoute = ({
  // Controller options
  service,
  searchFields = [],
  filterMap = {},
  defaultSort = { createdAt: -1 },
  buildQuery = null,
  callService = null,
  // Validator options
  filters = Joi.object({}),
  sortFields = ["createdAt"],
  defaultSortField = "createdAt",
  defaultSortOrder = "desc",
}) => {
  const schema = createListSchema({ filters, sortFields, defaultSortField, defaultSortOrder });
  const controller = createListController({ service, searchFields, filterMap, defaultSort, buildQuery, callService });
  
  return [validateRequest(schema, "query"), controller];
};

/**
 * Ultimate list endpoint creator - ONE function for everything
 * Creates service + validator + controller internally from Model
 * 
 * @example
 * // In routes.js - Simplest usage
 * router.get("/", requireLogin, ...listEndpoint({
 *   model: Category,
 *   searchFields: ["name", "slug"],
 *   filterMap: { depth: "depth", isActive: "isActive" },
 *   filters: Joi.object({
 *     depth: Joi.number().integer().min(0).max(2).optional(),
 *     isActive: Joi.boolean().truthy("true").falsy("false").optional(),
 *   }),
 *   sortFields: ["name", "createdAt"],
 *   populate: { path: "parentCategory", select: "name" },
 * }));
 * 
 * // With user-scoped query (for buyer/seller modules)
 * router.get("/", requireLogin, ...listEndpoint({
 *   model: Brand,
 *   searchFields: ["name"],
 *   buildQuery: (filters, req) => ({
 *     user: req.user._id,
 *     ...(filters?.status && { "kyc.status": filters.status }),
 *   }),
 *   filters: Joi.object({ status: Joi.string().optional() }),
 *   sortFields: ["name", "createdAt"],
 * }));
 */
export const listEndpoint = ({
  // Model (required) - creates service automatically
  model,
  populate = null,
  // OR pass existing service (optional)
  service = null,
  // Query building
  searchFields = [],
  filterMap = {},
  defaultSort = { createdAt: -1 },
  buildQuery = null,
  // Validator options
  filters = Joi.object({}),
  sortFields = ["createdAt"],
  defaultSortField = "createdAt",
  defaultSortOrder = "desc",
}) => {
  // Create service from model if not provided
  const listService = service || createListService(model, { populate });
  
  // Create schema
  const schema = createListSchema({ filters, sortFields, defaultSortField, defaultSortOrder });
  
  // Create controller
  const controller = createListController({
    service: listService,
    searchFields,
    filterMap,
    defaultSort,
    buildQuery,
  });
  
  return [validateRequest(schema, "query"), controller];
};
