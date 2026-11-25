const categoryService = require('../services/category.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

const getCategories = asyncHandler(async (req, res) => {
  const data = await categoryService.listCategories(req.query);
  return sendSuccess(res, {
    statusCode: 200,
    message: 'Lấy danh sách danh mục thành công',
    data,
  });
});

const createCategory = asyncHandler(async (req, res) => {
  const created = await categoryService.createCategory(req.body);
  return sendSuccess(res, {
    statusCode: 201,
    message: 'Tạo danh mục thành công',
    data: created,
  });
});

const updateCategory = asyncHandler(async (req, res) => {
  const updated = await categoryService.updateCategory(req.params.id, req.body);
  return sendSuccess(res, {
    statusCode: 200,
    message: 'Cập nhật danh mục thành công',
    data: updated,
  });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const data = await categoryService.deleteCategory(req.params.id);
  return sendSuccess(res, {
    statusCode: 200,
    message: 'Xóa danh mục thành công',
    data,
  });
});

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  ensureDefaultCategories: categoryService.ensureDefaultCategories,
};
