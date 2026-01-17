# Seller Products CRUD Implementation 🚀

## Overview
Complete CRUD operations for seller products module with list, create, update (with reverification), and soft delete functionality.

---

## Features Implemented

### 1. **List Products** ✅
- Pagination support (page, pageSize)
- Search by title/description
- Filter by status, categoryId, isApproved
- Sort by any field (asc/desc)
- Excludes deleted products

### 2. **Get Product by ID** ✅
- Fetch single product for authenticated seller
- Populates category and brand details
- Excludes deleted products

### 3. **Create Product** ✅
- Validates category exists
- Validates brand if not generic
- Calculates price (single or slab-based)
- Builds specifications from catSpecs and custom specs
- Creates product with "draft" status and "pending" moderation

### 4. **Update Product** ✅
- Updates product fields
- **Reverification Logic**: If product was previously approved, automatically:
  - Sets `moderation.status` to "pending"
  - Sets `isApproved` to false
  - Requires re-approval from admin
- Validates category/brand if changed
- Recalculates price if price data provided

### 5. **Delete Product** ✅
- **Soft Delete**: Sets `status` to "deleted"
- Sets `isApproved` to false
- Product remains in database but excluded from queries

---

## API Endpoints

### List Products
```
GET /api/seller/products/list
```

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `pageSize` (number, default: 10, max: 100) - Items per page
- `search` (string, optional) - Search in title/description
- `filters` (JSON string, optional) - Filter options:
  - `status` (string): "draft" | "active" | "inactive" | "rejected"
  - `categoryId` (ObjectId): Filter by category
  - `isApproved` (boolean): Filter by approval status
- `sort` (JSON string, optional) - Sort options:
  - `field` (string): Field to sort by
  - `order` (string): "asc" | "desc"

**Response:**
```json
{
  "success": true,
  "message": "Products fetched successfully",
  "status": 200,
  "data": {
    "docs": [...],
    "totalCount": 100,
    "page": 1,
    "pageSize": 10,
    "totalPages": 10
  }
}
```

---

### Get Product by ID
```
GET /api/seller/products/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Product fetched successfully",
  "status": 200,
  "data": {
    "_id": "...",
    "title": "Product Name",
    "category": { "_id": "...", "name": "Category" },
    "brand": { "_id": "...", "name": "Brand" },
    "price": 999,
    "status": "active",
    "isApproved": true,
    "moderation": { "status": "approved" }
  }
}
```

---

### Create Product
```
POST /api/seller/products
```

**Body:**
```json
{
  "categoryId": "ObjectId",
  "productName": "Product Name",
  "detailedDesc": "Detailed description",
  "shortDesc": "Short description",
  "isGeneric": false,
  "brandId": "ObjectId",
  "priceType": "single",
  "singlePrice": 999,
  "moq": 1,
  "catSpecs": { "specName": "specValue" },
  "specs": [
    { "name": "Spec Name", "value": "Value", "unit": "Unit" }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product draft created successfully",
  "status": 201,
  "data": { "id": "..." }
}
```

---

### Update Product
```
PUT /api/seller/products/:id
```

**Body:** (All fields optional)
```json
{
  "categoryId": "ObjectId",
  "productName": "Updated Name",
  "detailedDesc": "Updated description",
  "status": "active",
  "priceType": "single",
  "singlePrice": 1099
}
```

**Response (If previously approved):**
```json
{
  "success": true,
  "message": "Product updated and sent for reverification",
  "status": 200,
  "data": { "id": "..." }
}
```

