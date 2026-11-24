const Product = require('../models/Product');
const { uploadMediaBuffer } = require('../services/cloudinary.service');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { getMessage, resolveLang } = require('../i18n/messages');

const slugify = (text) =>
  String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

const normalizeProductImagesPayload = async (rawPayload, req) => {
  const payload = { ...rawPayload };
  const lang = resolveLang(req);

  // If a file was uploaded directly via multipart/form-data or base64 imageBase64
  if (req.file && req.file.buffer) {
    const uploaded = await uploadMediaBuffer({
      buffer: req.file.buffer,
      originalName: req.file.originalname || payload.name || 'product.jpg',
      mimeType: req.file.mimetype || 'image/jpeg',
      size: req.file.size,
      folder: 'products',
      lang,
    });
    payload.image = uploaded.publicUrl;
    payload.imageUrl = uploaded.publicUrl;
    payload.thumbnail = uploaded.publicUrl;
    payload.imagePublicId = uploaded.publicId || uploaded.key || '';
    if (!Array.isArray(payload.images) || payload.images.length === 0) {
      payload.images = [uploaded.publicUrl];
    } else if (!payload.images.includes(uploaded.publicUrl)) {
      payload.images = [uploaded.publicUrl, ...payload.images];
    }
  } else if (payload.imageBase64) {
    const rawBase64 = String(payload.imageBase64).replace(/^data:([^;]+);base64,/, '');
    const mimeMatch = String(payload.imageBase64).match(/^data:([^;]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
    const buffer = Buffer.from(rawBase64, 'base64');
    const uploaded = await uploadMediaBuffer({
      buffer,
      originalName: payload.name || 'product.png',
      mimeType,
      size: buffer.length,
      folder: 'products',
      lang,
    });
    delete payload.imageBase64;
    payload.image = uploaded.publicUrl;
    payload.imageUrl = uploaded.publicUrl;
    payload.thumbnail = uploaded.publicUrl;
    payload.imagePublicId = uploaded.publicId || uploaded.key || '';
  }

  // Synchronize image / imageUrl / thumbnail / images array
  const primaryImage =
    payload.image ||
    payload.imageUrl ||
    payload.thumbnail ||
    (Array.isArray(payload.images) && payload.images.length > 0 ? payload.images[0] : '');

  if (primaryImage) {
    payload.image = primaryImage;
    payload.imageUrl = primaryImage;
    payload.thumbnail = primaryImage;
    if (!Array.isArray(payload.images) || payload.images.length === 0) {
      payload.images = [primaryImage];
    } else if (!payload.images.includes(primaryImage)) {
      payload.images = [primaryImage, ...payload.images];
    }
  }

  return payload;
};

const enrichProductImageFields = (product) => {
  if (!product) return product;
  const primary =
    product.image ||
    product.imageUrl ||
    product.thumbnail ||
    (Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : '');
  return {
    ...product,
    image: product.image || primary,
    imageUrl: product.imageUrl || primary,
    thumbnail: product.thumbnail || primary,
    images:
      Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : primary
        ? [primary]
        : [],
  };
};

const getProducts = asyncHandler(async (req, res) => {
  const {
    category,
    isCustomizable,
    isFeatured,
    includeInactive,
    search,
    minPrice,
    maxPrice,
    sort = 'newest',
    page = 1,
    limit = 50,
  } = req.query;

  const filter = {};

  if (includeInactive !== 'true') {
    filter.isActive = true;
  }

  if (category && category !== 'all') {
    filter.category = String(category);
  }

  if (isCustomizable === 'true' || isCustomizable === 'false') {
    filter.isCustomizable = isCustomizable === 'true';
  }

  if (isFeatured === 'true') {
    filter.isFeatured = true;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.basePrice = {};
    if (minPrice !== undefined && minPrice !== '') {
      filter.basePrice.$gte = Number(minPrice);
    }
    if (maxPrice !== undefined && maxPrice !== '') {
      filter.basePrice.$lte = Number(maxPrice);
    }
  }

  if (search && String(search).trim() !== '') {
    const regex = new RegExp(String(search).trim(), 'i');
    filter.$or = [{ name: regex }, { shortDescription: regex }, { description: regex }, { slug: regex }];
  }

  let sortOption = { createdAt: -1 };
  if (sort === 'price_asc') sortOption = { basePrice: 1 };
  else if (sort === 'price_desc') sortOption = { basePrice: -1 };
  else if (sort === 'popular') sortOption = { soldCount: -1, rating: -1 };

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sortOption).skip(skip).limit(limitNum).lean(),
    Product.countDocuments(filter),
  ]);

  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('GET_PRODUCTS_SUCCESS', {}, req),
    data: products.map(enrichProductImageFields),
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  });
});

const getProductBySlugOrId = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(slug);
  const query = isObjectId ? { $or: [{ _id: slug }, { slug }] } : { slug: String(slug).toLowerCase() };

  const product = await Product.findOne(query).lean();
  if (!product) {
    throw new AppError(getMessage('PRODUCT_NOT_FOUND', {}, req), 404, 'PRODUCT_NOT_FOUND');
  }

  const relatedProducts = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true,
  })
    .limit(4)
    .lean();

  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('GET_PRODUCT_DETAIL_SUCCESS', {}, req),
    data: {
      ...enrichProductImageFields(product),
      relatedProducts: relatedProducts.map(enrichProductImageFields),
    },
  });
});

const createProduct = asyncHandler(async (req, res) => {
  const payload = await normalizeProductImagesPayload(req.body, req);
  if (!payload.name) {
    throw new AppError(getMessage('PRODUCT_MISSING_NAME', {}, req), 400, 'MISSING_NAME');
  }
  if (!payload.slug) {
    payload.slug = `${slugify(payload.name)}-${Date.now().toString().slice(-4)}`;
  }

  const product = await Product.create(payload);
  return sendSuccess(res, {
    statusCode: 201,
    message: getMessage('CREATE_PRODUCT_SUCCESS', {}, req),
    data: enrichProductImageFields(product.toObject()),
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const payload = await normalizeProductImagesPayload(req.body, req);
  const product = await Product.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).lean();

  if (!product) {
    throw new AppError(getMessage('PRODUCT_NOT_FOUND', {}, req), 404, 'PRODUCT_NOT_FOUND');
  }

  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('UPDATE_PRODUCT_SUCCESS', {}, req),
    data: enrichProductImageFields(product),
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findByIdAndDelete(id).lean();
  if (!product) {
    throw new AppError(getMessage('PRODUCT_NOT_FOUND', {}, req), 404, 'PRODUCT_NOT_FOUND');
  }

  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('DELETE_PRODUCT_SUCCESS', {}, req),
    data: { _id: id },
  });
});

module.exports = {
  getProducts,
  getProductBySlugOrId,
  createProduct,
  updateProduct,
  deleteProduct,
};
