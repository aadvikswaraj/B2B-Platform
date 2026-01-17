# B2B Platform Coding Guide 🚀
**Universal instructions for all AI assistants (GitHub Copilot, Antigravity IDE, Cursor, etc.)**

---

## 📚 Documentation Structure

This project has separate detailed guides for backend and frontend:

- **Backend Development** → See [BACKEND.md](BACKEND.md)
- **Frontend Development** → See [FRONTEND.md](FRONTEND.md)

The guides below provide quick reference. For detailed patterns and examples, refer to the specific guide files.

---

## 🎯 General Coding Standards

### Languages & Frameworks
- **Language**: JavaScript (ES6+)
- **Backend**: Express.js with modular architecture
- **Frontend**: React (functional components), Next.js
- **Styling**: Tailwind CSS (utility-first)
- **Validation**: Joi for backend, native HTML5 + custom for frontend

### Code Quality
- Clean, modular, reusable code
- Descriptive names for variables, functions, and components
- Inline comments for complex logic, functions, and API endpoints
- Prettier formatting: 2-space indentation, semicolons
- Always use `async/await` for asynchronous operations
- Comprehensive error handling with try-catch blocks

---

## 🏗️ Backend Quick Reference

**SEE [BACKEND.md](BACKEND.md) FOR COMPLETE GUIDE**

### Module Structure (ALWAYS FOLLOW)
```
backend/modules/{domain}/{moduleName}/
├── controller.js   # HTTP request/response handling
├── service.js      # Business logic & database operations
├── validator.js    # Joi validation schemas
└── routes.js       # Route definitions & middleware chain
```

### Key Rules
- ✅ Use `res.locals.response` and `sendResponse(res)` ONLY
- ✅ All database operations in service layer
- ✅ Joi validation with `.unknown(false)`
- ✅ Middleware chain: auth → validation → controller
- ✅ Use `createListController` and `createListSchema` from `listQueryHandler.js` for list endpoints
- ❌ NO `res.json()` or business logic in controllers

### List Endpoint Pattern (RECOMMENDED)
```javascript
// controller.js
import { createListController } from "../../../utils/listQueryHandler.js";

export const list = createListController({
  service: moduleService.list,
  searchFields: ["name", "email"],
  filterMap: { status: "status", isActive: "isActive" },
});

// validator.js
import { createListSchema } from "../../../utils/listQueryHandler.js";

export const listSchema = createListSchema({
  filters: Joi.object({
    status: Joi.string().valid("active", "inactive").optional(),
    isActive: Joi.boolean().truthy("true").falsy("false").optional(),
  }),
  sortFields: ["name", "createdAt"],
});

// routes.js - ALWAYS use "query" as second argument
router.get("/list", requireLogin, validateRequest(validator.listSchema, "query"), controller.list);
```

### Response Pattern
```javascript
// Success
res.locals.response.data = result;
res.locals.response.message = "Success";
res.locals.response.status = 200;
return sendResponse(res);

// Error
res.locals.response.success = false;
res.locals.response.message = error.message;
res.locals.response.status = 500;
return sendResponse(res);
```

### Examples to Learn From
- `backend/modules/admin/brandVerification/`
- `backend/modules/admin/buyRequirement/`
- `backend/modules/seller/brands/`

---

## 🎨 Frontend Quick Reference

**SEE [FRONTEND.md](FRONTEND.md) FOR COMPLETE GUIDE**

### Design Principles
- **Mobile-First**: Design for mobile, enhance for desktop
- **Tailwind CSS**: Use utility classes, avoid custom CSS
- **Responsive**: Stack on mobile, grid on desktop
- **Accessibility**: ARIA labels, keyboard navigation

### Component Pattern
```jsx
import { useState } from 'react';

export default function Component({ data, onAction }) {
  const [state, setState] = useState(initialValue);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      {/* Component content */}
    </div>
  );
}
```

### Responsive Pattern
```jsx
// Stack mobile, grid desktop
<div className="flex flex-col md:grid md:grid-cols-3 gap-4">
  <Card />
  <Card />
</div>

// Hide/show based on screen
<div className="hidden md:block">Desktop Only</div>
<div className="block md:hidden">Mobile Only</div>
```

---

## 🤖 AI Assistant Behavior

### General Guidelines
- Suggest names based on existing project code patterns
- Always follow UI/UX and backend structure rules
- Auto-generate example usage for new components
- Generate responsive layouts automatically
- Generate API documentation (methods, routes, params, responses)
- Generate component documentation (props, usage examples)

