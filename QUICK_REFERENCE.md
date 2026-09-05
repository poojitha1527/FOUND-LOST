# Campus Lost & Found - Quick Reference

## 📋 Project Summary

A full-stack **Lost & Found** application for campuses with:
- ✅ **Frontend:** Beautiful vanilla JS interface
- ✅ **Backend:** Express.js REST API
- ✅ **Database:** MongoDB with Mongoose ORM
- ✅ **Auth:** JWT-based user authentication
- ✅ **Images:** Auto-compressed photo uploads
- ✅ **Real-time:** Live updates every 5 seconds

---

## 📁 File Structure

```
campus-lost-found/
│
├── backend/
│   ├── server.js                 (Express app)
│   ├── package.json              (Dependencies)
│   ├── .env.example              (Config template)
│   │
│   ├── models/
│   │   ├── Item.js               (Lost/found item schema)
│   │   └── User.js               (User schema)
│   │
│   ├── controllers/
│   │   ├── itemsController.js    (Item business logic)
│   │   └── usersController.js    (User business logic)
│   │
│   ├── routes/
│   │   ├── items.js              (Item endpoints)
│   │   └── users.js              (User endpoints)
│   │
│   ├── middleware/
│   │   └── auth.js               (JWT authentication)
│   │
│   ├── utils/
│   │   └── imageProcessor.js     (Image compression)
│   │
│   └── scripts/
│       └── seed.js               (Sample data loader)
│
├── frontend/
│   ├── index.html                (Main UI)
│   └── app.js                    (Frontend logic)
│
├── README.md                     (Full documentation)
├── SETUP_GUIDE.md                (Getting started)
├── API_DOCS.md                   (Detailed API reference)
└── .gitignore                    (Git ignore patterns)
```

---

## 🚀 Quick Start

### 1. Install & Setup Backend
```bash
cd backend
npm install
cp .env.example .env
npm run seed        # Load sample data
npm run dev         # Start server
```

### 2. Start Frontend
```bash
cd frontend
npx http-server
```

### 3. Visit Application
```
http://localhost:8080
```

---

## 🎯 Key Features

### Users
- ✅ Register with email/password
- ✅ Login & persistent sessions
- ✅ Profile viewing
- ✅ Item tracking

### Items
- ✅ Post lost or found items
- ✅ Add photos (auto-compressed)
- ✅ Categorize by type
- ✅ Search & filter
- ✅ Mark as resolved
- ✅ Real-time updates
- ✅ Contact sharing

### Security
- ✅ Password hashing (bcryptjs)
- ✅ JWT tokens
- ✅ CORS enabled
- ✅ Rate limiting
- ✅ XSS protection
- ✅ Helmet security headers

---

## 📊 API Summary

### Items
```
GET    /api/items              → List items
POST   /api/items              → Create item
GET    /api/items/:id          → Get details
PATCH  /api/items/:id          → Update item
POST   /api/items/:id/resolve  → Mark resolved
GET    /api/items/stats/overview → Get stats
```

### Users
```
POST   /api/users/register     → New account
POST   /api/users/login        → Login
GET    /api/users/me           → Current user
GET    /api/users/:id          → Profile
PATCH  /api/users/:id          → Update profile
```

---

## 🔧 Configuration

