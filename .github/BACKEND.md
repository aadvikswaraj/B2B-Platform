# Backend Coding Guide 🚀
**Backend architecture and patterns for B2B Platform**

---

## 🎯 Core Philosophy

- **Separation of Concerns**: Controller → Service → Model
- **Validation First**: Always validate before processing
- **Consistent Responses**: Standardized response templates
- **Middleware-Driven**: Leverage middleware for cross-cutting concerns
- **Modular Architecture**: Self-contained, reusable modules
- **DRY Utilities**: Use `listQueryHandler.js` for all list endpoints

---

## 📁 Module Structure Pattern (ALWAYS FOLLOW)

Every backend module MUST have this exact structure:
```
backend/modules/{domain}/{moduleName}/
├── controller.js   # HTTP request/response handling
├── service.js      # Business logic & database operations
├── validator.js    # Joi validation schemas
└── routes.js       # Route definitions & middleware chain
```

### Example Module Structure
```
backend/modules/
├── admin/
│   ├── brandVerification/
│   │   ├── controller.js
│   │   ├── service.js
│   │   ├── validator.js
│   │   └── routes.js
│   ├── buyRequirement/
│   ├── category/
│   └── routes.js      # Domain-level aggregator
├── seller/
│   ├── brands/
│   ├── products/
│   └── registration/
└── buyer/
    └── buyRequirement/
```

---

## 🚀 List Query Handler (PREFERRED FOR ALL LIST ENDPOINTS)

The `listQueryHandler.js` utility provides standardized functions for list endpoints. **Always use this for new modules.**

### Location
```
backend/utils/listQueryHandler.js
```

### Exports
- `createListController` - Create list controller with common logic
- `createListSchema` - Create Joi schema for list endpoint validation
- `parseListParams` - Parse list params from request
- `buildSearchQuery` - Build MongoDB text search query
- `buildFilterQuery` - Build MongoDB filter query
- `buildSortObject` - Build MongoDB sort object
- `sendListResponse` - Send standardized list response
- `sendErrorResponse` - Send standardized error response
- `createListService` - Create standard list service (optional)

### Controller Pattern (RECOMMENDED)

```javascript
import * as moduleService from "./service.js";
import { createListController } from "../../../utils/listQueryHandler.js";

/**
 * List items with pagination, search, and filters
 * @route GET /api/module/list
 */
export const list = createListController({
  service: moduleService.list,
  searchFields: ["name", "email", "phone"],
  filterMap: {
    status: "status",
    isActive: "isActive",
    category: "category",
  },
});
```

### createListController Options

| Option | Type | Description |
|--------|------|-------------|
| `service` | Function | Service function `(query, skip, limit, sort) => { docs, totalCount }` |
| `searchFields` | string[] | Fields to search in with regex |
| `filterMap` | Object | Simple filter mapping (key → field or function) |
| `defaultSort` | Object | Default sort object, default `{ createdAt: -1 }` |
| `buildQuery` | Function | Custom query builder `(filters, req) => query` |
| `callService` | Function | Custom service caller for non-standard signatures |

### Usage Examples

#### Simple Usage (Most Common)
```javascript
// controller.js
export const list = createListController({
  service: userService.list,
  searchFields: ["name", "email"],
  filterMap: {
    status: (v) => ({ userSuspended: v === "suspended" }),
    role: "role",
  },
});
```

#### User-Scoped Query
```javascript
// For buyer/seller modules that need user._id filtering
export const list = createListController({
  service: brandService.list,
  searchFields: ["name"],
  buildQuery: (filters, req) => ({
    user: req.user._id,
    ...(filters?.status && { "kyc.status": filters.status }),
  }),
});
```

#### Custom Service Call
```javascript
// When service has non-standard signature
export const list = createListController({
  service: productService.list,
  searchFields: ["title", "description"],
  filterMap: { status: "status" },
  callService: (service, { query, skip, pageSize, sort, req }) => 
    service(req.user._id, query, skip, pageSize, sort),
});
```

### Validator Pattern (RECOMMENDED)

