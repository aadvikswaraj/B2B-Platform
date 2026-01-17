# Frontend Coding Guide 🎨
**Frontend architecture and UI/UX patterns for B2B Platform**

---

## 🎯 Tech Stack

- **Framework**: React (functional components), Next.js
- **Styling**: Tailwind CSS (utility-first)
- **State Management**: Redux (with Redux Toolkit)
- **Validation**: Native HTML5 + custom validation

---

## 🎨 UI/UX Guidelines

### Design Principles
- **Modern & Minimalist**: Clean, uncluttered interfaces
- **Mobile-First**: Design for mobile, enhance for desktop
- **Consistency**: Uniform spacing, fonts, colors, hover/focus states
- **Polish**: Smooth transitions, subtle shadows, rounded corners
- **Clarity**: Intuitive UX, avoid complexity
- **Accessibility**: Keyboard navigation, ARIA labels, readable text

### Visual Standards
- **Spacing**: Use consistent rem units (0.25rem, 0.5rem, 1rem, 2rem)
- **Typography**: Clear hierarchy with appropriate font sizes
- **Colors**: Consistent color palette from Tailwind config
- **Shadows**: Subtle shadows for depth (shadow-sm, shadow-md)
- **Borders**: Rounded corners (rounded, rounded-lg, rounded-xl)
- **Transitions**: Smooth animations (transition-all duration-200)

---

## 📱 Responsive Design (Mobile-First)

### Breakpoints
```javascript
// Tailwind breakpoints (default)
sm: '640px'   // Small devices
md: '768px'   // Medium devices
lg: '1024px'  // Large devices
xl: '1280px'  // Extra large devices
2xl: '1536px' // 2X large devices
```

### Mobile Design Rules
- ✅ Design for 320px minimum width
- ✅ Tappable elements minimum 44x44px
- ✅ Use relative units (rem, %, flex)
- ✅ Stack vertically on mobile, horizontal on desktop
- ✅ Hide/show elements based on screen size
- ✅ Bottom navigation on mobile
- ✅ Touch-friendly interactions

### Responsive Patterns
```jsx
// Stack on mobile, grid on desktop
<div className="flex flex-col md:grid md:grid-cols-3 gap-4">
  <Card />
  <Card />
  <Card />
</div>

// Hide on mobile, show on desktop
<div className="hidden md:block">
  <DesktopMenu />
</div>

// Show on mobile, hide on desktop
<div className="block md:hidden">
  <MobileMenu />
</div>

// Responsive text sizes
<h1 className="text-2xl md:text-4xl lg:text-5xl">
  Heading
</h1>

// Responsive padding
<div className="p-4 md:p-6 lg:p-8">
  Content
</div>
```

---

## 🧭 Navigation & Layout

### Mobile Navigation
- **Bottom Navigation**: Primary navigation at bottom for easy thumb access
- **More Menu**: Overflow items in "More" section
- **Sticky Position**: Navigation stays visible while scrolling

```jsx
// BottomNav Component Example
export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
      <div className="flex justify-around items-center h-16">
        <NavItem icon={HomeIcon} label="Home" href="/" />
        <NavItem icon={ShoppingBagIcon} label="Products" href="/products" />
        <NavItem icon={ShoppingCartIcon} label="Cart" href="/cart" />
        <NavItem icon={UserIcon} label="Account" href="/account" />
        <NavItem icon={MenuIcon} label="More" href="/more" />
      </div>
    </nav>
  );
}
```

### Desktop Navigation
- **Top Navigation**: Horizontal menu at top
- **Sidebar**: Optional left/right sidebar for secondary navigation
- **Breadcrumbs**: Show navigation path

### Layout Structure
```jsx
// Standard Layout Pattern
export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - Desktop only */}
      <Header className="hidden md:block" />
      
      {/* Main Content */}
      <main className="flex-1 pb-16 md:pb-0">
        {children}
      </main>
      
      {/* Bottom Nav - Mobile only */}
      <BottomNav className="md:hidden" />
      
      {/* Footer - Desktop only */}
      <Footer className="hidden md:block" />
    </div>
  );
}
```

---

## 🧩 Component Patterns

### Functional Components
```jsx
// Always use functional components with hooks
import { useState, useEffect } from 'react';

export default function ProductCard({ product, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);
  
  const handleAddToCart = () => {
    onAddToCart(product, quantity);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <img 
        src={product.image} 
        alt={product.name}
        className="w-full h-48 object-cover rounded-md mb-4"
      />
      <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
      <p className="text-gray-600 mb-4">{product.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-xl font-bold">₹{product.price}</span>
        <button 
          onClick={handleAddToCart}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
```

### Prop Types & Validation
```jsx
// Use PropTypes for type checking
import PropTypes from 'prop-types';

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    image: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
  onAddToCart: PropTypes.func.isRequired,
};

ProductCard.defaultProps = {
  product: {
    image: '/placeholder.png',
    description: '',
  },
};
```

---

## 📋 Forms & Validation

### Form Structure
```jsx
export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      // Submit form data
      await submitForm(formData);
      // Reset form
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter your name"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="your@email.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      {/* Message Field */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          Message *
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={4}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.message ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Your message..."
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-600">{errors.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>

      {errors.submit && (
        <p className="text-sm text-red-600">{errors.submit}</p>
      )}
    </form>
  );
}
```