### .env Variables
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campus-lost-found
JWT_SECRET=your_secret_key
CORS_ORIGIN=http://localhost:8080
MAX_FILE_SIZE=5242880
```

### Frontend API URL
Edit `frontend/app.js`:
```javascript
const API_URL = 'http://localhost:5000/api';
```

---

## 📱 Categories

Items can be categorized as:
- Electronics
- Bags & Accessories
- ID / Cards
- Keys
- Clothing
- Books & Stationery
- Water Bottles
- Other

---

## 🔐 Authentication Flow

```
1. User registers → Email + password stored (hashed)
2. User logs in → Receives JWT token
3. Token stored in localStorage
4. Included in API requests as Bearer token
5. Server verifies token
6. User can post items & view profile
```

---

## 📈 Database Schema

### Items Collection
```javascript
{
  id: String,           // Unique ticket ID
  type: "lost|found",   // Type
  title: String,        // Name
  description: String,  // Details
  category: String,     // Category
  location: String,     // Location
  date: Date,           // When lost/found
  photo: String,        // Base64 image
  contact: String,      // Email/phone
  status: String,       // open/resolved
  views: Number,        // View count
  createdAt: Date       // Posted at
}
```

### Users Collection
```javascript
{
  name: String,         // Full name
  email: String,        // Unique email
  password: String,     // Hashed
  phone: String,        // Phone number
  isAdmin: Boolean,     // Admin flag
  itemsPosted: Number,  // Total posts
  itemsResolved: Number,// Resolved count
  createdAt: Date       // Account created
}
```

---

## 🎨 Color Palette

```css
--board: #16241c          /* Dark green background */
--kraft: #efe3c8          /* Light kraft paper */
--lost: #b23a2e           /* Red (lost items) */
--found: #2f6e4e          /* Green (found items) */
--resolved: #7a7266       /* Gray (resolved) */
--accent: #e3a73b         /* Yellow/gold accent */
--ink: #2a2117            /* Dark ink text */
```

---

## 🧪 Testing

### Manual Testing
1. Open app → empty board
2. Click "I Found Something"
3. Fill form → Post notice
4. Refresh page → See item appear
5. Click item card → View details
6. Click "Mark as reunited" → Update status

### Sample Data
Pre-loaded with 6 items:
- Lost headphones
- Found water bottle
- Lost ID card
- Found keys
- Lost textbook
- Found backpack

Load with: `npm run seed`

---

## 📦 Dependencies

**Backend (11 packages):**
- express, mongoose, dotenv, cors
- multer, jsonwebtoken, bcryptjs
- validator, helmet, express-rate-limit
- compress-images

**Frontend (0 packages):**
- Pure vanilla JavaScript!

---

## 🚀 Deployment

### Backend (Heroku)
```bash
heroku create app-name
heroku config:set MONGODB_URI=<atlas-uri>
git push heroku main
```

### Frontend (Netlify/Vercel)
```bash
vercel deploy frontend
# Update API_URL to production backend
```

---

## 🔄 Polling vs WebSocket

**Current:** HTTP polling every 5 seconds
- ✅ Simple, works everywhere
- ✅ No server overhead
- ❌ Slight delay

**Future:** WebSocket real-time
- ✅ Instant updates
- ✅ Bi-directional
- ❌ More complex

---

## 💾 Data Storage

### Database
- MongoDB documents
- Automatic timestamp fields
- Text indexes for search
- Compound indexes for queries

### Images
- Base64 encoded in database
- Auto-compressed (JPEG 62% quality)
- Max 5MB file size
- Stored with items (no CDN required)

---

## 🔍 Search

Full-text search across:
- Item title
- Description
- Location

Example: Search "black" finds all items with "black" keyword

---

## ⚙️ Performance

- **Pagination:** 20 items per request
- **Polling:** 5 sec interval (adjustable)
- **Image compression:** 70% quality
- **Database indexes:** Optimized queries
- **CORS:** Enabled for frontend
- **Rate limiting:** 100 req/15min

---

## 📞 Support

**Issues?**
1. Check SETUP_GUIDE.md
2. Review API_DOCS.md
3. Check server logs
4. Check browser console (F12)
5. Verify MongoDB running

**Common fixes:**
```bash
# Restart MongoDB
mongod

# Clear & reload data
npm run seed

# Restart server
npm run dev

# Clear browser cache
Ctrl+Shift+Delete
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| README.md | Full project documentation |
| SETUP_GUIDE.md | Step-by-step setup instructions |
| API_DOCS.md | Detailed API reference |
| QUICK_REFERENCE.md | This file |

---

## ✅ What's Included

- ✅ Complete backend API
- ✅ Beautiful responsive frontend
- ✅ User authentication
- ✅ Image upload & compression
- ✅ Real-time updates
- ✅ Search & filtering
- ✅ Database models
- ✅ Error handling
- ✅ Security features
- ✅ Sample data
- ✅ Full documentation

---

## 🎓 Learning Resources

**Technologies Used:**
- Node.js: Backend runtime
- Express: Web framework
- MongoDB: NoSQL database
- Mongoose: ODM
- JWT: Authentication
- Vanilla JS: Frontend

**Next Steps:**
1. ✅ Run locally
2. ✅ Test all features
3. ✅ Customize styling
4. ✅ Deploy to cloud
5. ✅ Add more features

---

## 🎉 You're Ready!

Everything is set up and ready to use. Start with `SETUP_GUIDE.md` if you haven't already!

```bash
cd backend && npm install && npm run dev
# In another terminal:
cd frontend && npx http-server
```

Visit: `http://localhost:8080` 🚀

---

**Last Updated:** January 15, 2024
**Version:** 1.0.0
**License:** MIT