### Backend Tasks
- ✅ Read [BACKEND.md](BACKEND.md) for complete backend patterns
- ✅ Always follow the 4-file module structure (controller, service, validator, routes)
- ✅ Use middleware chain: auth → validation → controller
- ✅ Use `res.locals.response` and `sendResponse(res)` ONLY
- ✅ All database operations in service layer
- ✅ **Use `createListController` and `createListSchema` from `listQueryHandler.js` for all list endpoints**
- ✅ Use `req.validatedQuery` in controllers to access parsed query params
- ✅ Service signature for list: `(query, skip, limit, sort)` returning `{ docs, totalCount }`
- ✅ Learn from `backend/modules/admin/` examples

### Frontend Tasks
- ✅ Read [FRONTEND.md](FRONTEND.md) for complete UI/UX patterns
- ✅ Follow mobile-first responsive design
- ✅ Use Tailwind CSS utility classes
- ✅ Generate functional React components
- ✅ Include prop validation
- ✅ Implement proper loading/error states

---

## ✅ Best Practices

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

## 📋 Module Creation Checklist

- [ ] Create module folder structure
- [ ] Implement `service.js` (database operations)
- [ ] Implement `validator.js` (Joi schemas with `.unknown(false)`)
- [ ] Implement `controller.js` (using `sendResponse(res)`)
- [ ] Implement `routes.js` (with middleware chain)
- [ ] Add JSDoc comments with `@route` tags
- [ ] Use `try-catch` blocks in all controllers
- [ ] Apply appropriate middleware (auth, validation, permissions)
- [ ] Set correct HTTP status codes
- [ ] Test all endpoints
- [ ] Register routes in domain aggregator
- [ ] Document API endpoints

---

## 🧪 Testing

- Generate Jest tests for utility functions
- Test React components with React Testing Library
- Validate Express API endpoints with integration tests
- Test middleware independently
- Mock database calls in service tests

---

## 📝 Naming Conventions

### Files & Folders
- Backend modules: `camelCase` (e.g., `brandVerification`, `buyRequirement`)
- Frontend components: `PascalCase` (e.g., `ProductCard.js`, `UserProfile.js`)
- Routes: `kebab-case` (e.g., `/brand-verification`, `/buy-requirement`)

### Functions
- Backend controllers: `camelCase` verbs (e.g., `list`, `getById`, `create`, `update`, `remove`)
- Frontend handlers: `handle` prefix (e.g., `handleSubmit`, `handleChange`)
- Boolean variables: `is/has/should` prefix (e.g., `isOpen`, `hasError`)

---

## 🌟 Conclusion

This guide is the **antigravity** of development - making complex architecture feel effortless.

**Follow these patterns religiously for consistent, maintainable, and scalable code.**

**Remember**: Structure is freedom. Consistency is productivity. Vibe coding is flow state. 🚀


### Core Philosophy
- **Separation of Concerns**: Controller → Service → Model
- **Validation First**: Always validate before processing
- **Consistent Responses**: Standardized response templates
- **Middleware-Driven**: Leverage middleware for cross-cutting concerns
- **Modular**: Self-contained, reusable modules

### Module Structure Pattern (ALWAYS FOLLOW)
Every backend module MUST have this exact structure:
```
backend/modules/{domain}/{moduleName}/
├── controller.js   # HTTP request/response handling
├── service.js      # Business logic & database operations
├── validator.js    # Joi validation schemas
└── routes.js       # Route definitions & middleware chain
```

### File Responsibilities

