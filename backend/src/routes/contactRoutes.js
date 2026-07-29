const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const contactController = require('../controllers/contactController');

exports.createContactRouter = () => {
  const router = express.Router();

  router.post('/', contactController.createMessage);
  router.get('/', authMiddleware, contactController.getMessages);
  router.get('/:id', authMiddleware, contactController.getMessage);
  router.put('/:id', authMiddleware, contactController.updateMessage);
  router.delete('/:id', authMiddleware, contactController.deleteMessage);

  return router;
};