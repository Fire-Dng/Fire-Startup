const { z } = require('zod');

const calculatePriceSchema = z
  .object({
    productId: z.string().trim().min(1, 'Vui lòng cung cấp productId'),
    placements: z.array(z.any()).max(50, 'Tối đa 50 phụ kiện trên 1 sản phẩm').optional(),
  })
  .passthrough();

const saveCustomDesignSchema = z
  .object({
    productId: z.string().trim().min(1, 'Vui lòng cung cấp productId'),
    placements: z.array(z.any()).max(50, 'Tối đa 50 phụ kiện trên 1 sản phẩm').optional(),
  })
  .passthrough();

module.exports = {
  calculatePriceSchema,
  saveCustomDesignSchema,
};
