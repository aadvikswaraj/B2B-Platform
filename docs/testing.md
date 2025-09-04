# Testing Strategy

From `AI_RULES.md`.

## Layers
- Unit: pure utilities (parsers, formatters)
- Component: React components via React Testing Library
- Integration: Express routes with supertest

## Conventions
- Co-locate test files: `*.test.js`
- Avoid testing implementation details—assert behavior
- Use factories / builders for complex objects

## Example Utility Test
```js
import { formatDate } from '../utils/date';

test('formats date ISO -> short', () => {
  expect(formatDate('2025-08-01T10:00:00Z')).toBe('Aug 1, 2025');
});
```

## Example Component Test
```jsx
import { render, screen } from '@testing-library/react';
import Badge from '@/components/ui/Badge';

test('renders badge content', () => {
  render(<Badge variant="rose">Yes</Badge>);
  expect(screen.getByText('Yes')).toBeInTheDocument();
});
```

## Example API Test
```js
import request from 'supertest';
import app from '../../app';

test('GET /api/admin/roles returns roles list', async () => {
  const res = await request(app).get('/api/admin/roles');
  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
});
```

## Tooling
- Jest for unit + component
- Supertest for API
- Optionally MSW for mocking fetch in component tests
