const Order = require('../../models/Order');
const { getMessage } = require('../../i18n/messages');
const AppError = require('../../utils/AppError');
const { rollbackOrderInventory } = require('./inventory');

const ALLOWED_STATUS_TRANSITIONS = {
  pending: ['confirmed', 'in_crafting', 'cancelled'],
  confirmed: ['in_crafting', 'cancelled'],
  in_crafting: ['quality_check'],
  quality_check: ['shipping', 'in_crafting'],
  shipping: ['delivered'],
  delivered: [],
  cancelled: [],
};

const NON_CANCELLABLE_STATUSES = ['in_crafting', 'quality_check', 'shipping', 'delivered'];

const updateOrderStatus = async ({
  orderIdOrCode,
  nextStatus,
  note = '',
  actorName = 'System',
  isCustomerCancel = false,
  phone = '',
  lang = 'vi',
}) => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(orderIdOrCode);
  const query = isObjectId
    ? { $or: [{ _id: orderIdOrCode }, { orderCode: orderIdOrCode.toUpperCase() }] }
    : { orderCode: orderIdOrCode.toUpperCase() };

  const order = await Order.findOne(query);
  if (!order) {
    throw new AppError(getMessage('ORDER_NOT_FOUND', {}, lang), 404, 'ORDER_NOT_FOUND');
  }

  if (isCustomerCancel && phone) {
    const cleanInputPhone = String(phone).trim();
    if (cleanInputPhone && order.customerInfo.phone !== cleanInputPhone) {
      throw new AppError(getMessage('PHONE_MISMATCH', {}, lang), 403, 'PHONE_MISMATCH');
    }
  }

  const currentStatus = order.status;
  if (currentStatus === nextStatus) {
    return order.toObject();
  }

  if (nextStatus === 'cancelled') {
    if (NON_CANCELLABLE_STATUSES.includes(currentStatus)) {
      throw new AppError(
        getMessage('CANNOT_CANCEL_IN_CRAFTING', { status: currentStatus }, lang),
        400,
        'CANNOT_CANCEL_IN_CRAFTING'
      );
    }
    if (currentStatus === 'cancelled') {
      throw new AppError(getMessage('ALREADY_CANCELLED', {}, lang), 400, 'ALREADY_CANCELLED');
    }
  } else {
    const allowedNext = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
    if (!allowedNext.includes(nextStatus)) {
      throw new AppError(
        getMessage(
          'INVALID_STATUS_TRANSITION',
          {
            current: currentStatus,
            next: nextStatus,
            allowed: allowedNext.join(', ') || 'none',
          },
          lang
        ),
        400,
        'INVALID_STATUS_TRANSITION'
      );
    }
  }

  if (nextStatus === 'cancelled' && (currentStatus === 'pending' || currentStatus === 'confirmed')) {
    await rollbackOrderInventory(order);
    order.inventoryDeducted = false;
    order.cancelReason = note || 'Khách hàng / Quản trị viên yêu cầu hủy đơn';
  }

  order.status = nextStatus;
  if (nextStatus === 'delivered' && order.paymentMethod === 'cod') {
    order.paymentStatus = 'paid';
  }

  order.statusHistory.push({
    status: nextStatus,
    note: note || `Cập nhật trạng thái sang ${nextStatus}`,
    updatedBy: actorName,
    updatedAt: new Date(),
  });

  await order.save();
  return order.toObject();
};

const updateOrderPaymentStatus = async ({
  orderId,
  paymentStatus,
  note = '',
  actorName = 'Admin',
  lang = 'vi',
}) => {
  if (!['unpaid', 'paid', 'refunded'].includes(paymentStatus)) {
    throw new AppError(getMessage('INVALID_PAYMENT_STATUS', {}, lang), 400, 'INVALID_PAYMENT_STATUS');
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError(getMessage('ORDER_NOT_FOUND', {}, lang), 404, 'ORDER_NOT_FOUND');
  }

  order.paymentStatus = paymentStatus;
  order.statusHistory.push({
    status: order.status,
    note: note || `Cập nhật trạng thái thanh toán: ${paymentStatus}`,
    updatedBy: actorName,
    updatedAt: new Date(),
  });

  await order.save();
  return order.toObject();
};

const lookupOrderByCode = async (orderCode, phone = '', lang = 'vi') => {
  const cleanCode = String(orderCode || '').trim().toUpperCase();
  const order = await Order.findOne({ orderCode: cleanCode }).lean();
  if (!order) {
    throw new AppError(getMessage('ORDER_NOT_FOUND', {}, lang), 404, 'ORDER_NOT_FOUND');
  }

  if (phone && String(phone).trim() !== '') {
    if (order.customerInfo.phone !== String(phone).trim()) {
      throw new AppError(getMessage('PHONE_MISMATCH', {}, lang), 403, 'PHONE_MISMATCH');
    }
  }

  return order;
};

module.exports = {
  ALLOWED_STATUS_TRANSITIONS,
  NON_CANCELLABLE_STATUSES,
  updateOrderStatus,
  updateOrderPaymentStatus,
  lookupOrderByCode,
};