```javascript
import Joi from "joi";
import { createListSchema } from "../../../utils/listQueryHandler.js";

export const listSchema = createListSchema({
  filters: Joi.object({
    status: Joi.string().valid("pending", "approved", "rejected").optional(),
    isActive: Joi.boolean().truthy("true").falsy("false").optional(),
  }),
  sortFields: ["name", "createdAt", "updatedAt"],
});
```

### createListSchema Options

| Option | Type | Description |
|--------|------|-------------|
| `filters` | Joi.object | Filter schema (automatically wrapped with jsonStringToObject) |
| `sortFields` | string[] | Allowed sort field names |
| `defaultSortField` | string | Default sort field, default `"createdAt"` |
| `defaultSortOrder` | string | Default sort order `"asc"` or `"desc"`, default `"desc"` |

### Service Pattern (Standard Signature)

```javascript
import { Model } from "../../../models/model.js";

/**
 * List items with query, pagination, and sorting
 */
export const list = async (query, skip, limit, sort = { createdAt: -1 }) => {
  const [docs, totalCount] = await Promise.all([
    Model.find(query)
      .populate("user", "name email")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Model.countDocuments(query),
  ]);
  return { docs, totalCount };
};
```

### Routes Pattern

```javascript
import express from "express";
import * as controller from "./controller.js";
import * as validator from "./validator.js";
import requireLogin from "../../../middleware/requireLogin.js";
import { validateRequest } from "../../../utils/customValidators.js";

const router = express.Router();

// ALWAYS use "query" as second argument for list endpoints
router.get(
  "/list",
  requireLogin,
  validateRequest(validator.listSchema, "query"),
  controller.list
);

export default router;
```

---

## 📜 File-by-File Breakdown (Manual Pattern)

For non-list endpoints or when custom logic is needed, use this pattern:

### **1. controller.js** - Request/Response Handler

**Purpose**: Handle HTTP requests, call services, return responses

**Pattern**:
```javascript
import * as moduleService from "./service.js";
import { sendResponse } from "../../../middleware/responseTemplate.js";
import { createListController } from "../../../utils/listQueryHandler.js";

/**
 * List all items with pagination, search, and filters
 */
export const list = createListController({
  service: moduleService.list,
  searchFields: ["name", "slug"],
  filterMap: { status: "status" },
});

/**
 * Get item by ID
 */
export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await moduleService.getById(id);

    if (!item) {
      res.locals.response = {
        success: false,
        message: "Item not found",
        status: 404
      };
    } else {
      res.locals.response = {
        success: true,
        message: "Item fetched successfully",
        status: 200,
        data: item
      };
    }
  } catch (error) {
    res.locals.response = {
      success: false,
      message: error.message,
      status: 500
    };
  }
  return sendResponse(res);
};

/**
 * Create new item
 */
export const create = async (req, res) => {
  try {
    const item = await moduleService.create(req.body, req.user);
    res.locals.response = {
      success: true,
      message: "Item created successfully",
      status: 201,
      data: item
    };
  } catch (error) {
    res.locals.response = {
      success: false,
      message: error.message,
      status: 500
    };
  }
  return sendResponse(res);
};

/**
 * Update item
 */
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await moduleService.update(id, req.body, req.user);

    if (!item) {
      res.locals.response = {
        success: false,
        message: "Item not found",
        status: 404
      };
    } else {
      res.locals.response = {
        success: true,
        message: "Item updated successfully",
        data: item,
        status: 200
      };
    }
  } catch (error) {
    res.locals.response = {
      success: false,
      message: error.message,
      status: 500
    };
  }
  return sendResponse(res);
};

/**
 * Delete item
 */
export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await moduleService.remove(id);

    if (!deleted) {
      res.locals.response = {
        success: false,
        message: "Item not found",
        status: 404
      };
    } else {
      res.locals.response = {
        success: true,
        message: "Item deleted successfully",
        status: 200
      };
    }
  } catch (error) {
    res.locals.response = {
      success: false,
      message: error.message,
      status: 500
    };
  }
  return sendResponse(res);
};
```

