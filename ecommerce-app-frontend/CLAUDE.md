# E-Commerce Frontend Application

## Project Overview
Angular 18 single-page application (SPA) for an e-commerce platform with PrimeNG UI components, JWT authentication, and integration with .NET Core microservices backend.

## Technology Stack

### Core Framework
- **Angular 18** - Latest Angular version with standalone component support
- **TypeScript** - Type-safe development
- **RxJS** - Reactive programming for state management
- **Angular Signals** - Reactive primitives for fine-grained reactivity

### UI Framework
- **PrimeNG v20** - Rich UI component library with Aura theme preset
- **PrimeIcons** - Icon library
- **SCSS** - Enhanced CSS with variables and nesting

### Architecture & Patterns
- **Lazy Loading** - Route-based code splitting for optimal performance
- **HTTP Interceptors** - Centralized request/response handling
- **Route Guards** - Authentication and authorization protection
- **Service Layer** - Centralized business logic and API integration
- **BehaviorSubject + Signals** - Hybrid reactive state management

## Project Structure

```
src/app/
├── core/                          # Core application modules
│   ├── guards/                    # Route guards
│   │   └── auth.guard.ts         # Authentication guard
│   ├── interceptors/              # HTTP interceptors
│   │   ├── auth.interceptor.ts   # JWT token attachment
│   │   └── error.interceptor.ts  # Global error handling
│   ├── models/                    # TypeScript interfaces
│   │   ├── auth.model.ts         # Authentication DTOs
│   │   ├── product.model.ts      # Product DTOs
│   │   ├── cart.model.ts         # Cart DTOs
│   │   └── order.model.ts        # Order DTOs
│   └── services/                  # Core services
│       ├── auth.service.ts       # Authentication & user management
│       ├── product.service.ts    # Product CRUD operations
│       ├── cart.service.ts       # Shopping cart management
│       └── order.service.ts      # Order management
├── features/                      # Feature modules
│   ├── auth/                     # Authentication feature
│   │   ├── login/                # Login component
│   │   └── register/             # Registration component
│   ├── products/                 # Product management
│   │   ├── product-list/         # Product catalog (TODO)
│   │   └── product-detail/       # Product details (TODO)
│   ├── cart/                     # Shopping cart
│   │   ├── cart-view/            # Cart display (TODO)
│   │   └── checkout/             # Checkout flow (TODO)
│   ├── orders/                   # Order management
│   │   ├── order-list/           # Order history (TODO)
│   │   └── order-detail/         # Order details (TODO)
│   └── admin/                    # Admin features
│       └── product-management/   # Admin product CRUD (TODO)
├── shared/                       # Shared components
│   └── components/
│       └── header/               # Navigation header
├── app.config.ts                 # Application configuration
├── app.routes.ts                 # Route definitions
└── app.ts                        # Root component
```

## Environment Configuration

### Development (environment.ts)
```typescript
{
  apiUrl: 'http://localhost:5000',
  authApi: 'http://localhost:5000/auth/api',
  productApi: 'http://localhost:5000/products/api',
  orderApi: 'http://localhost:5000/orders/api'
}
```

### Production (environment.prod.ts)
- Configure production API URLs before deployment

## Completed Features ✅

### 1. Authentication System
- [x] Login component with form validation
- [x] Registration component with password confirmation
- [x] JWT token management (localStorage)
- [x] Auth service with RxJS observables
- [x] Auth interceptor for automatic token attachment
- [x] Error interceptor with auto-logout on 401
- [x] Auth guard for protected routes

### 2. Core Services
- [x] AuthService - login, register, logout, token management
- [x] ProductService - CRUD, pagination, filtering, search
- [x] CartService - add/remove items, sync with backend, localStorage
- [x] OrderService - create orders, view order history

### 3. Navigation & Layout
- [x] Header component with navigation
- [x] Cart badge with item count (reactive)
- [x] User menu (My Orders, Logout)
- [x] Guest buttons (Login, Register)
- [x] Responsive design

### 4. Routing
- [x] Lazy-loaded routes for all features
- [x] Protected routes with authGuard
- [x] Route configuration complete

### 5. TypeScript Models
- [x] Auth models (LoginRequest, RegisterRequest, AuthResponse, User)
- [x] Product models (Product, ProductQueryParams, PaginatedResponse)
- [x] Cart models (Cart, CartItem, CartResponseDto)
- [x] Order models (Order, OrderItem, CreateOrderDto)

## In Progress / TODO 🚧

### Priority 1: Product Catalog
- [ ] **Product List Component** - Display products with pagination
  - Implement DataView or DataTable from PrimeNG
  - Add search functionality
  - Add price filters (min/max)
  - Add sorting (price, name, date)
  - Add "In Stock" filter
  - Add "Add to Cart" button
- [ ] **Product Detail Component** - Single product view
  - Display full product information
  - Image gallery
  - Quantity selector
  - Add to Cart button
  - Related products section

### Priority 2: Shopping Cart
- [ ] **Cart View Component** - Display cart items
  - List all cart items with images
  - Quantity adjustment controls
  - Remove item button
  - Cart total calculation
  - Proceed to Checkout button
