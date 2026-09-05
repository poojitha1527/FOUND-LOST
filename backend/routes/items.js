const express = require('express');
const router = express.Router();
const itemsController = require('../controllers/itemsController');
const { authenticateOptional } = require('../middleware/auth');
const multer = require('multer');

// Configure multer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: process.env.MAX_FILE_SIZE || 5242880 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  }
});

// GET stats (dashboard) - MUST come before /:id route
router.get('/stats/overview', itemsController.getStats);

// GET all items with filters
router.get('/', itemsController.getItems);

// GET item by ID
router.get('/:id', itemsController.getItemById);

// POST new item
router.post('/', upload.single('photo'), itemsController.createItem);

// PATCH/UPDATE item
router.patch('/:id', authenticateOptional, itemsController.updateItem);

// POST mark as resolved
router.post('/:id/resolve', authenticateOptional, itemsController.markResolved);

// POST add a claim
router.post('/:id/claim', itemsController.addClaim);

module.exports = router;
