const Order = require('../../models/Order');
const { getMessage } = require('../../i18n/messages');
const AppError = require('../../utils/AppError');
const { createOrder } = require('./createOrder');
const {
  ALLOWED_STATUS_TRANSITIONS,
  updateOrderStatus,
  updateOrderPaymentStatus,
  lookupOrderByCode,
} = require('./orderStatus');

const listOrders = async ({ status, isCustom, search, page = 1, limit = 50 } = {}) => {
  const filter = {};
  if (status && status !== 'all') {
    filter.status = String(status);
  }
  if (isCustom === 'true') {
    filter['items.isCustom'] = true;
  }
  if (search && String(search).trim() !== '') {
    const regex = new RegExp(String(search).trim(), 'i');
    filter.$or = [
      { orderCode: regex },
      { 'customerInfo.fullName': regex },
      { 'customerInfo.phone': regex },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
  const skip = (pageNum - 1) * limitNum;

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
    Order.countDocuments(filter),
  ]);

  return {
    items: orders,
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
};

const getOrderByIdOrCode = async (idOrCode, lang = 'vi') => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrCode);
  const query = isObjectId
    ? { $or: [{ _id: idOrCode }, { orderCode: idOrCode.toUpperCase() }] }
    : { orderCode: idOrCode.toUpperCase() };

  const order = await Order.findOne(query).lean();
  if (!order) {
    throw new AppError(getMessage('ORDER_NOT_FOUND', {}, lang), 404, 'ORDER_NOT_FOUND');
  }
  return order;
};

module.exports = {
  ALLOWED_STATUS_TRANSITIONS,
  createOrder,
  updateOrderStatus,
  updateOrderPaymentStatus,
  lookupOrderByCode,
  listOrders,
  getOrderByIdOrCode,
};
