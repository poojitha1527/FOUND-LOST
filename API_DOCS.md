# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Include token in Authorization header:
```
Authorization: Bearer <token>
```

---

## Items Endpoints

### GET /items
Retrieve all items with optional filtering.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| status | string | 'open' | 'open', 'resolved', 'all' |
| category | string | 'all' | Item category |
| type | string | 'all' | 'lost', 'found', 'all' |
| search | string | - | Full-text search |
| limit | number | 20 | Items per page |
| skip | number | 0 | Pagination offset |
| sort | string | '-createdAt' | Sort field with +/- |

**Example Request:**
```bash
GET /items?status=open&category=electronics&limit=10&sort=-views
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "it_abc123_xyz",
      "type": "lost",
      "title": "Black Sony Headphones",
      "description": "Over-ear headphones",
      "category": "electronics",
      "location": "Library",
      "date": "2024-01-10",
      "photo": "data:image/jpeg;base64,...",
      "contact": "user@campus.edu",
      "status": "open",
      "views": 5,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 42,
    "limit": 10,
    "skip": 0,
    "pages": 5
  }
}
```

---

### POST /items
Create a new lost or found item.

**Required Fields:**
- `type` (string): 'lost' or 'found'
- `title` (string): Item name (max 100 chars)
- `contact` (string): Email or phone number

**Optional Fields:**
- `description` (string): Detailed description (max 1000 chars)
- `category` (string): Item category
- `location` (string): Where lost/found
- `date` (date): When lost/found (ISO format)
- `photo` (string): Base64 encoded image

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "type": "lost",
    "title": "Black Sony Headphones",
    "description": "Over-ear, blue accents",
    "category": "electronics",
    "location": "Library, 2nd floor",
    "date": "2024-01-10",
    "contact": "user@campus.edu",
    "photo": "data:image/jpeg;base64,..."
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Item posted successfully",
  "data": {
    "id": "it_abc123_xyz",
    "type": "lost",
    "title": "Black Sony Headphones",
    ...
  }
}
```

**Status Code:** 201 Created

---

### GET /items/:id
Retrieve a specific item by ID.

**Parameters:**
- `id` (string): Item ID (path parameter)

**Example Request:**
```bash
GET /items/it_abc123_xyz
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "it_abc123_xyz",
    "type": "lost",
    ...
  }
}
```

**Note:** This endpoint increments the `views` count.

**Status Code:** 200 OK, 404 Not Found

---

### PATCH /items/:id
Update an existing item.

**Parameters:**
- `id` (string): Item ID (path parameter)

**Allowed Fields:**
- `title`, `description`, `location`, `category`, `date`, `contact`, `status`

**Cannot Update:**
- `id`, `type`, `createdAt` (immutable)

**Example Request:**
```bash
curl -X PATCH http://localhost:5000/api/items/it_abc123_xyz \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description",
    "status": "resolved"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "it_abc123_xyz",
    ...
  }
}
```

**Status Code:** 200 OK, 404 Not Found

---

### POST /items/:id/resolve
Mark an item as resolved/reunited.

**Parameters:**
- `id` (string): Item ID (path parameter)

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/items/it_abc123_xyz/resolve
```

**Response:**
```json
{
  "success": true,
  "message": "Item marked as resolved",
  "data": {
    "id": "it_abc123_xyz",
    "status": "resolved",
    ...
  }
}
```

**Status Code:** 200 OK

---

### POST /items/:id/claim
Add a claim/message to an item.

**Parameters:**
- `id` (string): Item ID (path parameter)

**Request Body:**
```json
{
  "contact": "claimer@campus.edu",
  "message": "I think this is mine, can you describe..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Claim added",
  "data": {
    "id": "it_abc123_xyz",
    "claims": [
      {
        "timestamp": "2024-01-15T11:00:00Z",
        "message": "I think this is mine...",
        "contact": "claimer@campus.edu"
      }
    ]
  }
}
```

