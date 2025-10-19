# Food Express API

A REST API for food delivery service with JWT authentication and role-based access control.

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

## API Endpoints

### User Management

#### Register User (Public)
```
POST /users
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password",
  "role": "user" // optional, defaults to "user"
}
```

#### Login User (Public)
```
POST /users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
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
PUT /users/:id
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "email": "newemail@example.com",
  "username": "newusername",
  "password": "newpassword", // optional
  "role": "admin" // only admin can change role
}
```

#### Delete User (User can only delete own account, Admin can delete any)
```
DELETE /users/:id
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
  "name": "Restaurant Name",
  "address": "123 Main St",
  "phone": "555-1234",
  "opening_hours": "9AM-10PM"
}
```

#### Update Restaurant (Admin Only)
```
PUT /restaurants/:id
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "name": "Updated Name",
  "address": "456 New St",
  "phone": "555-5678",
  "opening_hours": "8AM-11PM"
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
  "restaurant_id": "restaurant-object-id",
  "name": "Menu Item Name",
  "description": "Item description",
  "price": 12.99,
  "category": "appetizer"
}
```

#### Update Menu Item (Admin Only)
```
PUT /menus/:id
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "restaurant_id": "restaurant-object-id",
  "name": "Updated Name",
  "description": "Updated description",
  "price": 15.99,
  "category": "main course"
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

## Error Responses

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