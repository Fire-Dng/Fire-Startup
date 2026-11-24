const express = require('express');
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/category.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', getCategories);
router.post('/', verifyToken, requireRole('admin', 'staff'), createCategory);
router.put('/:id', verifyToken, requireRole('admin', 'staff'), updateCategory);
router.delete('/:id', verifyToken, requireRole('admin'), deleteCategory);

module.exports = router;
