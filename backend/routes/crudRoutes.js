const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @param {object} controller
 * @param {{ publicRead?: boolean }} [options] publicRead: false requires a login to list rows
 *   (for tables holding personal data, such as blog comments with email addresses).
 */
exports.createCRUDRouter = (controller, { publicRead = true } = {}) => {
  const router = express.Router();

  if (publicRead) {
    router.get('/', controller.getAll);
  } else {
    router.get('/', authMiddleware, controller.getAll);
  }
  router.post('/', authMiddleware, controller.create);
  router.put('/:id', authMiddleware, controller.update);
  router.delete('/:id', authMiddleware, controller.delete);

  return router;
};