#### 1. **controller.js** - Request/Response Handler
```javascript
import * as moduleService from "./service.js";
import { sendResponse } from "../../../middleware/responseTemplate.js";

/**
 * List all items with pagination, search, and filters
 * @route GET /api/module/list
 * @query {number} page - Page number
 * @query {number} pageSize - Items per page
 */
export const list = async (req, res) => {
  try {
    let { search, filters, sort, page, pageSize } = req.validatedQuery || req.query;

    // filters and sort are already parsed by validator using jsonStringToObject
    // NO need to manually parse JSON strings in controller

    // Pagination
    page = parseInt(page) || 1;
    pageSize = Math.min(100, parseInt(pageSize) || 10);
    const skip = (page - 1) * pageSize;

    // Build query
    const query = {
      ...(search && {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { slug: { $regex: search, $options: "i" } },
        ],
      }),
      ...(filters?.status && { status: filters.status }),
    };

    // Build sort
    const sortObj = sort?.field 
      ? { [sort.field]: sort.order === "desc" ? -1 : 1 }
      : { createdAt: -1 };

    // Fetch data
    const { docs, totalCount } = await moduleService.list(query, skip, pageSize, sortObj);

    // Send response
    res.locals.response.data = {
      docs,
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    };
    return sendResponse(res);
  } catch (error) {
    console.error("Error in list:", error);
    res.locals.response.success = false;
    res.locals.response.message = error.message;
    res.locals.response.status = 500;
    return sendResponse(res);
  }
};

export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await moduleService.getById(id);

    if (!item) {
      res.locals.response.success = false;
      res.locals.response.message = "Item not found";
      res.locals.response.status = 404;
      return sendResponse(res);
    }

    res.locals.response.data = item;
    return sendResponse(res);
  } catch (error) {
    res.locals.response.success = false;
    res.locals.response.message = error.message;
    res.locals.response.status = 500;
    return sendResponse(res);
  }
};

export const create = async (req, res) => {
  try {
    const item = await moduleService.create(req.body, req.user);
    res.locals.response.data = item;
    res.locals.response.message = "Item created successfully";
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

**Controller Rules:**
- ✅ Always use `try-catch` blocks
- ✅ Use `res.locals.response` and `sendResponse(res)` ONLY
- ✅ Set appropriate HTTP status codes (200, 201, 400, 404, 500)
- ✅ Add JSDoc comments with description only (NO decorators)
- ❌ NO business logic in controllers (delegate to service)
- ❌ NO direct database queries (use service layer)
- ❌ NEVER use `res.json()` or `res.status().json()` directly
- ❌ NEVER use JSDoc decorators like @route, @param, @body, @query, @returns, @throws

#### 2. **service.js** - Business Logic Layer
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

export const getById = async (id) => {
  return await Model.findById(id)
    .populate("user", "name email phone")
    .lean();
};

export const create = async (data, user) => {
  const item = new Model({
    ...data,
    user: user._id,
    createdAt: new Date(),
  });
  return await item.save();
};

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

export const remove = async (id) => {
  return await Model.findByIdAndDelete(id);
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

#### 3. **validator.js** - Joi Validation Schemas
```javascript
import Joi from "joi";
import { objectIdValidator } from "../../../utils/customValidators.js";

export const listSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().allow("", null).optional(),
  filters: Joi.object({
    status: Joi.string().valid("pending", "approved", "rejected").optional(),
    category: objectIdValidator.optional(),
  }).default({}),
  sort: Joi.object({
    field: Joi.string().required(),
    order: Joi.string().valid("asc", "desc").required(),
  }).default({ field: "createdAt", order: "desc" }),
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

#### 4. **routes.js** - Route Definitions
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
- ✅ Middleware order: Auth → File Upload → Validation → Controller
- ✅ Use `validateRequest` for all data validation
- ✅ Use `requireLogin` for authenticated routes
- ✅ Use `requirePermission` for role-based access

### Middleware Chain Order (CRITICAL)
```javascript
router.post(
  "/create",
  requireLogin,                              // 1. Authentication
  requirePermission("brands", "create"),     // 2. Permissions
  validateRequest(validator.createSchema),   // 3. Validation
  controller.create                          // 4. Controller
);
```

### Response Pattern (ALWAYS USE)
```javascript
// Success
res.locals.response.data = result;
res.locals.response.message = "Success message";
res.locals.response.status = 200; // or 201, 404, etc.
return sendResponse(res);

// Error
res.locals.response.success = false;
res.locals.response.message = error.message;
res.locals.response.status = 500;
return sendResponse(res);
```

### Standard Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { "item": {...}, "totalCount": 100 },
  "status": 200
}
```

### HTTP Status Codes
| Code | Usage |
|------|-------|
| 200 | Successful GET, PUT, DELETE |
| 201 | Successful POST (created) |
| 400 | Validation error |
| 401 | Not authenticated |
| 403 | Not authorized |
| 404 | Resource not found |
| 500 | Server error |

### Available Middleware
| Middleware | Usage |
|------------|-------|
| `responseTemplate` | Applied globally in app.js |
| `requireLogin` | Check authentication |
| `requirePermission("resource", "action")` | Check role permissions |
| `validateRequest(schema, source)` | Validate with Joi |
| `upload.single("field")` | File upload |

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

### Creating New Backend Module (Step-by-Step)
1. Create folder: `backend/modules/{domain}/{moduleName}/`
2. Create files: `controller.js`, `service.js`, `validator.js`, `routes.js`
3. Implement service layer first (database operations)
4. Add Joi validation schemas in validator
5. Create controllers using `sendResponse(res)` pattern
6. Define routes with middleware chain
7. Register in domain-level `routes.js`
8. Test all endpoints

### Real Examples to Learn From
- ✅ `backend/modules/admin/brandVerification/` - Full CRUD with approval workflow
- ✅ `backend/modules/admin/buyRequirement/` - List, filter, pagination
- ✅ `backend/modules/admin/category/` - Category management
- ✅ `backend/modules/seller/brands/` - Seller-specific operations
- ✅ `backend/middleware/` - All middleware patterns
- ✅ `backend/utils/customValidators.js` - Validation helpers

### Common Patterns

**Pagination:**
```javascript
const page = parseInt(req.query.page) || 1;
const pageSize = Math.min(100, parseInt(req.query.pageSize) || 10);
const skip = (page - 1) * pageSize;
```

**Search:**
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

**Filter:**
```javascript
const query = {
  ...(filters?.status && { status: filters.status }),
  ...(filters?.category && { category: filters.category }),
};
```

**Sort:**
```javascript
const sortObj = sort?.field 
  ? { [sort.field]: sort.order === "desc" ? -1 : 1 }
  : { createdAt: -1 };