---

## 🎭 Common UI Components

### Button Variants
```jsx
// Primary Button
<button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
  Primary Action
</button>

// Secondary Button
<button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors">
  Secondary Action
</button>

// Outline Button
<button className="border-2 border-blue-600 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors">
  Outline Action
</button>

// Danger Button
<button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors">
  Delete
</button>

// Disabled Button
<button disabled className="bg-gray-300 text-gray-500 px-4 py-2 rounded-md cursor-not-allowed">
  Disabled
</button>
```

### Card Component
```jsx
export default function Card({ title, children, className = '' }) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow ${className}`}>
      {title && (
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
      )}
      {children}
    </div>
  );
}
```

### Loading States
```jsx
// Spinner
export function Spinner({ size = 'md' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };
  
  return (
    <div className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`} />
  );
}

// Skeleton Loader
export function Skeleton({ className = '' }) {
  return (
    <div className={`bg-gray-200 animate-pulse rounded ${className}`} />
  );
}
```

### Modal/Dialog
```jsx
export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
```

---

## 🎨 Tailwind CSS Best Practices

### Utility-First Approach
```jsx
// ✅ Good - Use Tailwind utilities
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-semibold">Title</h2>
  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
    Action
  </button>
</div>

// ❌ Avoid - Custom CSS when Tailwind utilities exist
<div className="custom-card">
  <h2 className="custom-title">Title</h2>
  <button className="custom-button">Action</button>
</div>
```

### Component Classes (when needed)
```javascript
// tailwind.config.js - Add custom components
module.exports = {
  theme: {
    extend: {
      // Custom colors, spacing, etc.
    },
  },
  plugins: [
    function({ addComponents }) {
      addComponents({
        '.btn-primary': {
          '@apply bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors': {},
        },
        '.card': {
          '@apply bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow': {},
        },
      });
    },
  ],
};
```

---

## 📊 State Management

### Local State (useState)
```jsx
// Use for component-specific state
const [isOpen, setIsOpen] = useState(false);
const [formData, setFormData] = useState({});
```

### Global State (Redux)
```javascript
// store/slices/cartSlice.js
import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    totalAmount: 0,
  },
  reducers: {
    addItem: (state, action) => {
      state.items.push(action.payload);
      state.totalAmount += action.payload.price;
    },
    removeItem: (state, action) => {
      const index = state.items.findIndex(item => item.id === action.payload);
      if (index !== -1) {
        state.totalAmount -= state.items[index].price;
        state.items.splice(index, 1);
      }
    },
  },
});

export const { addItem, removeItem } = cartSlice.actions;
export default cartSlice.reducer;
```

```jsx
// Using Redux in components
import { useSelector, useDispatch } from 'react-redux';
import { addItem } from '../store/slices/cartSlice';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cart.items);
  
  const handleAddToCart = () => {
    dispatch(addItem(product));
  };
  
  return (
    <button onClick={handleAddToCart}>
      Add to Cart ({cartItems.length})
    </button>
  );
}
```

---

## 🧪 Testing

### Component Testing
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from '../ProductCard';

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    price: 99.99,
  };
  
  it('renders product information', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('₹99.99')).toBeInTheDocument();
  });
  
  it('calls onAddToCart when button is clicked', () => {
    const handleAddToCart = jest.fn();
    render(<ProductCard product={mockProduct} onAddToCart={handleAddToCart} />);
    
    fireEvent.click(screen.getByText('Add to Cart'));
    expect(handleAddToCart).toHaveBeenCalledWith(mockProduct, 1);
  });
});
```

---

## ✅ Best Practices

### DO ✅
- Use functional components with hooks
- Follow mobile-first responsive design
- Use Tailwind utility classes
- Implement proper loading and error states
- Add accessibility attributes (ARIA labels)
- Validate forms on client side
- Optimize images (lazy loading, proper sizes)
- Use semantic HTML elements
- Keep components small and focused
- Extract reusable components

### DON'T ❌
- Use class components (unless necessary)
- Write custom CSS when Tailwind utilities exist
- Forget mobile responsiveness
- Skip loading/error states
- Ignore accessibility
- Put business logic in components
- Create deeply nested components
- Use inline styles excessively
- Forget to handle edge cases
- Skip prop validation

---

## 📝 Naming Conventions

### Files & Components
- Components: `PascalCase` (e.g., `ProductCard.js`, `UserProfile.js`)
- Hooks: `camelCase` with `use` prefix (e.g., `useAuth.js`, `useCart.js`)
- Utilities: `camelCase` (e.g., `formatPrice.js`, `validation.js`)
- Pages: `kebab-case` or `PascalCase` depending on Next.js routing

### Variables & Functions
- Variables: `camelCase` (e.g., `userData`, `isLoading`)
- Functions: `camelCase` verbs (e.g., `handleClick`, `fetchData`)
- Event handlers: `handle` prefix (e.g., `handleSubmit`, `handleChange`)
- Boolean variables: `is/has/should` prefix (e.g., `isOpen`, `hasError`)

---

## 🌟 Conclusion

This guide establishes the **antigravity** of frontend development - making beautiful, responsive UIs effortless.

**Follow these patterns for consistent, accessible, and delightful user experiences.**

**Remember**: Design is not just what it looks like. Design is how it works. 🎨
