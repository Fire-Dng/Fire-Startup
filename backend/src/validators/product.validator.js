const { z } = require('zod');

const createProductSchema = z
  .object({
    name: z.string().trim().min(1, 'Tên sản phẩm không được để trống'),
    nameEn: z.string().trim().optional(),
    slug: z.string().trim().optional(),
    category: z.string().trim().min(1, 'Danh mục không được để trống').optional(),
    shortDescription: z.string().optional(),
    shortDescriptionEn: z.string().optional(),
    description: z.string().optional(),
    descriptionEn: z.string().optional(),
    basePrice: z.coerce.number().min(0, 'Giá phôi phải >= 0').optional(),
    craftFee: z.coerce.number().min(0, 'Phí chế tác phải >= 0').optional(),
    stock: z.coerce.number().int().min(0, 'Tồn kho phải >= 0').optional(),
  })
  .passthrough();

const updateProductSchema = createProductSchema.partial().passthrough();

module.exports = {
  createProductSchema,
  updateProductSchema,
};
