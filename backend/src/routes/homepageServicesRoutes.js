const express = require('express');
const router = express.Router();
const homepageServicesController = require('../controllers/homepageServicesController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', homepageServicesController.getFeaturedServices);
router.put('/', authMiddleware, homepageServicesController.updateFeaturedServices);

module.exports = router;