**Controller Rules:**
- ✅ Always use `try-catch` blocks
- ✅ Use `res.locals.response` and `sendResponse(res)` ONLY
- ✅ Set appropriate HTTP status codes (200, 201, 400, 404, 500)
- ✅ Add JSDoc comments with description only (NO decorators)
- ❌ NO business logic in controllers (delegate to service)
- ❌ NO direct database queries (use service layer)
- ❌ NEVER use `res.json()` or `res.status().json()` directly
- ❌ NEVER use JSDoc decorators like @route, @param, @body, @query, @returns, @throws
- ❌ NEVER use `res.json()` or `res.status().json()` directly

---

### **2. service.js** - Business Logic Layer

**Purpose**: Handle business logic, database operations, data transformations

**Pattern**:
```javascript
import { Model } from "../../../models/model.js";

/**
 * List items with query, pagination, and sorting
 */
export const list = async (match, skip, limit, sort = { createdAt: -1 }) => {
  const [docs, totalCount] = await Promise.all([
    Model.find(match)
      .populate("user", "name email phone")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Model.countDocuments(match),
  ]);
  return { docs, totalCount };
};

/**
 * Get item by ID with populated fields
 */
export const getById = async (id) => {
  return await Model.findById(id)
    .populate("user", "name email phone")
    .lean();
};

/**
 * Create new item
 */
export const create = async (data, user) => {
  const item = new Model({
    ...data,
    user: user._id,
    createdAt: new Date(),
  });
  return await item.save();
};

/**
 * Update item by ID
 */
export const update = async (id, data, user) => {
  return await Model.findByIdAndUpdate(
    id,
    { 
      $set: { 
        ...data, 
        updatedBy: user._id,
        updatedAt: new Date() 
      } 
    },
    { new: true, runValidators: true }
  );
};

/**
 * Delete item by ID
 */
export const remove = async (id) => {
  return await Model.findByIdAndDelete(id);
};

/**
 * Soft delete (mark as deleted)
 */
export const softDelete = async (id, user) => {
  return await Model.findByIdAndUpdate(
    id,
    { 
      $set: { 
        isDeleted: true,
        deletedBy: user._id,
        deletedAt: new Date() 
      } 
    },
    { new: true }
  );
};
```

**Service Rules:**
- ✅ ALL database operations go here
- ✅ Use `Promise.all` for parallel operations
- ✅ Use `.lean()` for read-only queries (performance)
- ✅ Return data, not HTTP responses
- ✅ Add JSDoc comments with description only (NO decorators)
- ❌ NO HTTP response handling (req, res objects)
- ❌ NO `res.json()`, `res.status()`, etc.
- ❌ NEVER use JSDoc decorators like @param, @returns, @throws

---

### **3. validator.js** - Joi Validation Schemas

**Purpose**: Define validation rules for request data

**IMPORTANT: Use `jsonStringToObject()` for filters and sort in list queries**

**Pattern**:
```javascript
import Joi from "joi";
import { objectIdValidator, jsonStringToObject } from "../../../utils/customValidators.js";

export const listSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().allow("", null).optional(),
  filters: jsonStringToObject(Joi.object({
    status: Joi.string().valid("pending", "approved", "rejected").optional(),
    category: objectIdValidator.optional(),
  }).default({})),
  sort: jsonStringToObject(Joi.object({
    field: Joi.string().required(),
    order: Joi.string().valid("asc", "desc").required(),
  }).default({ field: "createdAt", order: "desc" })),
}).unknown(false);

export const createSchema = Joi.object({
  name: Joi.string().trim().min(3).max(100).required(),
  slug: Joi.string().trim().lowercase().pattern(/^[a-z0-9-]+$/).required(),
  description: Joi.string().trim().max(1000).optional(),
  price: Joi.number().positive().precision(2).required(),
  stock: Joi.number().integer().min(0).required(),
  isActive: Joi.boolean().default(true),
}).unknown(false);

export const updateSchema = Joi.object({
  name: Joi.string().trim().min(3).max(100).optional(),
  price: Joi.number().positive().precision(2).optional(),
  stock: Joi.number().integer().min(0).optional(),
}).min(1).unknown(false);

// Conditional validation example
export const conditionalSchema = Joi.object({
  decision: Joi.string().valid("approved", "rejected").required(),
  reason: Joi.string().when("decision", {
    is: "rejected",
    then: Joi.string().min(10).required(),
    otherwise: Joi.forbidden(),
  }),
}).unknown(false);
```

