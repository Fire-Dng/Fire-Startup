const { z } = require('zod');

const placeOrderSchema = z
  .object({
    customerInfo: z
      .object({
        fullName: z.string().trim().min(1, 'Họ tên người nhận không được để trống'),
        phone: z.string().trim().min(6, 'Số điện thoại không hợp lệ'),
        address: z.string().trim().min(1, 'Địa chỉ giao hàng không được để trống'),
        email: z.string().trim().optional(),
        city: z.string().trim().optional(),
        note: z.string().optional(),
      })
      .passthrough(),
    items: z
      .array(
        z
          .object({
            quantity: z.coerce.number().int().min(1, 'Số lượng phải >= 1').optional(),
          })
          .passthrough()
      )
      .min(1, 'Giỏ hàng trống, vui lòng chọn ít nhất 1 sản phẩm'),
    paymentMethod: z.enum(['cod', 'vietqr']).optional(),
  })
  .passthrough();

const changeOrderStatusSchema = z
  .object({
    status: z.enum([
      'pending',
      'confirmed',
      'in_crafting',
      'quality_check',
      'shipping',
      'delivered',
      'cancelled',
    ]),
    note: z.string().optional(),
    phone: z.string().optional(),
  })
  .passthrough();

const changeOrderPaymentSchema = z
  .object({
    paymentStatus: z.enum(['unpaid', 'paid', 'refunded']),
    note: z.string().optional(),
  })
  .passthrough();

module.exports = {
  placeOrderSchema,
  changeOrderStatusSchema,
  changeOrderPaymentSchema,
};
