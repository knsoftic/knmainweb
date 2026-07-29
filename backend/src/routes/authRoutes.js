const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');

const authMiddleware = require('../middleware/authMiddleware');

router.post('/login', controller.login);
router.post('/logout', controller.logout);
router.get('/me', controller.me);
router.post('/refresh', controller.refresh);
router.put('/change-password', authMiddleware, controller.changePassword);

module.exports = router;
