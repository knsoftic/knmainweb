const express = require('express');
const router = express.Router();
const homepageCoursesController = require('../controllers/homepageCoursesController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', homepageCoursesController.getFeaturedCourses);
router.put('/', authMiddleware, homepageCoursesController.updateFeaturedCourses);

module.exports = router;