**Validator Rules:**
- ✅ Use Joi for ALL validation
- ✅ Set `.unknown(false)` to reject unknown fields
- ✅ Use `.trim()` for strings
- ✅ Set min/max constraints
- ✅ Use custom validators from `customValidators.js`
- ✅ **Use `jsonStringToObject()` for `filters` and `sort` in list schemas**
- ✅ Both filters and sort are JSON strings that need parsing
- ✅ Controllers must use `req.validatedQuery` to access parsed query params

---

### **4. routes.js** - Route Definitions

**Purpose**: Define API routes and apply middleware

**Pattern**:
```javascript
import express from "express";
import * as controller from "./controller.js";
import * as validator from "./validator.js";
import { requirePermission } from "../../../middleware/requireAdmin.js";
import requireLogin from "../../../middleware/requireLogin.js";
import { validateRequest } from "../../../utils/customValidators.js";

const router = express.Router();

// Authenticated routes
router.get(
  "/list",
  requireLogin,
  validateRequest(validator.listSchema, "query"),
  controller.list
);

router.get(
  "/:id",
  requireLogin,
  controller.getById
);

router.post(
  "/",
  requireLogin,
  validateRequest(validator.createSchema),
  controller.create
);

// Admin-only routes
router.post(
  "/:id/approve",
  requirePermission("module", "verify"),
  validateRequest(validator.conditionalSchema),
  controller.approve
);

export default router;
```

**Route Rules:**
- ✅ Middleware order: Auth → Validation → Controller
- ✅ Use `validateRequest` for all data validation
- ✅ Use `requireLogin` for authenticated routes
- ✅ Use `requirePermission` for role-based access

---

## � File Upload Pattern

### Client-Side S3 Upload

Files are uploaded **client-side directly to S3** via the `user/file` module. The backend **only receives file ObjectIds** in request body.

### How It Works

1. **Client Upload**: User uploads file to S3 via frontend using `user/file` API
2. **Receive ObjectId**: Client receives File document ObjectId after successful upload
3. **Send to Backend**: Client includes file ObjectId in request body (e.g., `{ proofFile: "64a7f..." }`)
4. **Backend Validation**: Backend validates ObjectId using `objectIdValidator` in Joi schema
5. **Database Storage**: Store file ObjectId reference in database
6. **Retrieval**: Use `.populate("fieldName")` to get file details when needed

### Pattern Example (Seller Brands)

#### **validator.js** - File Field Validation
```javascript
import Joi from "joi";
import { objectIdValidator } from "../../../utils/customValidators.js";

export const createSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  proofFile: objectIdValidator.required(),  // Validate file ObjectId
}).unknown(false);
```

#### **routes.js** - No File Upload Middleware
```javascript
import express from "express";
import * as controller from "./controller.js";
import * as validator from "./validator.js";
import requireLogin from "../../../middleware/requireLogin.js";
import { validateRequest } from "../../../utils/customValidators.js";

const router = express.Router();

// Create brand with proof file (ObjectId)
router.post(
  "/",
  requireLogin,
  validateRequest(validator.createSchema),  // Validates file ObjectId
  controller.create
);

export default router;
```

#### **controller.js** - Access File ObjectIds
```javascript
import * as brandService from "./service.js";
import { sendResponse } from "../../../middleware/responseTemplate.js";

/**
 * Create new brand with proof document
#### **controller.js** - Access File ObjectIds
```javascript
import * as brandService from "./service.js";
import { sendResponse } from "../../../middleware/responseTemplate.js";

/**
 * Create new brand with proof document
 * @route POST /api/seller/brands
 */
export const create = async (req, res) => {
  try {
    const { name, proofFile } = req.body;  // File ObjectId is in req.body

    if (!proofFile) {
      res.locals.response = {
        success: false,
        message: "Proof file is required",
        status: 400,
      };
      return sendResponse(res);
    }

    const brand = await brandService.create({
      name,
      user: req.user._id,
      kyc: {
        file: proofFile,  // Store file ObjectId in database
        status: "pending",
      },
    });

    res.locals.response = {
      success: true,
      message: "Brand created successfully",
      status: 201,
      data: { id: brand._id },
    };
  } catch (error) {
    res.locals.response = {
      success: false,
      message: error.message,
      status: 500,
    };
  }
  return sendResponse(res);
};

