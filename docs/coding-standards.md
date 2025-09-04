# Coding Standards

These standards are derived from `AI_RULES.md`.

## Languages & Frameworks
- JavaScript (ES6+)
- Next.js (App Router) & React functional components
- Express.js for backend APIs
- Tailwind CSS for styling

## Style & Structure
- Clean, modular, reusable code
- Descriptive names for variables, functions, components
- Use async/await for all asynchronous logic
- Inline comments for: non-trivial logic, API endpoints, data transformations
- Follow Prettier (2-space indent, semicolons)

## File Organization
- Group related components logically
- Shared UI in `components/ui`
- Shared admin/business logic in appropriate domain folders
- Avoid deeply nested prop drilling—prefer composition

## Patterns
- Prefer pure functions for utilities
- Avoid side effects in React components (except inside hooks)
- Derive UI state where possible instead of duplicating data

## Error Handling
- Always try/catch async handlers in Express
- Return consistent JSON shapes: `{ success, message, data }`
- Surface validation feedback in forms

## Environment & Config
- Keep secrets out of source
- Use environment variables for API URLs / credentials

## Example
```js
// Good: clear naming and async/await
export async function fetchRoles({ search }) {
  const res = await fetch(`/api/admin/roles?search=${encodeURIComponent(search)}`);
  if (!res.ok) throw new Error('Failed to fetch roles');
  return res.json();
}
```
