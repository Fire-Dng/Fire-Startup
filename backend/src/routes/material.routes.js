const express = require('express');
const {
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} = require('../controllers/material.controller');
const { optionalAuth, verifyToken, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', getMaterials);
router.post('/', verifyToken, requireRole('admin', 'staff'), createMaterial);
router.put('/:id', verifyToken, requireRole('admin', 'staff'), updateMaterial);
router.delete('/:id', verifyToken, requireRole('admin', 'staff'), deleteMaterial);

module.exports = router;
