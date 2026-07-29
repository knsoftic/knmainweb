const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/upload
router.post('/upload', authMiddleware, mediaController.uploadMiddleware, mediaController.uploadFile);

module.exports = router;
