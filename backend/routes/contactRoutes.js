const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const contactController = require('../controllers/contactController');

/**
 * @param {{ submitLimiter?: import('express').RequestHandler }} [options]
 *   submitLimiter throttles the public form only, so admin inbox actions don't use up its quota.
 */
exports.createContactRouter = ({ submitLimiter } = {}) => {
  const router = express.Router();

  if (submitLimiter) {
    router.post('/', submitLimiter, contactController.createMessage);
  } else {
    router.post('/', contactController.createMessage);
  }
  router.get('/', authMiddleware, contactController.getMessages);
  router.get('/:id', authMiddleware, contactController.getMessage);
  router.put('/:id', authMiddleware, contactController.updateMessage);
  router.delete('/:id', authMiddleware, contactController.deleteMessage);

  return router;
};
