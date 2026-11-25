const { z } = require('zod');

const createMaterialSchema = z
  .object({
    name: z.string().trim().min(1, 'Tên nguyên liệu không được để trống'),
    materialType: z.enum(['shell', 'snail', 'charm', 'bead', 'cord']).optional(),
    unitPrice: z.coerce.number().min(0, 'Đơn giá phải >= 0').optional(),
    stockQuantity: z.coerce.number().int().min(0, 'Tồn kho phải >= 0').optional(),
  })
  .passthrough();

const updateMaterialSchema = createMaterialSchema.partial().passthrough();

module.exports = {
  createMaterialSchema,
  updateMaterialSchema,
};