/**
 * Get brand with populated file
 * @route GET /api/seller/brands/:id
 */
export const getById = async (req, res) => {
  try {
    const brand = await brandService.getById(req.params.id, req.user._id);
    
    if (!brand) {
      res.locals.response = {
        success: false,
        message: "Brand not found",
        status: 404,
      };
      return sendResponse(res);
    }

    res.locals.response = {
      success: true,
      data: brand,  // File ObjectId is populated, frontend handles URL rendering
      status: 200,
    };
  } catch (error) {
    res.locals.response = {
      success: false,
      message: error.message,
      status: 500,
    };
  }
  return sendResponse(res);
};
```

#### **service.js** - Store File Reference
```javascript
import { Brand } from "../../../models/model.js";

/**
 * Create new brand with file reference
 */
export const create = async (data) => {
  return await Brand.create(data);
};

/**
 * Get brand with populated file
 */
export const getById = async (id, userId) => {
  return await Brand.findOne({ _id: id, user: userId })
    .populate("kyc.file", "relativePath mimeType size")  // Populate file details
    .lean();
};
```

### Best Practices for File Handling

1. **Backend**: Store ObjectIds only, never file paths
2. **Backend**: Use `.populate()` to include file metadata when needed
3. **Frontend**: Fetch actual file URLs from `user/file` API when rendering
4. **Frontend**: Display file metadata (size, type) from populated data
5. **Validation**: Always validate ObjectIds exist before storing
6. **Security**: Frontend handles S3 signed URLs, backend never exposes file paths

### File Upload Rules

- ✅ **Client-Side Upload**: Files are uploaded to S3 via `user/file` module on frontend
- ✅ **ObjectId Only**: Backend only receives file ObjectIds in request body
- ✅ **Validation**: Use `objectIdValidator` for file ID fields in Joi schemas
- ✅ **Storage**: Store file ObjectIds in database, NOT file paths
- ✅ **Retrieval**: Use `.populate("fieldName")` to get file details from database
- ✅ **Frontend Rendering**: Frontend fetches file URLs from `user/file` API using ObjectId
- ❌ **NO Multer**: No `uploadAndSaveFiles` or multer middleware in backend routes
- ❌ **NO File Handling**: Backend does not handle file uploads, only validates ObjectIds
- ❌ **NO Helper Functions**: Do not use `getFileUrl()` or `deleteFiles()` from old middleware

### Multiple File Upload Example

```javascript
// validator.js
export const createSchema = Joi.object({
  name: Joi.string().required(),
  logo: objectIdValidator.required(),
  images: Joi.array().items(objectIdValidator).max(5).optional(),
  documents: Joi.array().items(objectIdValidator).max(3).optional(),
}).unknown(false);

// controller.js
export const create = async (req, res) => {
  const { name, logo, images, documents } = req.body;
  // logo is a single ObjectId
  // images and documents are arrays of ObjectIds
};
```

### File Upload with Conditional Requirements

```javascript
// Validator with conditional file requirement
export const updateSchema = Joi.object({
  status: Joi.string().valid("approved", "rejected").required(),
  rejectedReason: Joi.string().when("status", {
    is: "rejected",
    then: Joi.string().min(10).required(),
    otherwise: Joi.forbidden(),
  }),
  newProofFile: objectIdValidator.when("status", {
    is: "rejected",
    then: Joi.required(),  // Require new file if rejected
    otherwise: Joi.optional(),
  }),
}).unknown(false);
```

### Real Examples

- ✅ `backend/modules/seller/brands/` - Single file ObjectId for brand verification
- ✅ `backend/modules/seller/registration/` - Multiple file ObjectIds for KYC documents
  documents: Joi.array().items(objectIdValidator).max(3).optional(),
}).unknown(false);

// controller.js
export const create = async (req, res) => {
  const { name, logo, images, documents } = req.body;
  // logo is a single ObjectId
  // images and documents are arrays of ObjectIds
};
```

### File Upload with Conditional Requirements

