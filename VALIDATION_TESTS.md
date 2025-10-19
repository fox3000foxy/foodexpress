# Validation Testing Examples

This file contains examples of API requests that will demonstrate the Joi validation in action.

## User Registration Validation Tests

### Valid Registration
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser123",
    "password": "password123",
    "role": "user"
  }'
```

### Invalid Email Format
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "username": "testuser123",
    "password": "password123"
  }'
```
Expected: 400 Bad Request with validation error about email format

### Username Too Short
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "ab",
    "password": "password123"
  }'
```
Expected: 400 Bad Request with validation error about username length

### Password Too Short
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser123",
    "password": "123"
  }'
```
Expected: 400 Bad Request with validation error about password length

### Invalid Role
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser123",
    "password": "password123",
    "role": "superuser"
  }'
```
Expected: 400 Bad Request with validation error about invalid role

## Restaurant Validation Tests

### Valid Restaurant Creation (requires admin token)
```bash
curl -X POST http://localhost:3000/restaurants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "name": "Pizza Palace",
    "address": "123 Main Street, Anytown, USA",
    "phone": "5551234567",
    "opening_hours": "9AM-10PM"
  }'
```

### Restaurant Name Too Short
```bash
curl -X POST http://localhost:3000/restaurants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "name": "A",
    "address": "123 Main Street, Anytown, USA",
    "phone": "5551234567",
    "opening_hours": "9AM-10PM"
  }'
```
Expected: 400 Bad Request with validation error about name length

### Invalid Phone Number
```bash
curl -X POST http://localhost:3000/restaurants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "name": "Pizza Palace",
    "address": "123 Main Street, Anytown, USA",
    "phone": "abc-def-ghij",
    "opening_hours": "9AM-10PM"
  }'
```
Expected: 400 Bad Request with validation error about phone format

## Menu Item Validation Tests

### Valid Menu Item Creation (requires admin token)
```bash
curl -X POST http://localhost:3000/menus \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "restaurant_id": "507f1f77bcf86cd799439011",
    "name": "Margherita Pizza",
    "description": "Classic pizza with tomato sauce, mozzarella, and fresh basil",
    "price": 12.99,
    "category": "pizza"
  }'
```

### Invalid Restaurant ID Format
```bash
curl -X POST http://localhost:3000/menus \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "restaurant_id": "invalid-id",
    "name": "Margherita Pizza",
    "description": "Classic pizza with tomato sauce, mozzarella, and fresh basil",
    "price": 12.99,
    "category": "pizza"
  }'
```
Expected: 400 Bad Request with validation error about restaurant ID format

### Negative Price
```bash
curl -X POST http://localhost:3000/menus \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "restaurant_id": "507f1f77bcf86cd799439011",
    "name": "Margherita Pizza",
    "description": "Classic pizza with tomato sauce, mozzarella, and fresh basil",
    "price": -5.99,
    "category": "pizza"
  }'
```
Expected: 400 Bad Request with validation error about price being positive

### Invalid Category
```bash
curl -X POST http://localhost:3000/menus \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "restaurant_id": "507f1f77bcf86cd799439011",
    "name": "Margherita Pizza",
    "description": "Classic pizza with tomato sauce, mozzarella, and fresh basil",
    "price": 12.99,
    "category": "unknown-category"
  }'
```
Expected: 400 Bad Request with validation error about invalid category

## Query Parameter Validation Tests

### Invalid Pagination
```bash
curl "http://localhost:3000/restaurants?page=0&limit=101"
```
Expected: 400 Bad Request with validation errors about page and limit values

### Invalid Sort Order
```bash
curl "http://localhost:3000/restaurants?sortBy=name&sortOrder=invalid"
```
Expected: 400 Bad Request with validation error about sort order

## ObjectId Validation Tests

### Invalid User ID in GET request
```bash
curl -H "Authorization: Bearer <user-token>" \
  "http://localhost:3000/users/invalid-object-id"
```
Expected: 400 Bad Request with validation error about user ID format

### Invalid Restaurant ID in GET request
```bash
curl "http://localhost:3000/restaurants/not-a-valid-id"
```
Expected: 400 Bad Request with validation error about restaurant ID format

## Multiple Validation Errors

### Multiple validation failures
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "username": "ab",
    "password": "123",
    "role": "invalid-role"
  }'
```
Expected: 400 Bad Request with multiple validation errors in the details array

## Testing Instructions

1. Start the server: `npm run dev`
2. Use these curl commands to test validation
3. Check that appropriate 400 errors are returned with detailed validation messages
4. Verify that valid requests pass through successfully