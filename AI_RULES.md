# AI Rules for This Project

## General Coding
- Language: JavaScript (ES6+)
- Frameworks: React (functional components), Next.js, Express.js
- Styling: Tailwind CSS
- Code must be clean, modular, reusable
- Use descriptive variable, function, and component names
- Add inline comments for functions, complex code, and API endpoints
- Follow Prettier formatting (2-space, semicolons)
- Always use async/await for async code

## UI/UX Guidelines
- Design must be **modern, minimalist, and mobile-first**
- Responsive layouts for all devices (mobile-first)
- Consistent spacing, font sizes, colors, and hover/focus states
- Smooth transitions, subtle shadows, rounded corners
- Avoid clutter; keep UX intuitive
- Prefer Tailwind utility classes, avoid custom CSS unless necessary

## Navigation & Layout
- Use a **bottom navigation menu** on mobile with “More” options for extra links
- Top navigation can exist on desktop only
- Header, Footer, BottomNav, Sidebar, and Main content must be **reusable components**
- Layouts should use **Flexbox/Grid**, avoid absolute positioning unless necessary
- Forms should have labels, placeholders, and validation feedback
- Cards and sections should be rounded, shadowed, and hover-responsive

## Mobile-Specific
- Buttons and interactive elements must be tappable on small screens
- Use relative units (rem, %, flex) for spacing, width, height
- All layouts must scale properly on <480px width screens
- Ensure accessibility: keyboard navigation, ARIA labels, readable text

## AI Behavior
- Suggest object keys, function names, and component names based on existing project code
- Always follow **UI/UX and navigation rules** when generating code
- Auto-generate **example usage** for new components and utilities
- Generate responsive layouts automatically for new UI sections
- Generate **API documentation** for Express endpoints (methods, routes, params, responses)
- Generate **Next.js page/component documentation** (props, usage examples)

## Testing
- Generate Jest tests for utility functions
- Test React components with React Testing Library
- Validate Express API endpoints with integration tests