```javascript
// Validator with conditional file requirement
export const updateSchema = Joi.object({
  status: Joi.string().valid("approved", "rejected").required(),
  rejectedReason: Joi.string().when("status", {
    is: "rejected",
    then: Joi.string().min(10).required(),
    otherwise: Joi.forbidden(),
  }),
  newProofFile: objectIdValidator.when("status", {
    is: "rejected",
    then: Joi.required(),  // Require new file if rejected
    otherwise: Joi.optional(),
  }),
}).unknown(false);
```

### Real Examples

- ✅ `backend/modules/seller/brands/` - Single file ObjectId for brand verification
- ✅ `backend/modules/seller/registration/` - Multiple file ObjectIds for KYC documents
- ✅ `backend/modules/admin/category/` - Single file ObjectId for category image

---

## 🛠️ Middleware Chain Order (CRITICAL)

```javascript
router.post(
  "/create",
  requireLogin,                              // 1. Authentication
  requirePermission("brands", "create"),     // 2. Permissions
  validateRequest(validator.createSchema),   // 3. Validation
  controller.create                          // 4. Controller
);
```

### Available Middleware

| Middleware | Purpose | Usage |
|------------|---------|-------|
| `responseTemplate` | Initialize standard response object | Applied globally in `app.js` |
| `requireLogin` | Ensure user is authenticated | `requireLogin` |
| `requirePermission` | Check role-based permissions | `requirePermission("resource", "action")` |
| `validateRequest` | Validate request data with Joi | `validateRequest(schema, source)` |

---

## 🔧 Utils & Custom Validators

### Custom Validators
```javascript
import { 
  objectIdValidator,        // MongoDB ObjectId validation
  jsonStringToObject,       // Parse JSON strings
  reqFileValidator,         // File upload validation
  validateRequest           // Request validation middleware
} from "../../../utils/customValidators.js";
```

### Common Imports
```javascript
// Controller
import { sendResponse } from "../../../middleware/responseTemplate.js";
import * as moduleService from "./service.js";

// Routes
import { validateRequest } from "../../../utils/customValidators.js";
import requireLogin from "../../../middleware/requireLogin.js";
import { requirePermission } from "../../../middleware/requireAdmin.js";

// Validator
import Joi from "joi";
import { objectIdValidator } from "../../../utils/customValidators.js";

// Service
import { Model } from "../../../models/model.js";
```

---

## 📦 Response Format (ALWAYS USE)

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "item": { ... },
    "totalCount": 100,
    "page": 1,
    "pageSize": 10
  },
  "status": 200
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "data": {},
  "status": 400
}
```

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Not authenticated |
| 403 | Forbidden | Not authorized |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Internal error |

---

## 🔥 Common Patterns

### Pagination Pattern
```javascript
const page = parseInt(req.query.page) || 1;
const pageSize = Math.min(100, parseInt(req.query.pageSize) || 10);
const skip = (page - 1) * pageSize;
```

### Search Pattern
```javascript
const query = {
  ...(search && {
    $or: [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ],
  }),
};
```

### Filter Pattern
```javascript
const query = {
  ...(filters?.status && { status: filters.status }),
  ...(filters?.category && { category: filters.category }),
};
```

### Sort Pattern
```javascript
const sortObj = sort?.field 
  ? { [sort.field]: sort.order === "desc" ? -1 : 1 }
  : { createdAt: -1 };
```

---

## 🚀 Creating New Backend Module (Step-by-Step)

### Step 1: Create Module Structure
```bash
mkdir -p backend/modules/{domain}/{moduleName}
cd backend/modules/{domain}/{moduleName}
touch controller.js service.js validator.js routes.js
```

### Step 2: Implement Service Layer
```javascript
// service.js - Database operations
import { Model } from "../../../models/model.js";

export const list = async (match, skip, limit, sort) => {
  const [docs, totalCount] = await Promise.all([
    Model.find(match).sort(sort).skip(skip).limit(limit).lean(),
    Model.countDocuments(match),
  ]);
  return { docs, totalCount };
};
```

### Step 3: Implement Validator
```javascript
// validator.js - Joi schemas
import Joi from "joi";

export const createSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional(),
}).unknown(false);
```

### Step 4: Implement Controller
```javascript
// controller.js - Request handlers
import * as moduleService from "./service.js";
import { sendResponse } from "../../../middleware/responseTemplate.js";