**Status Code:** 200 OK

---

### GET /items/stats/overview
Get statistics about the board.

**Example Request:**
```bash
GET /items/stats/overview
```

**Response:**
```json
{
  "success": true,
  "data": {
    "lostOpen": 15,
    "foundOpen": 12,
    "resolved": 8,
    "total": 35
  }
}
```

**Status Code:** 200 OK

---

## Users Endpoints

### POST /users/register
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@campus.edu",
  "password": "securePassword123",
  "phone": "555-1234"
}
```

**Validation:**
- `name`: Required, string
- `email`: Required, unique, valid email format
- `password`: Required, minimum 6 characters
- `phone`: Optional

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@campus.edu",
    "phone": "555-1234",
    "isAdmin": false,
    "itemsPosted": 0,
    "itemsResolved": 0,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Status Code:** 201 Created
**Error Codes:** 400 Bad Request, 409 Conflict (email exists)

---

### POST /users/login
Authenticate a user.

**Request Body:**
```json
{
  "email": "john@campus.edu",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@campus.edu",
    "isAdmin": false,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Status Code:** 200 OK
**Error Codes:** 401 Unauthorized (invalid credentials)

---

### GET /users/me
Get current logged-in user profile. **Requires authentication.**

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@campus.edu",
    "phone": "555-1234",
    "isAdmin": false,
    "itemsPosted": 5,
    "itemsResolved": 2,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Status Code:** 200 OK
**Error Codes:** 401 Unauthorized (missing/invalid token)

---

### GET /users/:id
Get public user profile.

**Parameters:**
- `id` (string): User MongoDB ID

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "avatar": "...",
    "itemsPosted": 5,
    "itemsResolved": 2,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Note:** Email is hidden for privacy

**Status Code:** 200 OK, 404 Not Found

---

### PATCH /users/:id
Update user profile. **Requires authentication.**

**Parameters:**
- `id` (string): User MongoDB ID (must match current user)

**Allowed Fields:**
- `name`, `phone`, `avatar`

**Cannot Update:**
- `email`, `password`, `isAdmin` (use separate endpoints)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Jane Doe",
  "phone": "555-5678",
  "avatar": "data:image/jpeg;base64,..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Jane Doe",
    "phone": "555-5678",
    ...
  }
}
```

**Status Code:** 200 OK
**Error Codes:** 401 Unauthorized, 404 Not Found

---

## Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

**Common Status Codes:**
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Authentication required/failed
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `500 Internal Server Error`: Server error

---

## Rate Limiting

- **Limit:** 100 requests per 15 minutes
- **Per IP:** Tracked by IP address
- **Header:** `X-RateLimit-*` headers included in response

---

## Pagination Example

```bash
# Get 10 items, skip 20 (page 3)
GET /items?limit=10&skip=20

# Get next page
skip = (page - 1) * limit
```

---

## Full Example: Creating an Item with Photo

```javascript
// 1. Compress image
const canvas = document.createElement('canvas');
canvas.width = 400;
canvas.height = 300;
// ... draw image ...
const photoDataUrl = canvas.toDataURL('image/jpeg', 0.7);

// 2. Create item
const response = await fetch('http://localhost:5000/api/items', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'lost',
    title: 'Black Headphones',
    description: 'Sony over-ear headphones',
    category: 'electronics',
    location: 'Library',
    date: '2024-01-10',
    contact: 'user@campus.edu',
    photo: photoDataUrl
  })
});

const result = await response.json();
console.log(result);
```

---

## WebSocket Support (Planned)

Future updates will include WebSocket support for real-time updates instead of polling.

```javascript
// Planned: Not yet implemented
const ws = new WebSocket('ws://localhost:5000/items');
ws.onmessage = (event) => {
  const item = JSON.parse(event.data);
  // Handle new item
};
```

---

Generated: 2024-01-15
Last Updated: 2024-01-15
