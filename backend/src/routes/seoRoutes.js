const express = require('express');
const router = express.Router();
const seoController = require('../controllers/seoController');
const authMiddleware = require('../middleware/authMiddleware');

// Public read routes
router.get('/global', seoController.getGlobalSeo);
router.get('/pages', seoController.getAllPagesSeo);
router.get('/pages/:slug', seoController.getPageSeo);
router.get('/sitemap-data', seoController.getSitemapData);

// Protected write routes
router.put('/global', authMiddleware, seoController.updateGlobalSeo);
router.put('/pages/:slug', authMiddleware, seoController.updatePageSeo);

module.exports = router;
