# B2B Platform

**🚧 This is an ongoing project - NOT COMPLETED YET 🚧**

A comprehensive B2B e-commerce platform built with Next.js and Express.js, designed to connect buyers and sellers in a modern, scalable marketplace.

## Project Overview

This B2B platform enables businesses to:
- **Buyers**: Source products, manage RFQs, track orders, and connect with verified suppliers
- **Sellers**: List products, manage leads, process orders, and grow their business
- **Admins**: Manage users, verify sellers, oversee platform operations

## Tech Stack

### Frontend
- **Framework**: Next.js 15.4.6 (App Router)
- **UI**: React 19.1.1 + Tailwind CSS 3.3.3
- **State Management**: React Hook Form 7.62.0
- **Components**: Headless UI 2.2.6 + Heroicons 2.2.0
- **Charts**: Chart.js 4.5.0
- **Authentication**: NextAuth 4.24.11

### Backend
- **Runtime**: Node.js with Express.js 5.1.0
- **Database**: MongoDB with Mongoose 8.17.0
- **Authentication**: JWT + Express Sessions
- **File Handling**: Multer 2.0.2
- **Security**: bcrypt 6.0.0, CORS 2.8.5

## Project Structure

```
b2b_platform/
├── backend/                    # Express.js API server
│   ├── models/model.js        # Mongoose schemas (User, BusinessProfile, SellerKYC, etc.)
│   ├── routes/                # API endpoints
│   │   ├── auth.js           # Authentication (login, signup)
│   │   ├── admin/            # Admin management endpoints
│   │   ├── seller/           # Seller-specific routes
│   │   └── user/             # User profile & address management
│   ├── middleware/           # Custom middleware (auth, multer, response templates)
│   └── public/               # Static file uploads
├── frontend/                   # Next.js application
│   ├── app/                   # App Router pages
│   │   ├── admin/            # Admin dashboard & management
│   │   ├── seller/           # Seller dashboard & tools
│   │   ├── myaccount/        # User profile & settings
│   │   ├── checkout/         # Multi-step checkout process
│   │   └── ...               # Other pages (login, search, product, etc.)
│   ├── components/           # Reusable React components
│   │   ├── admin/            # Admin-specific components
│   │   ├── buyer/            # Buyer-specific components
│   │   ├── seller/           # Seller-specific components
│   │   ├── ui/               # Shared UI components
│   │   └── common/           # Common components
│   ├── utils/api/            # API utility functions
│   └── hooks/                # Custom React hooks
└── docs/                      # Project documentation
```

## Key Features Implemented

### 🔐 Authentication & User Management
- User registration and login with JWT sessions
- Role-based access control (Buyer, Seller, Admin)
- Profile management with address handling
- Phone verification system

### 🛍️ Buyer Features
- Product search and filtering
- RFQ (Request for Quotation) management
- Shopping cart with multi-supplier support
- Multi-step checkout process
- Order tracking and management
- Supplier messaging system

### 🏪 Seller Features
- **Multi-step Registration**: KYC verification with document uploads
- Product listing and management
- Buy leads exploration and quoting
- Order processing and fulfillment
- Store analytics and insights
- Business profile management

### 👑 Admin Features
- User management and role assignment
- **Seller Verification System**: Review and approve seller registrations
- Product and category management
- Order oversight and dispute resolution
- Platform analytics dashboard
- Role-based permission system

### 🎨 UI/UX Features
- **Mobile-first responsive design**
- Modern, minimalist interface with Tailwind CSS
- Bottom navigation for mobile users
- Consistent component library
- Loading skeletons and optimistic updates
- File upload with preview functionality

## Database Models

### Core Models
- **User**: Authentication, roles, basic profile
- **BusinessProfile**: Company details, verification status
- **SellerKYC**: KYC documents (PAN, GSTIN, signatures, bank details)
- **Address**: Multi-address support for users
- **AdminRole**: Granular permission management
- **File**: File upload handling with metadata

### Business Logic
- Step-based seller registration flow
- Document verification workflow
- Multi-supplier cart management
- Order lifecycle tracking

