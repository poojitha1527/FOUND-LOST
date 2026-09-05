# Campus Lost & Found - Setup Guide

## 🚀 Quick Start (5 minutes)

### Step 1: Install Backend
```bash
cd backend
npm install
```

### Step 2: Setup Database
You have two options:

**Option A: Local MongoDB**
- Install MongoDB locally: https://docs.mongodb.com/manual/installation/
- Start MongoDB: `mongod`
- Keep it running in the background

**Option B: MongoDB Atlas (Cloud)**
- Create account: https://www.mongodb.com/cloud/atlas
- Create free cluster
- Get connection string
- Add to `.env`: `MONGODB_URI=<your-connection-string>`

### Step 3: Configure Environment
```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campus-lost-found
NODE_ENV=development
JWT_SECRET=my-secret-key-change-this
CORS_ORIGIN=http://localhost:8080
```

### Step 4: Load Sample Data
```bash
npm run seed
```

### Step 5: Start Backend
```bash
npm run dev
```
Check: http://localhost:5000/api/health

### Step 6: Start Frontend
```bash
cd ../frontend
npx http-server
```
Visit: http://localhost:8080

## 🎯 Testing the App

1. **View Items:** Scroll through the board
2. **Post Item:** Click "Report Lost Item" or "I Found Something"
3. **Register:** Click "Register" button (top right)
4. **Login:** Use registered credentials
5. **Search:** Use search box to find items
6. **Filter:** Use category and status chips
7. **View Details:** Click any item card
8. **Reveal Contact:** Click "Reveal contact info"
9. **Mark Resolved:** Click "Mark as reunited"

## 🛠️ Development Commands

### Backend
```bash
cd backend

npm start              # Start server (production)
npm run dev           # Start with live reload
npm run seed          # Seed sample data
```

### Frontend
```bash
cd frontend
npx http-server       # Serve files
npx http-server -p 3000  # Custom port
```

## 📁 File Structure Overview

```
backend/
├── server.js          → Main Express app
├── models/            → Database schemas
├── controllers/       → API logic
├── routes/            → API endpoints
├── middleware/        → Auth, validation
└── utils/             → Helper functions

frontend/
├── index.html         → Main page
├── app.js             → Frontend logic
└── public/            → Assets
```

## 🔑 Key API Endpoints

```
GET    /api/items                    → Get all items
POST   /api/items                    → Create item
GET    /api/items/:id                → Get item details
PATCH  /api/items/:id                → Update item
POST   /api/items/:id/resolve        → Mark resolved

POST   /api/users/register           → Register
POST   /api/users/login              → Login
GET    /api/users/me                 → Get current user
```

## 🐛 Common Issues

### "Cannot connect to MongoDB"
- Check MongoDB is running: `mongod` in terminal
- Check connection string in .env
- If using MongoDB Atlas, ensure IP is whitelisted

### "CORS error"
- Check CORS_ORIGIN matches your frontend URL
- If frontend is on 3000, set: `CORS_ORIGIN=http://localhost:3000`

### "Port already in use"
- Change PORT in .env to 5001, 5002, etc.
- Or kill process: `lsof -ti:5000 | xargs kill -9`

### "Image upload fails"
- Check file size (max 5MB)
- Ensure file is an image (jpg, png, gif, webp)

### "API requests returning 401"
- User needs to login first
- Auth token is stored in localStorage

## 📦 Dependencies

**Backend:**
- express: Web framework
- mongoose: MongoDB ORM
- dotenv: Environment variables
- cors: Cross-origin requests
- jwt: Authentication
- bcryptjs: Password hashing
- multer: File uploads
- helmet: Security headers
- express-rate-limit: Rate limiting

**Frontend:**
- None! (Pure vanilla JavaScript)

## 🔐 Security Notes

- Passwords are hashed with bcryptjs
- JWTs expire after 30 days
- CORS prevents unauthorized access
- Rate limiting: 100 req/15min per IP
- XSS protection with HTML escaping
- Helmet sets security headers
- Environment variables for secrets

## 📱 Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- IE11: Not supported

## 🚀 Production Deployment

### Backend (Example: Heroku)
```bash
cd backend
heroku login
heroku create your-app
git push heroku main
heroku config:set MONGODB_URI=<your-uri>
```

### Frontend (Example: Netlify)
```bash
cd frontend
netlify deploy --prod
# Update API_URL in app.js to production backend
```

## 📚 Next Steps

1. ✅ Run locally & test
2. ✅ Customize colors in CSS
3. ✅ Add more item categories
4. ✅ Send to MongoDB Atlas
5. ✅ Deploy backend & frontend
6. ✅ Add email notifications
7. ✅ Add admin dashboard

## 💡 Pro Tips

- Polling interval: Edit `setInterval(()=>syncFromServer(), 5000)` in app.js
- Max file size: Edit `MAX_FILE_SIZE` in .env
- API timeout: Add in app.js as needed
- Database indexes automatically created
- Images auto-compressed on upload
- Soft deletes with status field

## ❓ Need Help?

- Check server logs: terminal where `npm run dev` runs
- Check browser console: F12 → Console tab
- API health: http://localhost:5000/api/health
- Database: Check MongoDB/Compass for collections

## 📝 Notes

- Sample data includes 6 items across categories
- Users can upload photos (auto-compressed)
- Items cycle through status: open → resolved
- Real-time updates every 5 seconds
- Search is case-insensitive
- Photo URLs are base64 encoded

---

🎉 You're all set! Happy coding!