**Response (If not approved):**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "status": 200,
  "data": { "id": "..." }
}
```

---

### Delete Product
```
DELETE /api/seller/products/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully",
  "status": 200
}
```

---

## Reverification Logic

### When Does Reverification Trigger?

When updating a product, the system checks if it was previously approved:
```javascript
const wasApproved = product.moderation?.status === "approved" || product.isApproved;
```

### What Happens on Reverification?

If product was approved and is updated:
1. `moderation.status` → "pending"
2. `isApproved` → false
3. `moderation.updatedAt` → current date
4. Admin must re-approve the product

### Why Reverification?

Ensures product quality and prevents approved products from being modified without admin review.

---

## Soft Delete Implementation

### How It Works

Instead of removing product from database:
```javascript
{
  status: "deleted",
  isApproved: false
}
```

### Query Exclusion

All list/get queries automatically exclude deleted products:
```javascript
const query = {
  ...match,
  seller: sellerId,
  status: { $ne: "deleted" }, // Exclude deleted
};
```

### Benefits

- Data preservation for audit trails
- Can be restored if needed
- Order history remains intact
- Analytics and reporting unaffected

---

## File Structure

```
backend/modules/seller/products/
├── controller.js       # Request handlers (list, getById, create, update, remove)
├── service.js          # Business logic (DB operations, reverification)
├── validator.js        # Joi schemas (listSchema, createSchema, updateSchema)
└── routes.js           # Route definitions (GET, POST, PUT, DELETE)
```

---

## Validation Schemas

### List Schema
- `page`, `pageSize` - Pagination
- `search` - Optional search string
- `filters` - JSON object with status, categoryId, isApproved
- `sort` - JSON object with field and order

### Create Schema
- `categoryId` - Required ObjectId
- `productName` - Required string (2-200 chars)
- `isGeneric` - Boolean, default false
- `brandId` - Required if not generic
- `priceType` - "single" or "slab"
- `singlePrice` or `priceSlabs` - Based on priceType
- `moq` - Minimum order quantity
- `catSpecs`, `specs` - Specifications

### Update Schema
- All fields from createSchema but optional
- `status` - Can be "draft", "active", "inactive"
- At least 1 field required

---

## Testing

### Test List Endpoint
```bash
GET http://localhost:5001/api/seller/products/list?page=1&pageSize=10&search=laptop
```

### Test Create
```bash
POST http://localhost:5001/api/seller/products
Content-Type: application/json

{
  "categoryId": "...",
  "productName": "Test Product",
  "isGeneric": false,
  "brandId": "...",
  "priceType": "single",
  "singlePrice": 999,
  "moq": 1
}
```

### Test Update (Triggers Reverification)
```bash
PUT http://localhost:5001/api/seller/products/:id
Content-Type: application/json

{
  "productName": "Updated Product Name",
  "singlePrice": 1099
}
```

### Test Delete (Soft Delete)
```bash
DELETE http://localhost:5001/api/seller/products/:id
```

---

## Database Changes

### Product Model Update
Added "deleted" to status enum:
```javascript
status: {
  type: String,
  required: true,
  enum: ["draft", "active", "inactive", "rejected", "deleted"],
  default: "draft",
}
```

---

## Security

- ✅ All routes require authentication (`requireLogin` middleware)
- ✅ Sellers can only access their own products
- ✅ Brand verification checked (must be approved)
- ✅ Category validation
- ✅ Input validation with Joi schemas
- ✅ Soft delete prevents data loss

---

## Best Practices Followed

- ✅ Separation of concerns (routes → controller → service)
- ✅ Standardized response format (`res.locals.response`)
- ✅ Comprehensive error handling
- ✅ JSDoc comments for all functions
- ✅ Validation with `.unknown(false)` to reject unknown fields
- ✅ Use of `Promise.all` for parallel operations
- ✅ `.lean()` for read-only queries (performance)
- ✅ Proper HTTP status codes

---

## Summary

✅ Complete CRUD operations implemented
✅ Reverification logic on update
✅ Soft delete with flag
✅ Pagination, search, and filters
✅ Comprehensive validation
✅ Production-ready code

**Total Lines Added**: ~350 lines across 4 files
**Endpoints**: 5 (list, getById, create, update, remove)
**Architecture**: Follows B2B Platform patterns

🚀 Ready for production use!
