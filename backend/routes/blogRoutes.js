const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const blogController = require('../controllers/blogController');

// Public routes
router.get('/', blogController.getAll);
router.get('/:slug', blogController.getBySlug);

// Admin routes
router.post('/', authMiddleware, blogController.create);
router.put('/:id', authMiddleware, blogController.update);
router.delete('/:id', authMiddleware, blogController.delete);
router.post('/:id/duplicate', authMiddleware, blogController.duplicate);

module.exports = router;
