const {
  createOrder,
  updateOrderStatus,
  updateOrderPaymentStatus,
  lookupOrderByCode,
  listOrders,
  getOrderByIdOrCode,
} = require('../services/order.service');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { getMessage, resolveLang } = require('../i18n/messages');

const placeOrder = asyncHandler(async (req, res) => {
  const lang = resolveLang(req);
  const order = await createOrder(req.body, req.user, lang);
  return sendSuccess(res, {
    statusCode: 201,
    message: getMessage('PLACE_ORDER_SUCCESS', {}, req),
    data: order,
  });
});

const lookupOrder = asyncHandler(async (req, res) => {
  const lang = resolveLang(req);
  const order = await lookupOrderByCode(req.params.orderCode, req.query.phone, lang);
  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('LOOKUP_ORDER_SUCCESS', {}, req),
    data: order,
  });
});

const cancelOrderByCustomer = asyncHandler(async (req, res) => {
  const { orderCode } = req.params;
  const { reason, phone } = req.body;
  const lang = resolveLang(req);

  const updated = await updateOrderStatus({
    orderIdOrCode: orderCode,
    nextStatus: 'cancelled',
    note: reason || 'Khách hàng chủ động hủy đơn hàng',
    actorName: req.user ? req.user.fullName : 'Khách hàng',
    isCustomerCancel: true,
    phone: phone || '',
    lang,
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('CANCEL_ORDER_SUCCESS', {}, req),
    data: updated,
  });
});

const getOrders = asyncHandler(async (req, res) => {
  const { items, meta } = await listOrders(req.query);
  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('GET_ORDERS_SUCCESS', {}, req),
    data: items,
    meta,
  });
});

const getOrderById = asyncHandler(async (req, res) => {
  const lang = resolveLang(req);
  const order = await getOrderByIdOrCode(req.params.id, lang);
  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('GET_ORDER_DETAIL_SUCCESS', {}, req),
    data: order,
  });
});

const changeOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, note, phone } = req.body;
  const lang = resolveLang(req);

  if (!status) {
    throw new AppError(getMessage('MISSING_STATUS', {}, req), 400, 'MISSING_STATUS');
  }

  const isStaffOrAdmin = req.user && ['admin', 'staff'].includes(req.user.role);
  const isCustomerCancelRequest = status === 'cancelled' && !isStaffOrAdmin;

  if (!isStaffOrAdmin && status !== 'cancelled') {
    throw new AppError(
      getMessage('FORBIDDEN', {}, req),
      req.user ? 403 : 401,
      req.user ? 'FORBIDDEN' : 'UNAUTHORIZED'
    );
  }

  const updated = await updateOrderStatus({
    orderIdOrCode: id,
    nextStatus: status,
    note,
    actorName: req.user ? `${req.user.fullName} (${req.user.role})` : 'Khách hàng',
    isCustomerCancel: isCustomerCancelRequest,
    phone: phone || '',
    lang,
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('UPDATE_ORDER_STATUS_SUCCESS', { status }, req),
    data: updated,
  });
});

const changeOrderPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { paymentStatus, note } = req.body;
  const lang = resolveLang(req);

  const updated = await updateOrderPaymentStatus({
    orderId: id,
    paymentStatus,
    note,
    actorName: req.user ? `${req.user.fullName} (${req.user.role})` : 'Admin',
    lang,
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('UPDATE_ORDER_PAYMENT_SUCCESS', { paymentStatus }, req),
    data: updated,
  });
});

module.exports = {
  placeOrder,
  lookupOrder,
  cancelOrderByCustomer,
  getOrders,
  getOrderById,
  changeOrderStatus,
  changeOrderPayment,
};
