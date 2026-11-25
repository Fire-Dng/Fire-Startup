const express = require('express');
const {
  calculatePrice,
  saveCustomDesign,
  getCustomDesign,
} = require('../controllers/customDesign.controller');
const { optionalAuth } = require('../middlewares/auth.middleware');
const { validateBody } = require('../middlewares/validate.middleware');
const {
  calculatePriceSchema,
  saveCustomDesignSchema,
} = require('../validators/customDesign.validator');

const router = express.Router();

router.post('/calculate-price', validateBody(calculatePriceSchema), calculatePrice);
router.post('/', optionalAuth, validateBody(saveCustomDesignSchema), saveCustomDesign);
router.get('/:idOrShareCode', getCustomDesign);

module.exports = router;