export const create = async (req, res) => {
  try {
    const item = await moduleService.create(req.body);
    res.locals.response.data = item;
    res.locals.response.status = 201;
    return sendResponse(res);
  } catch (error) {
    res.locals.response.success = false;
    res.locals.response.message = error.message;
    res.locals.response.status = 500;
    return sendResponse(res);
  }
};
```

### Step 5: Define Routes
```javascript
// routes.js - Route definitions
import express from "express";
import * as controller from "./controller.js";
import * as validator from "./validator.js";
import { validateRequest } from "../../../utils/customValidators.js";
import requireLogin from "../../../middleware/requireLogin.js";

const router = express.Router();

router.post(
  "/",
  requireLogin,
  validateRequest(validator.createSchema),
  controller.create
);

export default router;
```

### Step 6: Register Routes
```javascript
// backend/modules/{domain}/routes.js
import express from "express";
import moduleRoutes from "./{moduleName}/routes.js";

const router = express.Router();
router.use("/{module-name}", moduleRoutes);

export default router;
```

---

## 📚 Real Examples to Learn From

- ✅ `backend/modules/admin/brandVerification/` - Full CRUD with approval workflow
- ✅ `backend/modules/admin/buyRequirement/` - List, filter, pagination
- ✅ `backend/modules/admin/category/` - Category management
- ✅ `backend/modules/seller/brands/` - Seller-specific operations
- ✅ `backend/middleware/` - All middleware patterns
- ✅ `backend/utils/customValidators.js` - Validation helpers

---

## ✅ Module Creation Checklist

- [ ] Create module folder structure
- [ ] Implement `service.js` (database operations)
- [ ] Implement `validator.js` (Joi schemas with `.unknown(false)`)
- [ ] Implement `controller.js` (using `sendResponse(res)`)
- [ ] Implement `routes.js` (with middleware chain)
- [ ] Add JSDoc comments with description only (NO decorators)
- [ ] Use `try-catch` blocks in all controllers
- [ ] Apply appropriate middleware (auth, validation, permissions)
- [ ] Set correct HTTP status codes
- [ ] Test all endpoints
- [ ] Register routes in domain aggregator
- [ ] Document API endpoints

---

## 🎯 Best Practices

### DO ✅
- Separate concerns (Controller → Service → Model)
- Use middleware for cross-cutting concerns
- Validate all inputs with Joi
- Use standardized response templates
- Add descriptive JSDoc comments
- Use async/await for async operations
- Handle errors gracefully with try-catch
- Use `.lean()` for read-only MongoDB queries
- Use `Promise.all` for parallel operations
- Log errors with context

### DON'T ❌
- Put business logic in controllers
- Make database queries in controllers
- Forget to validate user input
- Use inconsistent response formats
- Ignore error handling
- Use synchronous operations for I/O
- Hardcode values (use config/env)
- Expose sensitive data in responses
- Skip middleware authentication/validation
- Use `res.json()` directly (use `sendResponse(res)`)

---

## 📝 Naming Conventions

### Files & Folders
- Modules: `camelCase` (e.g., `brandVerification`, `buyRequirement`)
- Files: `camelCase.js` (e.g., `controller.js`, `service.js`)
- Routes: `kebab-case` (e.g., `/brand-verification`, `/buy-requirement`)

### Functions
- Controllers: `camelCase` verbs (e.g., `list`, `getById`, `create`, `update`, `remove`)
- Services: Descriptive (e.g., `listBrands`, `getBrandById`, `updateBrandStatus`)
- Validators: Schema names (e.g., `listSchema`, `createSchema`, `updateSchema`)

### Variables
- Request data: Descriptive (e.g., `{ search, filters, sort, page, pageSize }`)
- Database results: `docs`, `totalCount`, `item`, `items`
- MongoDB queries: `query`, `match`, `sortObj`

---

## 🌟 Conclusion

This guide is the **antigravity** of backend development - it makes complex architecture feel effortless. 

**Follow these patterns religiously for consistent, maintainable, and scalable backend code.**

**Remember**: Structure is freedom. Consistency is productivity. Vibe coding is flow state. 🚀
