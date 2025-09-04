# UI / UX Guidelines

Source: `AI_RULES.md`

## Design Principles
- Modern, minimalist, mobile-first
- Consistent spacing, typography, color and interaction states
- Soft shadows, rounded corners, subtle transitions
- Avoid clutter—each view has a clear primary action

## Responsive Strategy
- Mobile-first: design for <480px baseline
- Use flex/grid; avoid absolute positioning unless required
- Use relative units (`rem`, `%`, flex-basis) for scalable layout

## Components
- Buttons: clear hierarchy (primary, secondary, subtle)
- Forms: labels, placeholders, error + success feedback
- Cards: rounded, shadowed, hover-responsive
- Navigation: bottom nav on mobile, sidebar/topbar on desktop

## Accessibility
- Minimum touch target 40px
- Keyboard navigable (focus outlines preserved)
- Use semantic HTML (nav, main, header, footer, section)
- Provide `aria-label` or `aria-labelledby` where needed

## Animation & Feedback
- Use Tailwind `transition` utilities for hover/focus/active states
- Avoid long or distracting animations (<200ms preferred)

## Example Card Structure
```jsx
<div className="p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition">
  <h3 className="text-sm font-semibold text-gray-900">Role Name</h3>
  <p className="text-xs text-gray-500 mt-1">Description or metadata</p>
  <button className="mt-3 text-xs text-blue-600 hover:underline">Manage</button>
</div>
```
