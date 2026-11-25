const { z } = require('zod');

const createCategorySchema = z
  .object({
    name: z.string().trim().min(1, 'Tên danh mục không được để trống'),
    nameEn: z.string().trim().optional(),
    slug: z.string().trim().optional(),
    type: z.enum(['product', 'material']).optional(),
    sortOrder: z.coerce.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
  })
  .passthrough();

const updateCategorySchema = createCategorySchema.partial().passthrough();

module.exports = {
  createCategorySchema,
  updateCategorySchema,
};
