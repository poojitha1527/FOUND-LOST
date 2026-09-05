const express = require('express');
const mongoose = require('mongoose');
let MongoMemoryServer;
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// CORS
app.use(cors({
  origin: (requestOrigin, callback) => {
    if (!requestOrigin || corsOrigins.includes(requestOrigin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`Origin not allowed by CORS: ${requestOrigin}`));
  },
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Static files
app.use('/public', express.static('public'));

// Database connection with in-memory fallback for development
async function connectDatabase() {
  const envUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-lost-found';

  // Use an in-memory MongoDB when running in development and local MongoDB is not available
  const useMemory = (process.env.NODE_ENV === 'development') && /localhost|127\.0\.0\.1/.test(envUri);

  try {
    if (useMemory) {
      // lazy-load to avoid adding this dependency in production
      MongoMemoryServer = MongoMemoryServer || require('mongodb-memory-server').MongoMemoryServer;
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log('MongoDB connected (in-memory)');
      // keep reference so process doesn't exit while mongod runs
      process._mongod = mongod;
    } else {
      await mongoose.connect(envUri);
      console.log('MongoDB connected');
    }
  } catch (err) {
    console.error('MongoDB connection error:', err);
    // If initial attempt failed and we are in development, try in-memory as a fallback
    if (!useMemory && process.env.NODE_ENV === 'development') {
      try {
        MongoMemoryServer = MongoMemoryServer || require('mongodb-memory-server').MongoMemoryServer;
        const mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        await mongoose.connect(uri);
        console.log('MongoDB connected (in-memory fallback)');
        process._mongod = mongod;
      } catch (err2) {
        console.error('In-memory MongoDB fallback failed:', err2);
      }
    }
  }
}

// Routes
app.use('/api/items', require('./routes/items'));
app.use('/api/users', require('./routes/users'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start the app after DB connection is established (or in-memory started)
async function startApp() {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`Campus Lost & Found API running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Allowed frontend origins: ${corsOrigins.join(', ')}`);
  });
}

startApp().catch(err => {
  console.error('Failed to start application:', err);
});
