# Food Express API

A REST API for food delivery service with JWT authentication, role-based access control, and comprehensive input validation using Joi.

## Features

- ✅ **Authentication & Authorization**: JWT-based stateless authentication with role-based access control
- ✅ **Input Validation**: Comprehensive validation using Joi for all endpoints
- ✅ **Security**: Password hashing with bcrypt, secure token handling
- ✅ **Error Handling**: Detailed validation error messages and proper HTTP status codes
- ✅ **Data Integrity**: MongoDB ObjectId validation, data type validation, and business rule enforcement

## Authentication & Authorization

### Overview
- **Public Access**: User registration, reading restaurants and menus
- **Authenticated Access**: Required for all write operations and user account management
- **Admin Access**: Full control over all resources
- **User Access**: Can only manage their own account

### JWT Token Format
Include the JWT token in requests as:
```
Authorization: Bearer <your-jwt-token>
```

## Input Validation

All API endpoints include comprehensive input validation using Joi:

### Validation Features
- **Email Validation**: Proper email format checking
- **Password Requirements**: Minimum 6 characters, maximum 50 characters
- **Username Rules**: 3-30 characters, alphanumeric and underscores only
- **MongoDB ObjectId**: Proper 24-character hexadecimal format validation
- **Price Validation**: Positive numbers with maximum 2 decimal places
- **Phone Number**: International phone number format validation
- **Pagination**: Page and limit validation with reasonable bounds
- **Enum Values**: Predefined category and role validation

### Validation Error Response
```json
{
  "error": "Validation failed",
  "details": [
    "Username must be at least 3 characters long",
    "Please provide a valid email address"
  ]
}
```

## API Endpoints

### User Management

#### Register User (Public)
```
POST /users
Content-Type: application/json

{
  "email": "user@example.com",           // Required: Valid email format
  "username": "username",               // Required: 3-30 chars, alphanumeric + underscore
  "password": "password123",            // Required: 6-50 characters
  "role": "user"                       // Optional: "user" or "admin", defaults to "user"
}
```

#### Login User (Public)
```
POST /users/login
Content-Type: application/json

{
  "email": "user@example.com",          // Required: Valid email format
  "password": "password123"             // Required
}

Response:
{
  "user": {
    "_id": "...",
    "email": "user@example.com",
    "username": "username",
    "role": "user"
  },
  "token": "jwt-token-here"
}
```

#### Get All Users (Admin Only)
```
GET /users
Authorization: Bearer <admin-jwt-token>
```

#### Get User by ID (User can only access own data, Admin can access any)
```
GET /users/:id
Authorization: Bearer <jwt-token>
```

#### Update User (User can only update own data, Admin can update any)
```
PUT /users/:id                         // ID must be valid MongoDB ObjectId
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "email": "newemail@example.com",      // Optional: Valid email format
  "username": "newusername",            // Optional: 3-30 chars, alphanumeric + underscore
  "password": "newpassword123",         // Optional: 6-50 characters
  "role": "admin"                       // Optional: Only admin can change role
}
```

#### Delete User (User can only delete own account, Admin can delete any)
```
DELETE /users/:id                      // ID must be valid MongoDB ObjectId
Authorization: Bearer <jwt-token>
```

### Restaurant Management

#### Get All Restaurants (Public)
```
GET /restaurants
```

#### Get Restaurant by ID (Public)
```
GET /restaurants/:id
```

#### Create Restaurant (Admin Only)
```
POST /restaurants
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "name": "Restaurant Name",           // Required: 2-100 characters
  "address": "123 Main St",            // Required: 10-200 characters
  "phone": "555-1234",                 // Required: Valid phone number format
  "opening_hours": "9AM-10PM"          // Required: 5-50 characters
}
```

#### Update Restaurant (Admin Only)
```
PUT /restaurants/:id                   // ID must be valid MongoDB ObjectId
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "name": "Updated Name",              // Optional: 2-100 characters
  "address": "456 New St",             // Optional: 10-200 characters
  "phone": "555-5678",                 // Optional: Valid phone number format
  "opening_hours": "8AM-11PM"          // Optional: 5-50 characters
}
```

#### Delete Restaurant (Admin Only)
```
DELETE /restaurants/:id
Authorization: Bearer <admin-jwt-token>
```

### Menu Management

#### Get All Menu Items (Public)
```
GET /menus
```

#### Get Menu Item by ID (Public)
```
GET /menus/:id
```

#### Get Menu Items by Restaurant (Public)
```
GET /menus/restaurant/:restaurantId
```

#### Create Menu Item (Admin Only)
```
POST /menus
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "restaurant_id": "restaurant-object-id", // Required: Valid MongoDB ObjectId
  "name": "Menu Item Name",                // Required: 2-100 characters
  "description": "Item description",       // Required: 10-500 characters
  "price": 12.99,                         // Required: Positive number, max 2 decimals
  "category": "appetizer"                 // Required: Valid category enum
}

Valid categories: appetizer, main course, dessert, beverage, snack, salad, soup, pasta, pizza, burger, sandwich, seafood, vegetarian, vegan, other
```

#### Update Menu Item (Admin Only)
```
PUT /menus/:id                           // ID must be valid MongoDB ObjectId
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "restaurant_id": "restaurant-object-id", // Optional: Valid MongoDB ObjectId
  "name": "Updated Name",                  // Optional: 2-100 characters
  "description": "Updated description",    // Optional: 10-500 characters
  "price": 15.99,                         // Optional: Positive number, max 2 decimals
  "category": "main course"               // Optional: Valid category enum
}
```

#### Delete Menu Item (Admin Only)
```
DELETE /menus/:id
Authorization: Bearer <admin-jwt-token>
```

## Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt with 10 salt rounds
2. **JWT Authentication**: Stateless authentication with 24-hour token expiration
3. **Role-Based Access Control**: Admin and user roles with different permissions
4. **Resource Authorization**: Users can only access/modify their own resources
5. **Password Exclusion**: Passwords are never returned in API responses
6. **Input Validation**: Comprehensive validation prevents malicious input and data corruption
7. **MongoDB ObjectId Validation**: Prevents invalid database queries and injection attempts

## Validation Rules

### User Validation
- **Email**: Must be valid email format
- **Username**: 3-30 characters, alphanumeric and underscores only
- **Password**: 6-50 characters
- **Role**: Must be "user" or "admin"

### Restaurant Validation
- **Name**: 2-100 characters
- **Address**: 10-200 characters
- **Phone**: Valid international phone number format
- **Opening Hours**: 5-50 characters

### Menu Item Validation
- **Name**: 2-100 characters
- **Description**: 10-500 characters
- **Price**: Positive number with maximum 2 decimal places
- **Category**: Must be one of the predefined categories
- **Restaurant ID**: Valid MongoDB ObjectId

### Common Validation
- **MongoDB ObjectIds**: 24-character hexadecimal format
- **Pagination**: Page ≥ 1, Limit 1-100
- **Sorting**: Valid sort fields and order (asc/desc)

## Error Responses

### 400 Bad Request (Validation Error)
```json
{
  "error": "Validation failed",
  "details": [
    "Username must be at least 3 characters long",
    "Price must be a positive number"
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Token required"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied. You can only access your own resources."
}
```

### 404 Not Found
```json
{
  "error": "User not found"
}
```

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env`:
   ```
   JWT_SECRET=your-super-secret-jwt-key
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Database

- MongoDB connection: `mongodb://127.0.0.1:27017/foodexpress`
- Collections: `users`, `restaurants`, `menuitems`