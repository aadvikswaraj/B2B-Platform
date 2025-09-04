# API Guidelines & Documentation Structure

From `AI_RULES.md`.

## Principles
- Consistent JSON envelope: `{ success, message, data }`
- Use RESTful naming: `/api/admin/roles`, `/api/auth/login`
- Use plural nouns for collections
- Validation errors return 400 with descriptive `message`

## Handlers
- Always `try/catch` async logic
- Validate input early; bail out fast
- Sanitize query parameters and use projection where applicable

## Example Express Route (Documented)
```js
/**
 * GET /api/admin/roles
 * Query: search, page, pageSize, sort(field, order)
 * Response: { success, message, data: { items, totalCount } }
 */
router.get('/roles', async (req, res) => {
  try {
    const { search = '', page = 1, pageSize = 10 } = req.query;
    const query = search ? { roleName: { $regex: search, $options: 'i' } } : {};
    const skip = (page - 1) * pageSize;
    const [items, totalCount] = await Promise.all([
      AdminRole.find(query).skip(skip).limit(pageSize).lean(),
      AdminRole.countDocuments(query)
    ]);
    res.json({ success: true, message: 'Roles fetched', data: { items, totalCount } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
```

## Response Shape Examples
```json
{ "success": true, "message": "Login successful", "data": { "user": { "email": "a@b.com" } } }
{ "success": false, "message": "Invalid credentials" }
```

## Pagination
- Use zero or one-based consistently (one-based here)
- Return `totalCount` to enable UI page calculation

## Versioning
- Add `/v1` prefix when first breaking change arises

## Security
- Sanitize user input (whitelist fields)
- Rate limit auth-sensitive endpoints (future enhancement)
- Never leak stack traces in production responses
