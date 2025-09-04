# AI Assistant Behavior

Summarized from `AI_RULES.md`.

## Generation Responsibilities
- Propose names aligned with existing code patterns
- Respect UI/UX + navigation standards automatically
- Provide example usage for new components/hooks
- Produce responsive layout variants (mobile & desktop)
- Autogenerate route + component docs (props / params / responses)

## Output Standards
- Use Tailwind utilities
- Avoid extraneous custom CSS
- Keep code minimal + composable
- Include inline comments where complexity appears

## When Adding Components
1. Create file with clear name
2. Export a functional component
3. Add a usage example (comment or MD snippet)
4. Ensure responsive behavior with flex/grid

## When Adding API Endpoints
- Add JSDoc style header block
- Define params, query, response shape
- Include permission / auth notes if applicable

## Example Endpoint Doc Block
```js
/**
 * POST /api/auth/login
 * Body: { email, password }
 * Response: { success, message, data?: { user } }
 */
```

## Testing Hooks / Utilities
- Provide minimal Jest examples
- Encourage edge case handling (empty, null, failure states)

## Edge Cases to Consider
- Empty lists
- Slow network / loading states (skeletons, spinners)
- Permission denied flows
- Mobile viewport constraints
