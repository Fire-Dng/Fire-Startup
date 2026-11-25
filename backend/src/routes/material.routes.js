const express = require('express');
const {
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} = require('../controllers/material.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');
const { validateBody } = require('../middlewares/validate.middleware');
const { createMaterialSchema, updateMaterialSchema } = require('../validators/material.validator');

const router = express.Router();

router.get('/', getMaterials);
router.post(
  '/',
  verifyToken,
  requireRole('admin', 'staff'),
  validateBody(createMaterialSchema),
  createMaterial
);
router.put(
  '/:id',
  verifyToken,
  requireRole('admin', 'staff'),
  validateBody(updateMaterialSchema),
  updateMaterial
);
router.delete('/:id', verifyToken, requireRole('admin', 'staff'), deleteMaterial);

module.exports = router;
