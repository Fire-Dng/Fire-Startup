const productService = require('../services/product.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { getMessage, resolveLang } = require('../i18n/messages');

const getProducts = asyncHandler(async (req, res) => {
  const { items, meta } = await productService.listProducts(req.query);
  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('GET_PRODUCTS_SUCCESS', {}, req),
    data: items,
    meta,
  });
});

const getProductBySlugOrId = asyncHandler(async (req, res) => {
  const lang = resolveLang(req);
  const data = await productService.getProductDetail(req.params.slug, lang);
  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('GET_PRODUCT_DETAIL_SUCCESS', {}, req),
    data,
  });
});

const createProduct = asyncHandler(async (req, res) => {
  const lang = resolveLang(req);
  const data = await productService.createProduct(req.body, req.file, lang);
  return sendSuccess(res, {
    statusCode: 201,
    message: getMessage('CREATE_PRODUCT_SUCCESS', {}, req),
    data,
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  const lang = resolveLang(req);
  const data = await productService.updateProduct(req.params.id, req.body, req.file, lang);
  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('UPDATE_PRODUCT_SUCCESS', {}, req),
    data,
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const lang = resolveLang(req);
  const data = await productService.deleteProduct(req.params.id, lang);
  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('DELETE_PRODUCT_SUCCESS', {}, req),
    data,
  });
});

module.exports = {
  getProducts,
  getProductBySlugOrId,
  createProduct,
  updateProduct,
  deleteProduct,
};
