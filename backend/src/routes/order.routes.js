const express = require('express');
const {
  placeOrder,
  lookupOrder,
  cancelOrderByCustomer,
  getOrders,
  getOrderById,
  changeOrderStatus,
  changeOrderPayment,
} = require('../controllers/order.controller');
const { optionalAuth, verifyToken, requireRole } = require('../middlewares/auth.middleware');
const { validateBody } = require('../middlewares/validate.middleware');
const {
  placeOrderSchema,
  changeOrderStatusSchema,
  changeOrderPaymentSchema,
} = require('../validators/order.validator');

const router = express.Router();

// Public, Customer & CMS routes
router.post('/', optionalAuth, validateBody(placeOrderSchema), placeOrder);
router.get('/lookup/:orderCode', lookupOrder);
router.post('/:orderCode/cancel', optionalAuth, cancelOrderByCustomer);

// CMS Staff/Admin routes (PATCH /:id/status also supports Customer cancel when status === 'cancelled' per BR-05)
router.get('/', verifyToken, requireRole('admin', 'staff'), getOrders);
router.get('/:id', optionalAuth, getOrderById);
router.patch('/:id/status', optionalAuth, validateBody(changeOrderStatusSchema), changeOrderStatus);
router.patch(
  '/:id/payment',
  verifyToken,
  requireRole('admin', 'staff'),
  validateBody(changeOrderPaymentSchema),
  changeOrderPayment
);

module.exports = router;
