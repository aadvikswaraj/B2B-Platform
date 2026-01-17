# Brand Verification (Admin & Seller Flow)

## Overview
Sellers can create brands and upload a single proof document (e.g. trademark certificate). Each brand has a KYC verification status managed by admins.

Status lifecycle:
1. pending – default when brand is created or re-submitted
2. verified – approved by an admin (stores verifier and timestamp)
3. rejected – rejected by an admin with optional reason; seller may re-submit

## Data Model (excerpt)
Brand.kyc:
```js
kyc: {
  file: ObjectId(File),
  status: 'pending'|'verified'|'rejected',
  rejectedReason: String,
  verifiedBy: ObjectId(User),
  verifiedAt: Date
}
```

## Seller Endpoints (already implemented)
`POST /seller/brands/new` – create brand with optional proof file (multipart: proofFile)
`GET /seller/brands` – list brands (filters: status, search, pagination)
`GET /seller/brands/:brandId` – brand detail
`PATCH /seller/brands/:brandId/resubmit` – replace proof file & reset to pending if rejected

## Admin Endpoints
All endpoints require admin auth (middleware on `/admin`).

### List Brands
`GET /admin/brand-verification/list?status=&search=&page=1&pageSize=10`
Query Params:
- status: pending | verified | rejected (optional)
- search: case-insensitive substring match on brand name
- page / pageSize: pagination (pageSize max 100)

Response:
```json
{
  "success": true,
  "data": {
    "items": [
      {"_id":"...","name":"Acme","kycStatus":"pending","seller":{"_id":"...","name":"Seller Name","email":"user@example.com","phone":"..."},"createdAt":"2025-11-10T..."}
    ],
    "totalCount": 42,
    "page": 1,
    "pageSize": 10
  }
}
```

### Brand Detail
`GET /admin/brand-verification/:brandId`
Response:
```json
{
  "success": true,
  "data": {
    "brand": {
      "_id": "...",
      "name": "Acme",
      "kyc": {
        "status": "pending",
        "rejectedReason": null,
        "file": {"_id":"...","originalName":"proof.pdf","mimeType":"application/pdf","size":12345,"url":"/uploads/..."},
        "verifiedBy": null,
        "verifiedAt": null
      },
      "seller": {"_id":"...","name":"Seller Name","email":"user@example.com","phone":"..."},
      "createdAt": "2025-11-10T..."
    }
  }
}
```

### Approve Brand
`POST /admin/brand-verification/:brandId/approve`
Sets status to verified (idempotent if already verified).

Response:
```json
{
  "success": true,
  "message": "Brand verified",
  "data": {"_id":"...","kycStatus":"verified"}
}
```

### Reject Brand
`POST /admin/brand-verification/:brandId/reject`
Body:
```json
{"reason":"Proof document unclear"}
```
Response:
```json
{
  "success": true,
  "message": "Brand rejected",
  "data": {"_id":"...","kycStatus":"rejected","rejectedReason":"Proof document unclear"}
}
```

## Frontend Admin UI
Pages:
`/admin/brand-verification` – list with filters & pagination.
`/admin/brand-verification/[brandId]` – detail view with approve / reject modal.

Components reused: `PageHeader`, `Button`, `Modal`.
Status badges share color logic with seller verification.

## Edge Cases & Notes
- Approving an already verified brand returns a benign message, no duplicate writes.
- Reject clears previous verification metadata.
- Seller can re-submit by replacing file, resetting status to pending.
- File URLs are made absolute on client using `NEXT_PUBLIC_API_BASE_URL`.

## Future Enhancements
- Add sorting options (createdAt, name).
- Bulk approve/reject actions.
- Add audit trail (history array) for status changes.
- Email notifications on approve/reject.
- Include brand usage stats (products count) in detail view.
