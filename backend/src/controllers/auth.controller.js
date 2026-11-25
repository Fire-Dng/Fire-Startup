const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { getMessage, resolveLang } = require('../i18n/messages');

const register = asyncHandler(async (req, res) => {
  const lang = resolveLang(req);
  const data = await authService.registerUser(req.body, lang);
  return sendSuccess(res, {
    statusCode: 201,
    message: getMessage('REGISTER_SUCCESS', {}, req),
    data,
  });
});

const login = asyncHandler(async (req, res) => {
  const lang = resolveLang(req);
  const data = await authService.loginUser(req.body, lang);
  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('LOGIN_SUCCESS', {}, req),
    data,
  });
});

const getMe = asyncHandler(async (req, res) => {
  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('GET_ME_SUCCESS', {}, req),
    data: req.user,
  });
});

module.exports = { register, login, getMe };
