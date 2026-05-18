# Internal Food Booking System — API Documentation

**Base URL:** `http://localhost:8081`  
**Content-Type:** `application/json` (all requests and responses unless noted)

---

## Table of Contents

1. [Auth](#1-auth)
2. [Users](#2-users)
3. [Floors](#3-floors)
4. [Shops](#4-shops)
5. [Food Items](#5-food-items)
6. [Orders](#6-orders)
7. [Order Items](#7-order-items)
8. [Payments](#8-payments)
9. [Feedbacks](#9-feedbacks)

---

## Enums Reference

| Enum | Values |
|------|--------|
| `Role` | `ADMIN`, `EMPLOYEE`, `VENDOR` |
| `OrderItemStatus` | `ORDERED`, `PREPARED`, `DELIVERED` |
| `PaymentMethod` | `UPI`, `CARD`, `NETBANKING`, `WALLET` |
| `PaymentStatus` | `PENDING`, `SUCCESS`, `FAILED` |

---

## 1. Auth

### POST `/api/auth/login`

Authenticates a user and returns a JWT token along with user details.

**Request Body:**
```json
{
  "email": "john.doe@company.com",
  "password": "secret123"
}
```

**Response `200 OK`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "employeeId": 1001,
    "email": "john.doe@company.com",
    "fullName": "John Doe",
    "phone": "9876543210",
    "role": "EMPLOYEE",
    "createdAt": "2025-01-15T09:00:00",
    "isActive": true
  }
}
```

---

## 2. Users

Base path: `/api/users`

### GET `/api/users`

Returns all users.

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "employeeId": 1001,
    "email": "john.doe@company.com",
    "fullName": "John Doe",
    "phone": "9876543210",
    "role": "EMPLOYEE",
    "createdAt": "2025-01-15T09:00:00",
    "isActive": true
  }
]
```

---

### GET `/api/users/{employeeId}`

Returns a single user by employee ID.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `employeeId` | `Integer` | The employee's ID |

**Response `200 OK`:**
```json
{
  "id": 1,
  "employeeId": 1001,
  "email": "john.doe@company.com",
  "fullName": "John Doe",
  "phone": "9876543210",
  "role": "EMPLOYEE",
  "createdAt": "2025-01-15T09:00:00",
  "isActive": true
}
```

**Response `404 Not Found`** — if no user with that `employeeId` exists.

---

### GET `/api/users/by-email`

Returns a user by their email address.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | `String` | Yes | The user's email address |

**Example:** `GET /api/users/by-email?email=john.doe@company.com`

**Response `200 OK`:**
```json
{
  "id": 1,
  "employeeId": 1001,
  "email": "john.doe@company.com",
  "fullName": "John Doe",
  "phone": "9876543210",
  "role": "EMPLOYEE",
  "createdAt": "2025-01-15T09:00:00",
  "isActive": true
}
```

**Response `404 Not Found`** — if no user with that email exists.

---

### PATCH `/api/users/{employeeId}/active`

Activates or deactivates a user account.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `employeeId` | `Integer` | The employee's ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `active` | `Boolean` | Yes | `true` to activate, `false` to deactivate |

**Example:** `PATCH /api/users/1001/active?active=false`

**Response `200 OK`:**
```json
{
  "id": 1,
  "employeeId": 1001,
  "email": "john.doe@company.com",
  "fullName": "John Doe",
  "phone": "9876543210",
  "role": "EMPLOYEE",
  "createdAt": "2025-01-15T09:00:00",
  "isActive": false
}
```

---

## 3. Floors

Base path: `/api/floors`

### GET `/api/floors`

Returns all floors.

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "floorNumber": 1,
    "isActive": true
  }
]
```

---

### GET `/api/floors/{id}`

Returns a floor by ID.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `Integer` | Floor ID |

**Response `200 OK`:**
```json
{
  "id": 1,
  "floorNumber": 1,
  "isActive": true
}
```

**Response `404 Not Found`** — if no floor with that ID exists.

---

### GET `/api/floors/active`

Returns only active floors.

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "floorNumber": 1,
    "isActive": true
  }
]
```

---

### POST `/api/floors`

Creates a new floor.

**Request Body:**
```json
{
  "floorNumber": 3,
  "isActive": true
}
```

**Response `200 OK`:**
```json
{
  "id": 3,
  "floorNumber": 3,
  "isActive": true
}
```

---

### PUT `/api/floors/{id}`

Fully replaces a floor record.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `Integer` | Floor ID |

**Request Body:**
```json
{
  "floorNumber": 3,
  "isActive": false
}
```

**Response `200 OK`:** Updated floor object.

---

### DELETE `/api/floors/{id}`

Deletes a floor by ID.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `Integer` | Floor ID |

**Response `204 No Content`**

---

## 4. Shops

Base path: `/api/shops`

### GET `/api/shops`

Returns all shops.

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "floor": { "id": 1, "floorNumber": 1, "isActive": true },
    "name": "Spice Garden",
    "isVeg": false,
    "isOpen": true,
    "avgRating": 4.20,
    "vendor": { "employeeId": 2001, "fullName": "Vendor Name", ... }
  }
]
```

---

### GET `/api/shops/{id}`

Returns a shop by ID.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `Integer` | Shop ID |

**Response `200 OK`:** Single shop object.  
**Response `404 Not Found`**

---

### GET `/api/shops/floor/{floorId}`

Returns all shops on a specific floor.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `floorId` | `Integer` | Floor ID |

**Response `200 OK`:** Array of shop objects.

---

### GET `/api/shops/open`

Returns all currently open shops.

**Response `200 OK`:** Array of open shop objects.

---

### GET `/api/shops/veg`

Returns all vegetarian-only shops.

**Response `200 OK`:** Array of veg shop objects.

---

### POST `/api/shops`

Creates a new shop.

**Request Body:**
```json
{
  "floor": { "id": 1 },
  "name": "Green Bowl",
  "isVeg": true,
  "isOpen": true,
  "avgRating": 0.00,
  "vendor": { "employeeId": 2001 }
}
```

**Response `200 OK`:** Created shop object.

---

### PUT `/api/shops/{id}`

Fully updates a shop.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `Integer` | Shop ID |

**Request Body:** Same structure as POST.

**Response `200 OK`:** Updated shop object.

---

### DELETE `/api/shops/{id}`

Deletes a shop by ID.

**Response `204 No Content`**

---

## 5. Food Items

Base path: `/api/food-items`

### GET `/api/food-items`

Returns all food items.

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "shop": { "id": 1, "name": "Spice Garden" },
    "name": "Paneer Butter Masala",
    "price": 120.00,
    "stockQuantity": 50,
    "prepTimeMins": 15,
    "isVeg": true,
    "avgRating": 4.50
  }
]
```

---

### GET `/api/food-items/search`

Searches and filters food items by various criteria.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | `String` | No | Partial name match |
| `isVeg` | `Boolean` | No | Filter by veg/non-veg |
| `shopId` | `Integer` | No | Filter by shop |
| `minPrice` | `BigDecimal` | No | Minimum price filter |
| `maxPrice` | `BigDecimal` | No | Maximum price filter |
| `maxPrepTime` | `Integer` | No | Maximum prep time in minutes |
| `sortBy` | `String` | No | `rating` or `popularity` |

**Example:** `GET /api/food-items/search?isVeg=true&maxPrice=150&sortBy=rating`

**Response `200 OK`:** Array of matching food item objects.

---

### GET `/api/food-items/{id}`

Returns a food item by ID.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `Integer` | Food item ID |

**Response `200 OK`:** Single food item object.  
**Response `404 Not Found`**

---

### GET `/api/food-items/shop/{shopId}`

Returns all food items for a specific shop.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `shopId` | `Integer` | Shop ID |

**Response `200 OK`:** Array of food item objects.

---

### GET `/api/food-items/shop/{shopId}/veg`

Returns only vegetarian food items for a specific shop.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `shopId` | `Integer` | Shop ID |

**Response `200 OK`:** Array of veg food item objects.

---

### GET `/api/food-items/veg`

Returns all vegetarian food items across all shops.

**Response `200 OK`:** Array of veg food item objects.

---

### POST `/api/food-items`

Creates a new food item.

**Request Body:**
```json
{
  "shop": { "id": 1 },
  "name": "Veg Biryani",
  "price": 110.00,
  "stockQuantity": 30,
  "prepTimeMins": 20,
  "isVeg": true,
  "avgRating": 0.00
}
```

**Response `200 OK`:** Created food item object.

---

### PUT `/api/food-items/{id}`

Fully updates a food item.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `Integer` | Food item ID |

**Request Body:** Same structure as POST.

**Response `200 OK`:** Updated food item object.

---

### DELETE `/api/food-items/{id}`

Deletes a food item by ID.

**Response `204 No Content`**

---

## 6. Orders

Base path: `/api/orders`

### GET `/api/orders`

Returns all orders.

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "user": { "employeeId": 1001, "fullName": "John Doe", ... },
    "tokenNo": "A4B2",
    "totalAmount": 230.00,
    "createdAt": "2025-05-18T12:30:00"
  }
]
```

---

### GET `/api/orders/{id}`

Returns an order by ID.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `Integer` | Order ID |

**Response `200 OK`:** Single order object.  
**Response `404 Not Found`**

---

### GET `/api/orders/token/{tokenNo}`

Returns an order by its unique token number.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `tokenNo` | `String` | The 4-character token assigned to the order |

**Response `200 OK`:** Single order object.  
**Response `404 Not Found`**

---

### GET `/api/orders/employee/{employeeId}`

Returns all orders placed by a specific employee.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `employeeId` | `Integer` | The employee's ID |

**Response `200 OK`:** Array of order objects.

---

### POST `/api/orders/place`

Places a new order atomically — creates the Order and all OrderItems in a single transaction. A unique 4-character token is auto-generated.

**Request Body:**
```json
{
  "userId": 1001,
  "items": [
    { "foodItemId": 3, "quantity": 2 },
    { "foodItemId": 7, "quantity": 1 }
  ]
}
```

**Response `200 OK`:**
```json
{
  "id": 42,
  "user": { "employeeId": 1001, "fullName": "John Doe", ... },
  "tokenNo": "X7K9",
  "totalAmount": 350.00,
  "createdAt": "2025-05-18T12:30:00"
}
```

---

### POST `/api/orders`

Creates a raw order record (manual creation, without automatic token/item processing).

**Request Body:**
```json
{
  "user": { "employeeId": 1001 },
  "tokenNo": "ZZZZ",
  "totalAmount": 100.00,
  "createdAt": "2025-05-18T12:00:00"
}
```

**Response `200 OK`:** Created order object.

---

### PUT `/api/orders/{id}`

Fully updates an order.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `Integer` | Order ID |

**Request Body:** Same structure as POST.

**Response `200 OK`:** Updated order object.

---

### DELETE `/api/orders/{id}`

Deletes an order and its associated items/payments (cascade).

**Response `204 No Content`**

---

## 7. Order Items

Base path: `/api/order-items`

### GET `/api/order-items`

Returns all order items.

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "user": { "employeeId": 1001, ... },
    "order": { "id": 42, "tokenNo": "X7K9", ... },
    "foodItem": { "id": 3, "name": "Veg Biryani", ... },
    "quantity": 2,
    "status": "ORDERED",
    "subtotal": 220.00
  }
]
```

---

### GET `/api/order-items/{id}`

Returns an order item by ID.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `Integer` | Order item ID |

**Response `200 OK`:** Single order item object.  
**Response `404 Not Found`**

---

### GET `/api/order-items/order/{orderId}`

Returns all items belonging to a specific order.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `orderId` | `Integer` | Order ID |

**Response `200 OK`:** Array of order item objects.

---

### GET `/api/order-items/user/{userId}`

Returns all order items associated with a specific user.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `userId` | `Integer` | Employee ID of the user |

**Response `200 OK`:** Array of order item objects.

---

### GET `/api/order-items/status/{status}`

Returns all order items with a specific status.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | `OrderItemStatus` | One of: `ORDERED`, `PREPARED`, `DELIVERED` |

**Response `200 OK`:** Array of order item objects.

---

### POST `/api/order-items`

Creates a new order item manually.

**Request Body:**
```json
{
  "user": { "employeeId": 1001 },
  "order": { "id": 42 },
  "foodItem": { "id": 3 },
  "quantity": 2,
  "status": "ORDERED",
  "subtotal": 220.00
}
```

**Response `200 OK`:** Created order item object.

---

### PATCH `/api/order-items/{id}/status`

Updates the status of a specific order item.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `Integer` | Order item ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | `OrderItemStatus` | Yes | New status: `ORDERED`, `PREPARED`, or `DELIVERED` |

**Example:** `PATCH /api/order-items/1/status?status=PREPARED`

**Response `200 OK`:** Updated order item object.

---

### PUT `/api/order-items/{id}`

Fully updates an order item.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `Integer` | Order item ID |

**Request Body:** Same structure as POST.

**Response `200 OK`:** Updated order item object.

---

### DELETE `/api/order-items/{id}`

Deletes an order item by ID.

**Response `204 No Content`**

---

## 8. Payments

Base path: `/api/payments`

### GET `/api/payments`

Returns all payments.

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "order": { "id": 42, "tokenNo": "X7K9", ... },
    "gatewayTxnId": "TXN123456789",
    "amount": 350.00,
    "method": "UPI",
    "status": "SUCCESS",
    "paidAt": "2025-05-18T12:35:00"
  }
]
```

---

### GET `/api/payments/{id}`

Returns a payment by ID.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `Integer` | Payment ID |

**Response `200 OK`:** Single payment object.  
**Response `404 Not Found`**

---

### GET `/api/payments/txn/{gatewayTxnId}`

Returns a payment by its gateway transaction ID.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `gatewayTxnId` | `String` | The transaction ID from the payment gateway |

**Response `200 OK`:** Single payment object.  
**Response `404 Not Found`**

---

### GET `/api/payments/order/{orderId}`

Returns all payments linked to a specific order.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `orderId` | `Integer` | Order ID |

**Response `200 OK`:** Array of payment objects.

---

### GET `/api/payments/status/{status}`

Returns all payments with a specific status.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | `PaymentStatus` | One of: `PENDING`, `SUCCESS`, `FAILED` |

**Response `200 OK`:** Array of payment objects.

---

### POST `/api/payments`

Creates a new payment record.

**Request Body:**
```json
{
  "order": { "id": 42 },
  "gatewayTxnId": "TXN123456789",
  "amount": 350.00,
  "method": "UPI",
  "status": "PENDING",
  "paidAt": "2025-05-18T12:35:00"
}
```

**Response `200 OK`:** Created payment object.

---

### PATCH `/api/payments/{id}/status`

Updates the status of a payment.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `Integer` | Payment ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | `PaymentStatus` | Yes | New status: `PENDING`, `SUCCESS`, or `FAILED` |

**Example:** `PATCH /api/payments/1/status?status=SUCCESS`

**Response `200 OK`:** Updated payment object.

---

### PUT `/api/payments/{id}`

Fully updates a payment record.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `Integer` | Payment ID |

**Request Body:** Same structure as POST.

**Response `200 OK`:** Updated payment object.

---

### DELETE `/api/payments/{id}`

Deletes a payment by ID.

**Response `204 No Content`**

---

## 9. Feedbacks

Base path: `/api/feedbacks`

### GET `/api/feedbacks`

Returns all feedback entries.

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "orderItem": { "id": 1, ... },
    "rating": 5,
    "review": "Absolutely delicious!",
    "reviewedAt": "2025-05-18T13:00:00"
  }
]
```

