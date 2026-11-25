const express = require('express');
const multer = require('multer');
const env = require('../config/env');
const {
  getProducts,
  getProductBySlugOrId,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/product.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');
const { validateBody } = require('../middlewares/validate.middleware');
const { createProductSchema, updateProductSchema } = require('../validators/product.validator');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.UPLOAD_MAX_FILE_SIZE_MB * 1024 * 1024,
  },
});

const optionalImageUpload = (req, res, next) => {
  const contentType = String(req.headers['content-type'] || '');
  if (contentType.includes('multipart/form-data')) {
    return upload.single('image')(req, res, next);
  }
  return next();
};

router.get('/', getProducts);
router.get('/:slug', getProductBySlugOrId);
router.post(
  '/',
  verifyToken,
  requireRole('admin'),
  optionalImageUpload,
  validateBody(createProductSchema),
  createProduct
);
router.put(
  '/:id',
  verifyToken,
  requireRole('admin'),
  optionalImageUpload,
  validateBody(updateProductSchema),
  updateProduct
);
router.delete('/:id', verifyToken, requireRole('admin'), deleteProduct);

module.exports = router;
