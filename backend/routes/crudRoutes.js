const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');

exports.createCRUDRouter = (controller) => {
  const router = express.Router();
  
  router.get('/', controller.getAll);
  router.post('/', authMiddleware, controller.create);
  router.put('/:id', authMiddleware, controller.update);
  router.delete('/:id', authMiddleware, controller.delete);
  
  return router;
};
