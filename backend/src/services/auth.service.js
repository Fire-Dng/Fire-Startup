const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const { getMessage } = require('../i18n/messages');

const signToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role, email: user.email }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

const registerUser = async ({ fullName, email, password, phone }, lang = 'vi') => {
  if (!fullName || !email || !password) {
    throw new AppError(getMessage('REGISTER_MISSING_FIELDS', {}, lang), 400, 'MISSING_FIELDS');
  }

  const existing = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (existing) {
    throw new AppError(getMessage('EMAIL_EXISTS', {}, lang), 409, 'EMAIL_EXISTS');
  }

  const user = await User.create({
    fullName,
    email,
    password,
    phone: phone || '',
    role: 'customer',
  });

  const token = signToken(user);
  return {
    token,
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  };
};

const loginUser = async ({ email, password }, lang = 'vi') => {
  if (!email || !password) {
    throw new AppError(getMessage('LOGIN_MISSING_FIELDS', {}, lang), 400, 'MISSING_CREDENTIALS');
  }

  const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select(
    '+password'
  );
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError(getMessage('INVALID_CREDENTIALS', {}, lang), 401, 'INVALID_CREDENTIALS');
  }

  if (!user.isActive) {
    throw new AppError(getMessage('USER_LOCKED', {}, lang), 403, 'USER_LOCKED');
  }

  const token = signToken(user);
  return {
    token,
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      address: user.address,
    },
  };
};

module.exports = {
  signToken,
  registerUser,
  loginUser,
};
