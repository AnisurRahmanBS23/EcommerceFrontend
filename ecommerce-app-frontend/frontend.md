Frontend Task Plan — E-commerce Angular 18 + PrimeNG

Overview

This file contains ordered tasks for implementing the frontend of a microservices-based e-commerce app. Each task can be implemented and committed individually.

Stack & Conventions:

Angular 18

PrimeNG for UI components

RxJS for reactive programming

HttpClient for API calls

JWT-based authentication

Docker for containerization (optional)

xUnit / Karma + Jasmine for unit tests

Git for version control

Task 1 — Project setup

Create Angular 18 workspace and initial project folder. Configure linting, prettier, and git.

Task 2 — Install PrimeNG & dependencies

Install PrimeNG, PrimeIcons, Angular Router, RxJS, and required CSS themes.

Task 3 — Create core modules

Create core and shared modules for services, guards, interceptors, and reusable components.

Task 4 — Layout and routing

Implement app layout with header, sidebar, footer. Configure Angular Router with lazy-loaded modules.

Task 5 — Authentication module

Create login, register, and logout components. Set up form validation.

Task 6 — JWT authentication interceptor

Add HttpInterceptor to attach JWT token to API requests.

Task 7 — Auth service

Implement AuthService for login, register, logout, and token storage.

Task 8 — Home/dashboard module

Create a dashboard component displaying key info like featured products and user info.

Task 9 — Product listing page

Implement product list component with data fetched from Product API.

Task 10 — Product detail page

Add component to show product details, including images and descriptions.

Task 11 — Product search & filter

Implement search bar, category filter, and sorting using RxJS operators.

Task 12 — Product pagination

Add pagination controls using PrimeNG paginator.

Task 13 — Add to cart functionality

Implement cart service with observable state, add/remove/update product quantities.

Task 14 — Cart page

Create cart page with product summary, total price, and checkout button.

Task 15 — Checkout page

Implement checkout form with user details and payment selection (mock integration).

Task 16 — Integrate SSL Commerz payment

Add service and component to initiate payment using SSL Commerz API.

Task 17 — Order history page

Fetch and display user orders with details and status.

Task 18 — Admin product management

Add admin module with product create/edit/delete functionality.

Task 19 — Admin order management

Add order list component with filtering and status update.

Task 20 — Notifications

Implement toast notifications using PrimeNG for success/error messages.

Task 21 — Guard & role-based routes

Add AuthGuard and RoleGuard to protect routes based on JWT roles.

Task 22 — Lazy loading modules

Ensure modules like admin and user dashboard are
Task 23 — Product detail page

Implement a product detail page displaying all product information including image, description, price, and stock.

Task 24 — Add to cart functionality

Enable users to add products to a cart with quantity selection and display cart summary.

Task 25 — Cart page

Create a cart page where users can view, edit quantities, and remove products.

Task 26 — Checkout page

Implement checkout form to collect shipping, payment info, and place orders.

Task 27 — Integrate SSL Commerz payment

Call backend API to generate payment session and handle redirection for payment completion.

Task 28 — Order confirmation page

Show order summary and confirmation after successful checkout/payment.

Task 29 — User registration & login

Implement registration and login forms, call backend Auth APIs, handle JWT storage.

Task 30 — Auth guard & route protection

Implement route guards to protect pages for logged-in users or specific roles.

Task 31 — User profile page

Allow users to view and update their profile information, including email and password.

Task 32 — Product listing pagination & filters

Add client-side pagination, search, and category filters for product list.

Task 33 — Responsive design

Ensure all pages work well on mobile, tablet, and desktop using PrimeNG layouts.

Task 34 — Global state management

Implement a service or store for cart, user info, and order data (using RxJS or BehaviorSubject).

Task 35 — Error handling & notifications

Show toast messages for errors, successes, or important actions using PrimeNG Toast service.

Task 36 — Loading indicators

Add spinners/loaders for API calls to enhance UX.

Task 37 — Product image upload integration

Enable admin users to upload product images via presigned URLs from backend.

Task 38 — Admin product management

Add pages for creating, editing, and deleting products (admin-only).

Task 39 — Order history page

Display user’s past orders with details, status, and date.

Task 40 — Unit tests

Write unit tests for components, services, and guards using Jasmine/Karma.

Task 41 — HTTP interceptor

Add interceptor to attach JWT tokens to requests and handle global errors.

Task 42 — Lazy loading modules

Optimize app load time by lazy-loading feature modules (e.g., admin, cart, product).

Task 43 — Environment configuration

Use Angular environment files for API endpoints and keys for dev, staging, and prod.

Task 44 — PrimeNG theme & UI polishing

Apply PrimeNG theme, tweak component styles, and ensure UI consistency.

Task 45 — Accessibility improvements

Ensure proper labels, ARIA attributes, and keyboard navigation across components.

Task 46 — Deployment setup

Prepare production build and deployment scripts (e.g., to S3/CloudFront).

Task 47 — CI/CD integration

Add Angular build and linting to GitHub Actions workflow for automated builds.

Task 48 — Performance optimization

Use OnPush change detection, trackBy for *ngFor, and lazy loading images.

Task 49 — Analytics placeholder

Add placeholder for Google Analytics or custom tracking on key pages.

Task 50 — Final review & QA

Perform manual QA, cross-browser testing, and finalize the frontend for production.