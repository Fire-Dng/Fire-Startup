const adminService = require('../services/admin.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { getMessage } = require('../i18n/messages');

const getDashboardStats = asyncHandler(async (req, res) => {
  const data = await adminService.getAdminDashboardData();
  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('GET_DASHBOARD_SUCCESS', {}, req),
    data,
  });
});

module.exports = { getDashboardStats };
