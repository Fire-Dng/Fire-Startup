const Category = require('../models/Category');
const Product = require('../models/Product');
const CustomMaterial = require('../models/CustomMaterial');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

const DEFAULT_CATEGORIES = [
  {
    name: 'Túi xách lưới đại dương',
    nameEn: 'Upcycled Net Bags',
    slug: 'bag',
    type: 'product',
    meshPresetDefault: 'tote_bag',
    description: 'Túi Tote, túi đeo chéo đan thủ công từ lưới đánh cá thu hồi.',
    sortOrder: 1,
    isActive: true,
  },
  {
    name: 'Giỏ đựng đồ đan lưới',
    nameEn: 'Woven Storage Baskets',
    slug: 'basket',
    type: 'product',
    meshPresetDefault: 'storage_basket',
    description: 'Giỏ tròn đựng đồ gia đình và đi chợ xanh thân thiện môi trường.',
    sortOrder: 2,
    isActive: true,
  },
  {
    name: 'Ví cầm tay sợi lưới',
    nameEn: 'Upcycled Net Wallets',
    slug: 'wallet',
    type: 'product',
    meshPresetDefault: 'zip_wallet',
    description: 'Ví khóa kéo nhỏ gọn dệt từ sợi lưới biển bền bỉ.',
    sortOrder: 3,
    isActive: true,
  },
  {
    name: 'Trang phục tái chế',
    nameEn: 'Upcycled Apparel',
    slug: 'apparel',
    type: 'product',
    meshPresetDefault: 'eco_shirt',
    description: 'Áo khoác gile và trang phục thời trang bền vững từ sợi tái sinh.',
    sortOrder: 4,
    isActive: true,
  },
  {
    name: 'Vòng tay dây lưới & Vỏ sò',
    nameEn: 'Braided Net Bracelets',
    slug: 'bracelet',
    type: 'product',
    meshPresetDefault: 'woven_bracelet',
    description: 'Vòng tay dây lưới tết thủ công đính vỏ sò, ốc biển và ngọc trai.',
    sortOrder: 5,
    isActive: true,
  },
  {
    name: 'Phụ kiện & Móc khóa biển',
    nameEn: 'Marine Charm Accessories',
    slug: 'accessory',
    type: 'product',
    meshPresetDefault: 'shell_charm_set',
    description: 'Bộ charm vỏ sò, móc khóa phao lưới và phụ kiện trang trí.',
    sortOrder: 6,
    isActive: true,
  },
];

const ensureDefaultCategories = async () => {
  const count = await Category.countDocuments();
  if (count === 0) {
    await Category.insertMany(DEFAULT_CATEGORIES, { ordered: false }).catch(() => {});
  }
};

const getCategories = asyncHandler(async (req, res) => {
  await ensureDefaultCategories();
  const { type, includeInactive, search } = req.query;
  const filter = {};
  if (includeInactive !== 'true') {
    filter.isActive = true;
  }
  if (type && type !== 'all') {
    filter.type = String(type);
  }
  if (search && String(search).trim() !== '') {
    const regex = new RegExp(String(search).trim(), 'i');
    filter.$or = [{ name: regex }, { nameEn: regex }, { slug: regex }, { description: regex }];
  }

  const [categories, productCounts, materialCounts] = await Promise.all([
    Category.find(filter).sort({ sortOrder: 1, createdAt: 1 }).lean(),
    Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 }, stock: { $sum: '$stock' } } }]),
    CustomMaterial.aggregate([
      { $group: { _id: '$materialType', count: { $sum: 1 }, stock: { $sum: '$stockQuantity' } } },
    ]),
  ]);

  const prodCountMap = new Map(productCounts.map((c) => [c._id, { count: c.count, stock: c.stock }]));
  const matCountMap = new Map(materialCounts.map((c) => [c._id, { count: c.count, stock: c.stock }]));

  const enriched = categories.map((cat) => {
    const stats =
      cat.type === 'material'
        ? matCountMap.get(cat.slug) || { count: 0, stock: 0 }
        : prodCountMap.get(cat.slug) || { count: 0, stock: 0 };
    return {
      ...cat,
      itemCount: stats.count,
      totalStock: stats.stock,
    };
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: 'Lấy danh sách danh mục thành công',
    data: enriched,
  });
});

const createCategory = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (!payload.name) {
    throw new AppError('Tên danh mục không được để trống', 400, 'MISSING_CATEGORY_NAME');
  }
  if (!payload.slug) {
    payload.slug = String(payload.name)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  const created = await Category.create(payload);
  return sendSuccess(res, {
    statusCode: 201,
    message: 'Tạo danh mục thành công',
    data: created,
  });
});

const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updated = await Category.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  }).lean();

  if (!updated) {
    throw new AppError('Không tìm thấy danh mục', 404, 'CATEGORY_NOT_FOUND');
  }

  return sendSuccess(res, {
    statusCode: 200,
    message: 'Cập nhật danh mục thành công',
    data: updated,
  });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await Category.findByIdAndDelete(id).lean();
  if (!deleted) {
    throw new AppError('Không tìm thấy danh mục', 404, 'CATEGORY_NOT_FOUND');
  }

  return sendSuccess(res, {
    statusCode: 200,
    message: 'Xóa danh mục thành công',
    data: { _id: id },
  });
});

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  ensureDefaultCategories,
};
