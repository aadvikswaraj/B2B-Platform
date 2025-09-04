# Component & Layout Conventions

Derived from `AI_RULES.md`.

## Layout Components
- `Navbar`, `BottomNav`, `Sidebar`, `Footer`, `Main` should be reusable
- Compose layouts with flex/grid wrappers; avoid duplicating structure
- Keep layout state (open panels, collapsed sidebars) local where possible

## Naming
- UI primitives: `Button`, `Card`, `Modal`, `Input`
- Domain components grouped by feature (e.g., `components/admin/roles/RoleForm.js`)
- Hooks: `useThing` naming, return tuple or object

## Props Guidelines
- Keep prop surface minimal; pass objects for related config sets (e.g. `actions`, `filters`)
- Provide sensible defaults
- Document each prop in a JSDoc block for shared components

## Example JSDoc
```jsx
/**
 * ManagementPanel - generic data management surface
 * @param {Array} items - Data array
 * @param {Array} columns - Column defs: [{ key, header, sortable, render? }]
 * @param {boolean} loading - Show skeletons when true
 */
export default function ManagementPanel({ items, columns, loading }) { /* ... */ }
```

## Rendering Patterns
- Conditional rendering with short-circuits (`loading && <Spinner />`)
- Derive simple display values inside small helper functions
- Avoid nested ternaries in JSX—prefer early returns or helpers

## State Management
- Local state for UI only
- Server / persistent state via fetch or external store if added later

## Example Hook
```js
export function useDebouncedValue(value, delay=300){
  const [v, setV] = useState(value);
  useEffect(()=>{ const id = setTimeout(()=>setV(value), delay); return ()=>clearTimeout(id); }, [value, delay]);
  return v;
}
```