```

---

## 🎨 Frontend Architecture

### UI/UX Guidelines
- **Design**: Modern, minimalist, mobile-first
- **Responsive**: All devices (mobile-first approach)
- **Consistency**: Spacing, fonts, colors, hover/focus states
- **Polish**: Smooth transitions, subtle shadows, rounded corners
- **Clarity**: Avoid clutter, intuitive UX
- **Styling**: Prefer Tailwind utility classes, avoid custom CSS unless necessary

### Navigation & Layout
- **Mobile**: Bottom navigation menu with "More" for extra links
- **Desktop**: Top navigation (optional)
- **Components**: Reusable Header, Footer, BottomNav, Sidebar, Main
- **Layout**: Flexbox/Grid, avoid absolute positioning
- **Forms**: Labels, placeholders, validation feedback
- **Cards**: Rounded, shadowed, hover-responsive

### Mobile-Specific
- Tappable buttons and interactive elements
- Relative units (rem, %, flex) for spacing/sizing
- Scale properly on <480px screens
- Accessibility: keyboard navigation, ARIA labels, readable text

---

## 🤖 AI Assistant Behavior

### General Guidelines
- Suggest names based on existing project code patterns
- Always follow UI/UX and backend structure rules
- Auto-generate example usage for new components
- Generate responsive layouts automatically
- Generate API documentation (methods, routes, params, responses)
- Generate component documentation (props, usage examples)

### Backend Tasks
- ✅ Read [BACKEND.md](BACKEND.md) for complete backend patterns
- ✅ Always follow the 4-file module structure (controller, service, validator, routes)
- ✅ Use middleware chain: auth → validation → controller
- ✅ Use `res.locals.response` and `sendResponse(res)` ONLY
- ✅ All database operations in service layer
- ✅ Use `jsonStringToObject()` for filters and sort in validators (NO manual JSON.parse in controllers)
- ✅ Use `req.validatedQuery` in controllers to access parsed query params
- ✅ File uploads: Files are uploaded client-side to S3 via user/file module, backend receives ObjectId only
- ✅ Learn from `backend/modules/admin/` examples

### File Upload Quick Guide
- Files are uploaded **client-side** to S3 via `user/file` module
- Client receives file ObjectId after successful upload
- Backend receives ObjectId in request body (e.g., `req.body.proofFile`)
- Validate file IDs with `objectIdValidator` in Joi schemas
- Store file ObjectIds in database (NOT file paths)
- Use `.populate("fieldName")` to retrieve file details when displaying
- Frontend must populate file URLs from ObjectIds using `user/file` API
- Example: `backend/modules/seller/brands/`, `backend/modules/seller/registration/`, `backend/modules/admin/category/`
- NO backend file upload middleware (removed `uploadAndSaveFiles`)
- NO `getFileUrl()` or `deleteFiles()` calls in controllers

### Frontend Tasks
- ✅ Read [FRONTEND.md](FRONTEND.md) for complete UI/UX patterns
- ✅ Follow mobile-first responsive design
- ✅ Use Tailwind CSS utility classes
- ✅ Generate functional React components
- ✅ Include prop validation
- ✅ Implement proper loading/error states

---

## ✅ Best Practices

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

## 📋 Module Creation Checklist

- [ ] Create module folder structure
- [ ] Implement `service.js` (database operations)
- [ ] Implement `validator.js` (Joi schemas with `.unknown(false)`)
- [ ] Implement `controller.js` (using `sendResponse(res)`)
- [ ] Implement `routes.js` (with middleware chain)
- [ ] Add JSDoc comments with `@route` tags
- [ ] Use `try-catch` blocks in all controllers
- [ ] Apply appropriate middleware (auth, validation, permissions)
- [ ] Set correct HTTP status codes
- [ ] Test all endpoints
- [ ] Register routes in domain aggregator
- [ ] Document API endpoints

---

## 🧪 Testing

- Generate Jest tests for utility functions
- Test React components with React Testing Library
- Validate Express API endpoints with integration tests
- Test middleware independently
- Mock database calls in service tests

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

This guide is the **antigravity** of development - making complex architecture feel effortless.

**Follow these patterns religiously for consistent, maintainable, and scalable code.**

**Remember**: Structure is freedom. Consistency is productivity. Vibe coding is flow state. 🚀
