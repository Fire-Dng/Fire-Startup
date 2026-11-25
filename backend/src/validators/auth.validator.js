const { z } = require('zod');

const registerSchema = z
  .object({
    fullName: z.string().trim().min(1, 'Họ tên không được để trống'),
    email: z.string().trim().email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    phone: z.string().trim().optional(),
  })
  .passthrough();

const loginSchema = z
  .object({
    email: z.string().trim().email('Email không hợp lệ'),
    password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
  })
  .passthrough();

module.exports = {
  registerSchema,
  loginSchema,
};
