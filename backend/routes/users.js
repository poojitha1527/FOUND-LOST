const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { authenticate } = require('../middleware/auth');

// Register
router.post('/register', usersController.register);

// Login
router.post('/login', usersController.login);

// Get current user
router.get('/me', authenticate, usersController.getCurrentUser);

// Get user profile
router.get('/:id', usersController.getUserProfile);

// Update user profile
router.patch('/:id', authenticate, usersController.updateProfile);

module.exports = router;