- [ ] **Checkout Component** - Order placement
  - Shipping address form
  - Order summary
  - Create order API integration
  - Success/Error messaging
  - Redirect to order confirmation

### Priority 3: Order Management
- [ ] **Order List Component** - User order history
  - Display all user orders
  - Status badges (Pending, Completed, Cancelled)
  - Order date and total
  - View details button
- [ ] **Order Detail Component** - Single order view
  - Order items with images
  - Shipping address
  - Order status
  - Cancel order functionality

### Priority 4: Admin Features
- [ ] **Product Management Component** - Admin CRUD
  - Product list table with actions
  - Create product dialog
  - Edit product dialog
  - Delete confirmation
  - Toggle active/inactive status

### Priority 5: Enhancements
- [ ] Loading indicators for async operations
- [ ] Toast notifications for success/error messages
- [ ] Form validation error messages
- [ ] Pagination component styling
- [ ] Empty state components (no products, empty cart)
- [ ] Confirmation dialogs (delete, logout)
- [ ] Responsive mobile menu
- [ ] Product image upload (Admin)
- [ ] Search autocomplete

## Development Workflow

### Starting Development Server
```bash
cd C:\ecommerce-frontend\ecommerce-app
npm start              # Runs on http://localhost:4200
ng serve --port 4201   # Custom port if 4200 is in use
```

### Generating Components
```bash
ng generate component features/[feature]/[component-name] --skip-tests
```

### Building for Production
```bash
npm run build          # Output to dist/
```

## API Integration

### Backend Services
All API calls go through the API Gateway at `http://localhost:5000`

**Auth Service** (Port 5001)
- POST /auth/api/auth/register
- POST /auth/api/auth/login

**Product Service** (Port 5002)
- GET /products/api/products
- GET /products/api/products/{id}
- POST /products/api/products (Admin)
- PUT /products/api/products/{id} (Admin)
- DELETE /products/api/products/{id} (Admin)

**Order Service** (Port 5003)
- GET /orders/api/cart
- POST /orders/api/cart
- GET /orders/api/orders/my-orders
- POST /orders/api/orders
- GET /orders/api/orders/{id}

## State Management

### Current Approach
- **Services as State Stores** - BehaviorSubject for observable state
- **Angular Signals** - Fine-grained reactivity (cart count, auth state)
- **localStorage** - Persistence for cart and JWT

### Example: Cart State
```typescript
// BehaviorSubject for cart items
private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
public cartItems$ = this.cartItemsSubject.asObservable();

// Signal for reactive item count
public itemCount = signal<number>(0);
```

## Styling Guidelines

### PrimeNG Aura Theme
The application uses PrimeNG v20 with the Aura theme preset.

### Custom Styles
- Global styles: `src/styles.scss`
- Component styles: Use scoped SCSS files
- Utility classes: Available from PrimeNG (`.p-button`, `.p-card`, etc.)

### Color Scheme
- Primary: Aura theme default (blue)
- Success: Green
- Danger: Red
- Warning: Orange

## Security

### Authentication
- JWT tokens stored in localStorage
- Token automatically attached to all API requests (except /auth/*)
- Auto-logout on 401 responses
- Protected routes require authentication

### Best Practices
- Never commit environment.prod.ts with real credentials
- Sanitize user input in forms
- Use Angular's built-in XSS protection
- Validate data on both client and server

## Testing Strategy (TODO)

### Unit Tests
- Service logic testing with jasmine/karma
- Component testing with TestBed
- Mock HTTP requests with HttpTestingController

### E2E Tests
- Playwright or Cypress for user flow testing
- Test authentication flow
- Test checkout process

## Deployment (TODO)

### Build Optimization
- Enable production mode
- AOT compilation
- Tree shaking
- Minification

### Hosting Options
- Netlify
- Vercel
- AWS S3 + CloudFront
- Azure Static Web Apps

## Git Workflow

### Branching Strategy
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches

### Commit Convention
```
feat: Add product list component with pagination
fix: Resolve cart total calculation bug
style: Update login page gradient
refactor: Extract pagination logic to shared service
docs: Update CLAUDE.md with deployment steps
```

## Known Issues
None currently - Application builds successfully ✅

## Next Immediate Tasks

**PRIORITY 1: Product List Component**
1. Create product list UI with PrimeNG DataView
2. Integrate ProductService.getProducts()
3. Implement pagination controls
4. Add search input with debounce
5. Add price range filters
6. Add "Add to Cart" functionality

**PRIORITY 2: Product Detail Component**
1. Create detail view layout
2. Fetch product by ID from route params
3. Display product information
4. Add quantity selector
5. Implement Add to Cart

## Development Notes

### PrimeNG v20 Migration
This project uses PrimeNG v20 which has a new theming system:
- No more `resources/themes` folder
- Use `@primeng/themes` package
- Configure via `providePrimeNG()` in app.config.ts
- Aura preset is the default theme

### Angular 18 Features Used
- Standalone components (disabled for this project)
- Signals for reactive state
- Function-based guards and interceptors
- `inject()` function for dependency injection

---

**Last Updated:** 2025-11-17
**Current Version:** 1.0.0
**Angular Version:** 18.x
**PrimeNG Version:** 20.3.0
