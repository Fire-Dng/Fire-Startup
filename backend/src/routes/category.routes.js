const express = require('express');
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/category.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');
const { validateBody } = require('../middlewares/validate.middleware');
const { createCategorySchema, updateCategorySchema } = require('../validators/category.validator');

const router = express.Router();

router.get('/', getCategories);
router.post(
  '/',
  verifyToken,
  requireRole('admin', 'staff'),
  validateBody(createCategorySchema),
  createCategory
);
router.put(
  '/:id',
  verifyToken,
  requireRole('admin', 'staff'),
  validateBody(updateCategorySchema),
  updateCategory
);
router.delete('/:id', verifyToken, requireRole('admin'), deleteCategory);

module.exports = router;
