# E-Commerce API Documentation

**Project:** E-Commerce Platform - Backend API Specifications
**Version:** 1.0.0
**Last Updated:** November 18, 2025
**Base URL:** `http://localhost:5000`

## Table of Contents
1. [Authentication APIs](#authentication-apis)
2. [Product APIs](#product-apis)
3. [Cart APIs](#cart-apis)
4. [Order APIs](#order-apis)
5. [Admin APIs](#admin-apis)
6. [Common Response Formats](#common-response-formats)
7. [Error Handling](#error-handling)

---

## Authentication APIs

### 1. Register User
**POST** `/auth/api/auth/register`

**Description:** Register a new user account.

**Request Body:**
```json
{
  "username": "string (required, min: 3 chars)",
  "email": "string (required, valid email format)",
  "password": "string (required, min: 6 chars)",
  "confirmPassword": "string (required, must match password)"
}
```

**Success Response (201 Created):**
```json
{
  "token": "string (JWT token)",
  "userId": "string (GUID)",
  "username": "string",
  "email": "string"
}
```

**Error Responses:**
- `400 Bad Request` - Validation errors (email already exists, passwords don't match, etc.)
- `500 Internal Server Error` - Server error

---

### 2. Login User
**POST** `/auth/api/auth/login`

**Description:** Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Success Response (200 OK):**
```json
{
  "token": "string (JWT token)",
  "userId": "string (GUID)",
  "username": "string",
  "email": "string"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials
- `400 Bad Request` - Validation errors
- `500 Internal Server Error` - Server error

---

## Product APIs

### 3. Get All Products
**GET** `/products/api/products`

**Description:** Get list of products with optional filtering, sorting, and search.

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `pageSize` (optional, default: 12) - Number of items per page
- `search` (optional) - Search by product name or description
- `sortBy` (optional) - Sort field: `name`, `price`, `date`
- `sortOrder` (optional) - Sort order: `asc`, `desc`
- `minPrice` (optional) - Minimum price filter
- `maxPrice` (optional) - Maximum price filter
- `inStock` (optional) - Filter for in-stock products: `true`, `false`

**Success Response (200 OK):**
```json
[
  {
    "id": "string (GUID)",
    "name": "string",
    "description": "string",
    "price": "number (decimal)",
    "imageUrl": "string (URL)",
    "stock": "number (integer)",
    "isActive": "boolean",
    "createdAt": "string (ISO 8601 datetime)",
    "updatedAt": "string (ISO 8601 datetime, nullable)"
  }
]
```

**Note:** Currently returns an array. Backend can optionally implement pagination wrapper:
```json
{
  "items": [],
  "totalCount": 100,
  "page": 1,
  "pageSize": 12,
  "totalPages": 9,
  "hasPreviousPage": false,
  "hasNextPage": true
}
```

**Error Responses:**
- `400 Bad Request` - Invalid query parameters
- `500 Internal Server Error` - Server error

---

### 4. Get Product by ID
**GET** `/products/api/products/{id}`

**Description:** Get details of a specific product.

**Path Parameters:**
- `id` (required) - Product GUID

**Success Response (200 OK):**
```json
{
  "id": "string (GUID)",
  "name": "string",
  "description": "string",
  "price": "number (decimal)",
  "imageUrl": "string (URL)",
  "stock": "number (integer)",
  "isActive": "boolean",
  "createdAt": "string (ISO 8601 datetime)",
  "updatedAt": "string (ISO 8601 datetime, nullable)"
}
```

**Error Responses:**
- `404 Not Found` - Product not found
- `500 Internal Server Error` - Server error

---

## Cart APIs

### 5. Get User Cart
**GET** `/orders/api/cart`

**Description:** Get current user's shopping cart. Requires authentication.

**Headers:**
- `Authorization: Bearer {token}` (required)

**Success Response (200 OK):**
```json
{
  "userId": "string (GUID)",
  "cartItems": [
    {
      "productId": "string (GUID)",
      "productName": "string",
      "price": "number (decimal)",
      "quantity": "number (integer)",
      "imageUrl": "string (URL)"
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `500 Internal Server Error` - Server error

---

### 6. Add/Update Cart Item
**POST** `/orders/api/cart`

**Description:** Add a new item to cart or update quantity if already exists. Requires authentication.

**Headers:**
- `Authorization: Bearer {token}` (required)

**Request Body:**
```json
{
  "productId": "string (GUID, required)",
  "quantity": "number (integer, required, min: 1)"
}
```

**Success Response (200 OK):**
```json
{
  "userId": "string (GUID)",
  "cartItems": [
    {
      "productId": "string (GUID)",
      "productName": "string",
      "price": "number (decimal)",
      "quantity": "number (integer)",
      "imageUrl": "string (URL)"
    }
  ]
}
```

**Error Responses:**
- `400 Bad Request` - Invalid product ID or quantity
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - Product not found
- `500 Internal Server Error` - Server error

---

### 7. Remove Cart Item
**DELETE** `/orders/api/cart/{productId}`

**Description:** Remove an item from cart. Requires authentication.

**Headers:**
- `Authorization: Bearer {token}` (required)

**Path Parameters:**
- `productId` (required) - Product GUID to remove

**Success Response (200 OK):**
```json
{
  "message": "Item removed from cart",
  "userId": "string (GUID)",
  "cartItems": []
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - Item not in cart
- `500 Internal Server Error` - Server error

---

## Order APIs

### 8. Create Order
**POST** `/orders/api/orders`

**Description:** Create a new order from cart items. Requires authentication.

**Headers:**
- `Authorization: Bearer {token}` (required)

**Request Body:**
```json
{
  "shippingAddress": "string (required, min: 10 chars)",
  "totalAmount": "number (decimal, required)"
}
```

**Success Response (201 Created):**
```json
{
  "id": "string (GUID)",
  "userId": "string (GUID)",
  "orderItems": [
    {
      "productId": "string (GUID)",
      "productName": "string",
      "price": "number (decimal)",
      "quantity": "number (integer)"
    }
  ],
  "totalAmount": "number (decimal)",
  "status": "string (pending)",
  "shippingAddress": "string",
  "createdAt": "string (ISO 8601 datetime)"
}
```

**Error Responses:**
- `400 Bad Request` - Validation errors or empty cart
- `401 Unauthorized` - Invalid or missing token
- `500 Internal Server Error` - Server error

---

### 9. Get My Orders
**GET** `/orders/api/orders/my-orders`

**Description:** Get all orders for the current authenticated user. Requires authentication.

**Headers:**
- `Authorization: Bearer {token}` (required)

**Success Response (200 OK):**
```json
[
  {
    "id": "string (GUID)",
    "userId": "string (GUID)",
    "orderItems": [
      {
        "productId": "string (GUID)",
        "productName": "string",
        "price": "number (decimal)",
        "quantity": "number (integer)"
      }
    ],
    "totalAmount": "number (decimal)",
    "status": "string (pending, paid, shipped, delivered, cancelled)",
    "shippingAddress": "string",
    "createdAt": "string (ISO 8601 datetime)"
  }
]
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `500 Internal Server Error` - Server error

---

### 10. Get Order by ID
**GET** `/orders/api/orders/{id}`

**Description:** Get details of a specific order. Requires authentication.

**Headers:**
- `Authorization: Bearer {token}` (required)

**Path Parameters:**
- `id` (required) - Order GUID

**Success Response (200 OK):**
```json
{
  "id": "string (GUID)",
  "userId": "string (GUID)",
  "orderItems": [
    {
      "productId": "string (GUID)",
      "productName": "string",
      "price": "number (decimal)",
      "quantity": "number (integer)"
    }
  ],
  "totalAmount": "number (decimal)",
  "status": "string",
  "shippingAddress": "string",
  "createdAt": "string (ISO 8601 datetime)"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - Order belongs to another user
- `404 Not Found` - Order not found
- `500 Internal Server Error` - Server error

---

## Admin APIs

### 11. Create Product (Admin)
**POST** `/products/api/products`

**Description:** Create a new product. Requires admin authentication.

**Headers:**
- `Authorization: Bearer {token}` (required, admin role)

**Request Body:**
```json
{
  "name": "string (required, min: 3 chars)",
  "description": "string (required, min: 10 chars)",
  "price": "number (decimal, required, min: 0.01)",
  "stock": "number (integer, required, min: 0)",
  "imageUrl": "string (required, valid URL)",
  "isActive": "boolean (optional, default: true)"
}
```

**Success Response (201 Created):**
```json
{
  "id": "string (GUID)",
  "name": "string",
  "description": "string",
  "price": "number (decimal)",
  "imageUrl": "string (URL)",
  "stock": "number (integer)",
  "isActive": "boolean",
  "createdAt": "string (ISO 8601 datetime)",
  "updatedAt": null
}
```

**Error Responses:**
- `400 Bad Request` - Validation errors
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - Not an admin user
- `500 Internal Server Error` - Server error

---

### 12. Update Product (Admin)
**PUT** `/products/api/products/{id}`

**Description:** Update an existing product. Requires admin authentication.

**Headers:**
- `Authorization: Bearer {token}` (required, admin role)

**Path Parameters:**
- `id` (required) - Product GUID

**Request Body:**
```json
{
  "name": "string (optional)",
  "description": "string (optional)",
  "price": "number (decimal, optional)",
  "stock": "number (integer, optional)",
  "imageUrl": "string (optional)",
  "isActive": "boolean (optional)"
}
```

**Success Response (200 OK):**
```json
{
  "id": "string (GUID)",
  "name": "string",
  "description": "string",
  "price": "number (decimal)",
  "imageUrl": "string (URL)",
  "stock": "number (integer)",
  "isActive": "boolean",
  "createdAt": "string (ISO 8601 datetime)",
  "updatedAt": "string (ISO 8601 datetime)"
}
```

**Error Responses:**
- `400 Bad Request` - Validation errors
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - Not an admin user
- `404 Not Found` - Product not found
- `500 Internal Server Error` - Server error

---

### 13. Delete Product (Admin)
**DELETE** `/products/api/products/{id}`

**Description:** Delete a product (soft delete recommended). Requires admin authentication.

**Headers:**
- `Authorization: Bearer {token}` (required, admin role)

**Path Parameters:**
- `id` (required) - Product GUID

**Success Response (204 No Content or 200 OK):**
```json
{
  "message": "Product deleted successfully"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - Not an admin user
- `404 Not Found` - Product not found
- `500 Internal Server Error` - Server error

---

### 14. Get All Orders (Admin) - **NEW API NEEDED**
**GET** `/orders/api/admin/orders`

**Description:** Get all orders from all users for admin management. Requires admin authentication.

**Headers:**
- `Authorization: Bearer {token}` (required, admin role)

**Query Parameters:**
- `status` (optional) - Filter by order status: `pending`, `paid`, `shipped`, `delivered`, `cancelled`
- `page` (optional, default: 1) - Page number
- `pageSize` (optional, default: 10) - Number of items per page

**Success Response (200 OK):**
```json
[
  {
    "id": "string (GUID)",
    "userId": "string (GUID)",
    "customerEmail": "string (email)",
    "customerName": "string",
    "orderItems": [
      {
        "productId": "string (GUID)",
        "productName": "string",
        "price": "number (decimal)",
        "quantity": "number (integer)"
      }
    ],
    "totalAmount": "number (decimal)",
    "status": "string",
    "shippingAddress": "string",
    "createdAt": "string (ISO 8601 datetime)"
  }
]
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - Not an admin user
- `500 Internal Server Error` - Server error

---

### 15. Update Order Status (Admin) - **NEW API NEEDED**
**PUT** `/orders/api/admin/orders/{id}/status`

**Description:** Update the status of an order. Requires admin authentication.

**Headers:**
- `Authorization: Bearer {token}` (required, admin role)

**Path Parameters:**
- `id` (required) - Order GUID

**Request Body:**
```json
{
  "status": "string (required, one of: pending, paid, shipped, delivered, cancelled)"
}
```

**Success Response (200 OK):**
```json
{
  "id": "string (GUID)",
  "userId": "string (GUID)",
  "status": "string (updated status)",
  "updatedAt": "string (ISO 8601 datetime)"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid status value
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - Not an admin user
- `404 Not Found` - Order not found
- `500 Internal Server Error` - Server error

---

### 16. Get Order Details with Customer Info (Admin) - **NEW API NEEDED**
**GET** `/orders/api/admin/orders/{id}`

**Description:** Get full order details including customer information. Requires admin authentication.

**Headers:**
- `Authorization: Bearer {token}` (required, admin role)

**Path Parameters:**
- `id` (required) - Order GUID

**Success Response (200 OK):**
```json
{
  "id": "string (GUID)",
  "userId": "string (GUID)",
  "customer": {
    "userId": "string (GUID)",
    "username": "string",
    "email": "string"
  },
  "orderItems": [
    {
      "productId": "string (GUID)",
      "productName": "string",
      "price": "number (decimal)",
      "quantity": "number (integer)",
      "imageUrl": "string (URL)"
    }
  ],
  "totalAmount": "number (decimal)",
  "status": "string",
  "shippingAddress": "string",
  "createdAt": "string (ISO 8601 datetime)",
  "updatedAt": "string (ISO 8601 datetime, nullable)"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - Not an admin user
- `404 Not Found` - Order not found
- `500 Internal Server Error` - Server error

---

## Common Response Formats

### Success Response
All successful responses follow standard HTTP status codes:
- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `204 No Content` - Request successful, no content to return

### Error Response
All error responses follow this format:
```json
{
  "message": "string (human-readable error message)",
  "errors": {
    "field1": ["error message 1", "error message 2"],
    "field2": ["error message"]
  }
}
```

---

## Error Handling

### HTTP Status Codes
- `200 OK` - Success
- `201 Created` - Resource created
- `204 No Content` - Success, no content
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required or failed
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Common Error Scenarios

1. **Validation Errors (400)**
```json
{
  "message": "Validation failed",
  "errors": {
    "email": ["Email is already in use"],
    "password": ["Password must be at least 6 characters"]
  }
}
```

2. **Authentication Errors (401)**
```json
{
  "message": "Unauthorized. Please login again."
}
```

3. **Authorization Errors (403)**
```json
{
  "message": "Access forbidden. Admin privileges required."
}
```

4. **Not Found Errors (404)**
```json
{
  "message": "Product not found"
}
```

---

## Authentication & Authorization

### JWT Token
- All authenticated endpoints require a valid JWT token in the Authorization header
- Format: `Authorization: Bearer {token}`
- Token expiration: Recommended 24 hours
- Token should contain: `userId`, `email`, `role` (user/admin)

### Admin Authentication
Admin-only endpoints require:
1. Valid JWT token
2. User role must be "admin"

Backend should validate the user's role from the JWT token or database.

---

## Data Models

### User
```typescript
{
  userId: string (GUID)
  username: string
  email: string
  passwordHash: string (hashed)
  role: string (user | admin)
  createdAt: DateTime
}
```

### Product
```typescript
{
  id: string (GUID)
  name: string
  description: string
  price: decimal
  imageUrl: string
  stock: integer
  isActive: boolean
  createdAt: DateTime
  updatedAt: DateTime?
}
```

### Order
```typescript
{
  id: string (GUID)
  userId: string (GUID)
  orderItems: OrderItem[]
  totalAmount: decimal
  status: string (pending, paid, shipped, delivered, cancelled)
  shippingAddress: string
  createdAt: DateTime
  updatedAt: DateTime?
}
```

### OrderItem
```typescript
{
  productId: string (GUID)
  productName: string
  price: decimal
  quantity: integer
}
```

### Cart
```typescript
{
  userId: string (GUID)
  cartItems: CartItem[]
}
```

### CartItem
```typescript
{
  productId: string (GUID)
  productName: string
  price: decimal
  quantity: integer
  imageUrl: string
}
```

---

## Implementation Notes

### Required New APIs for Admin Features
The following endpoints need to be implemented for admin order management:

1. ✅ **GET /orders/api/admin/orders** - Get all orders (admin)
2. ✅ **PUT /orders/api/admin/orders/{id}/status** - Update order status (admin)
3. ✅ **GET /orders/api/admin/orders/{id}** - Get order with customer info (admin)

### Existing APIs (Already Implemented)
All other APIs in this document should already be implemented in the backend.

### CORS Configuration
Ensure CORS is configured to allow requests from:
- Development: `http://localhost:4200`
- Production: Your production domain

### Database Considerations
- Use proper indexing on frequently queried fields (userId, productId, status, createdAt)
- Implement soft deletes for products (set isActive = false instead of deleting)
- Consider implementing audit logs for admin actions

---

**End of API Documentation**

For questions or clarifications, please contact the development team.