## Development Setup

### Prerequisites
- Node.js 18+ 
- MongoDB instance
- Environment variables configured

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd b2b_platform
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   npm run dev  # Runs on http://localhost:3001
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev  # Runs on http://localhost:3000
   ```

### Environment Variables

Create `.env` files in both backend and frontend directories:

**Backend `.env`:**
```env
MONGO_URI=mongodb://localhost:27017/b2b_platform
SESSION_SECRET=your_session_secret
SESSION_NAME=sid
SESSION_LIFETIME=86400000
JWT_SECRET=your_jwt_secret
```

**Frontend `.env.local`:**
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

## API Endpoints

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### Seller Management
- `GET /seller/registration/progress` - Get registration step and data
- `POST /seller/registration/save-step` - Save step data and advance
- File upload endpoints for KYC documents

### Admin Operations
- `GET /admin/seller-verification/list` - List pending seller verifications
- `GET /admin/seller-verification/:userId` - Get seller verification details
- `PATCH /admin/seller-verification/:userId/status` - Update verification status
- `POST /admin/seller-verification/:userId/approve` - Approve seller
- `POST /admin/seller-verification/:userId/reject` - Reject seller

### Product Verification
- `GET /admin/product-verification/list` - List products for moderation (search, filter by status)
- `GET /admin/product-verification/:productId` - Get product details for review
- `POST /admin/product-verification/:productId/approve` - Approve product (sets moderation.status=approved, isApproved=true)
- `POST /admin/product-verification/:productId/reject` - Reject product with reason

### User Management
- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update user profile
- Address CRUD operations

## Component Architecture

### Shared UI Components
- `PageHeader` - Consistent page headers with actions
- `ManagementPanel` - Reusable data tables with search/filters
- `FormSection` - Standardized form sections
- `Button`, `Input`, `Modal` - Core UI primitives
- `FileInput` - File upload with preview

### Layout Components
- `DashboardLayout` - Admin and seller dashboard wrapper
- `CheckoutLayout` - Multi-step checkout flow
- `Navbar` - Main navigation with mobile menu
- `BottomNav` - Mobile bottom navigation
- `AdminSidebar` - Admin panel navigation

### Business Components
- Registration forms with React Hook Form integration
- Product cards and listing components
- Order management interfaces
- Verification and approval workflows

## Current Status

### ✅ Completed Features
- Core authentication and user management
- Seller registration with KYC verification
- Admin seller verification workflow
- Basic product listing and search
- Multi-step checkout process
- Responsive UI with mobile-first design
- File upload and document management

### 🚧 In Development
- Payment gateway integration
- Real-time messaging system
- Advanced search and filtering
- Order fulfillment workflows
- Notification system
- API documentation generation

### 📋 Planned Features
- Multi-language support
- Advanced analytics dashboard
- Bulk operations and import/export
- Third-party integrations
- Mobile app development
- Performance optimizations

## Development Guidelines

### Code Standards
- **JavaScript ES6+** with modern async/await patterns
- **React functional components** with hooks
- **Tailwind CSS** for styling (avoid custom CSS)
- **Clean, modular, reusable code** with descriptive naming
- **Mobile-first responsive design**
- **2-space indentation** with semicolons (Prettier)

### UI/UX Principles
- Modern, minimalist design aesthetic
- Consistent spacing, colors, and typography
- Smooth transitions and hover states
- Intuitive user flows and navigation
- Accessibility considerations (ARIA labels, keyboard navigation)

### Testing Strategy
- Jest for utility functions
- React Testing Library for components
- Integration tests for API endpoints
- Manual testing for user workflows

## Contributing

This is an ongoing project. When contributing:

1. Follow the established code standards
2. Ensure mobile responsiveness
3. Add proper error handling
4. Update documentation for new features
5. Test thoroughly before submitting

## License

This project is currently in development and not yet released under any specific license.

---

**Note**: This project is actively under development. Features and documentation may change frequently. For the most current information, refer to the latest commits and project discussions.