---

### GET `/api/feedbacks/{id}`

Returns a feedback entry by ID.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `Integer` | Feedback ID |

**Response `200 OK`:** Single feedback object.  
**Response `404 Not Found`**

---

### GET `/api/feedbacks/order-item/{orderItemId}`

Returns the feedback for a specific order item (one-to-one relationship).

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `orderItemId` | `Integer` | Order item ID |

**Response `200 OK`:** Single feedback object.  
**Response `404 Not Found`** — if no feedback exists for that order item.

---

### POST `/api/feedbacks`

Creates a new feedback entry for an order item.

**Request Body:**
```json
{
  "orderItem": { "id": 1 },
  "rating": 4,
  "review": "Great food, slightly delayed.",
  "reviewedAt": "2025-05-18T13:00:00"
}
```

> `rating` must be an integer (typically 1–5).

**Response `200 OK`:** Created feedback object.

---

### PUT `/api/feedbacks/{id}`

Fully updates a feedback entry.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `Integer` | Feedback ID |

**Request Body:** Same structure as POST.

**Response `200 OK`:** Updated feedback object.

---

### DELETE `/api/feedbacks/{id}`

Deletes a feedback entry by ID.

**Response `204 No Content`**

---

## Endpoint Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Login and get JWT token |
| `GET` | `/api/users` | Get all users |
| `GET` | `/api/users/{employeeId}` | Get user by employee ID |
| `GET` | `/api/users/by-email?email=` | Get user by email |
| `PATCH` | `/api/users/{employeeId}/active?active=` | Activate/deactivate user |
| `GET` | `/api/floors` | Get all floors |
| `GET` | `/api/floors/{id}` | Get floor by ID |
| `GET` | `/api/floors/active` | Get active floors |
| `POST` | `/api/floors` | Create a floor |
| `PUT` | `/api/floors/{id}` | Update a floor |
| `DELETE` | `/api/floors/{id}` | Delete a floor |
| `GET` | `/api/shops` | Get all shops |
| `GET` | `/api/shops/{id}` | Get shop by ID |
| `GET` | `/api/shops/floor/{floorId}` | Get shops by floor |
| `GET` | `/api/shops/open` | Get open shops |
| `GET` | `/api/shops/veg` | Get veg-only shops |
| `POST` | `/api/shops` | Create a shop |
| `PUT` | `/api/shops/{id}` | Update a shop |
| `DELETE` | `/api/shops/{id}` | Delete a shop |
| `GET` | `/api/food-items` | Get all food items |
| `GET` | `/api/food-items/search` | Search/filter food items |
| `GET` | `/api/food-items/{id}` | Get food item by ID |
| `GET` | `/api/food-items/shop/{shopId}` | Get food items by shop |
| `GET` | `/api/food-items/shop/{shopId}/veg` | Get veg items by shop |
| `GET` | `/api/food-items/veg` | Get all veg food items |
| `POST` | `/api/food-items` | Create a food item |
| `PUT` | `/api/food-items/{id}` | Update a food item |
| `DELETE` | `/api/food-items/{id}` | Delete a food item |
| `GET` | `/api/orders` | Get all orders |
| `GET` | `/api/orders/{id}` | Get order by ID |
| `GET` | `/api/orders/token/{tokenNo}` | Get order by token |
| `GET` | `/api/orders/employee/{employeeId}` | Get orders by employee |
| `POST` | `/api/orders/place` | Place an order (atomic) |
| `POST` | `/api/orders` | Create a raw order |
| `PUT` | `/api/orders/{id}` | Update an order |
| `DELETE` | `/api/orders/{id}` | Delete an order |
| `GET` | `/api/order-items` | Get all order items |
| `GET` | `/api/order-items/{id}` | Get order item by ID |
| `GET` | `/api/order-items/order/{orderId}` | Get items by order |
| `GET` | `/api/order-items/user/{userId}` | Get items by user |
| `GET` | `/api/order-items/status/{status}` | Get items by status |
| `POST` | `/api/order-items` | Create an order item |
| `PATCH` | `/api/order-items/{id}/status?status=` | Update order item status |
| `PUT` | `/api/order-items/{id}` | Update an order item |
| `DELETE` | `/api/order-items/{id}` | Delete an order item |
| `GET` | `/api/payments` | Get all payments |
| `GET` | `/api/payments/{id}` | Get payment by ID |
| `GET` | `/api/payments/txn/{gatewayTxnId}` | Get payment by txn ID |
| `GET` | `/api/payments/order/{orderId}` | Get payments by order |
| `GET` | `/api/payments/status/{status}` | Get payments by status |
| `POST` | `/api/payments` | Create a payment |
| `PATCH` | `/api/payments/{id}/status?status=` | Update payment status |
| `PUT` | `/api/payments/{id}` | Update a payment |
| `DELETE` | `/api/payments/{id}` | Delete a payment |
| `GET` | `/api/feedbacks` | Get all feedbacks |
| `GET` | `/api/feedbacks/{id}` | Get feedback by ID |
| `GET` | `/api/feedbacks/order-item/{orderItemId}` | Get feedback by order item |
| `POST` | `/api/feedbacks` | Create a feedback |
| `PUT` | `/api/feedbacks/{id}` | Update a feedback |
| `DELETE` | `/api/feedbacks/{id}` | Delete a feedback |
