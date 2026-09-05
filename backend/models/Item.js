const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    index: true,
    default: () => 'it_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7)
  },
  type: {
    type: String,
    enum: ['lost', 'found'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  category: {
    type: String,
    enum: ['electronics', 'bag', 'id', 'keys', 'clothing', 'books', 'bottle', 'other'],
    default: 'other'
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  photo: {
    type: String,
    default: null
  },
  photoUrl: {
    type: String,
    default: null
  },
  contact: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'resolved', 'deleted'],
    default: 'open'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  userEmail: {
    type: String,
    default: null
  },
  claims: [{
    timestamp: Date,
    message: String,
    contact: String
  }],
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for common queries
itemSchema.index({ type: 1, status: 1, createdAt: -1 });
itemSchema.index({ category: 1, status: 1 });
itemSchema.index({ title: 'text', description: 'text', location: 'text' });

// Update timestamp on save
itemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Item', itemSchema);
