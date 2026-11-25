const Product = require('../../models/Product');
const CustomDesign = require('../../models/CustomDesign');
const Order = require('../../models/Order');
const LandingContent = require('../../models/LandingContent');
const env = require('../../config/env');
const { BASE_COLORS } = require('../../config/theme');
const { getMessage } = require('../../i18n/messages');
const AppError = require('../../utils/AppError');
const { calculateDesignBOM } = require('../pricing.service');
const { generateOrderCode, buildVietQrInfo } = require('./vietqr');
const { validateOrderInventory, deductOrderInventory } = require('./inventory');

const prepareOrderItem = async ({
  rawItem,
  index,
  productDemandMap,
  materialDemandMap,
  lang,
}) => {
  const quantity = parseInt(rawItem.quantity || 1, 10);
  if (!Number.isFinite(quantity) || quantity < 1) {
    throw new AppError(getMessage('INVALID_QUANTITY', { index: index + 1 }, lang), 400, 'INVALID_QUANTITY');
  }

  let productId = rawItem.productId;
  let savedDesign = null;

  if (rawItem.customDesignId) {
    savedDesign = await CustomDesign.findById(rawItem.customDesignId).lean();
    if (!savedDesign) {
      throw new AppError(getMessage('DESIGN_NOT_FOUND', {}, lang), 404, 'DESIGN_NOT_FOUND');
    }
    if (!productId) {
      productId = savedDesign.productId;
    }
  }

  if (!productId) {
    throw new AppError(getMessage('MISSING_PRODUCT_ID', {}, lang), 400, 'MISSING_PRODUCT_ID');
  }

  const product = await Product.findById(productId).lean();
  if (!product || !product.isActive) {
    throw new AppError(
      getMessage('PRODUCT_UNAVAILABLE', { name: product ? product.name : productId }, lang),
      400,
      'PRODUCT_UNAVAILABLE'
    );
  }

  const prodKey = String(product._id);
  const prevProdDemand = productDemandMap.get(prodKey)?.totalQty || 0;
  productDemandMap.set(prodKey, { product, totalQty: prevProdDemand + quantity });

  const hasCustomInline =
    rawItem.isCustom === true ||
    Boolean(rawItem.customDesignId) ||
    Boolean(rawItem.customDesign) ||
    Boolean(rawItem.customDesignSnapshot) ||
    (Array.isArray(rawItem.placements) && rawItem.placements.length > 0);

  const itemEcoGrams = (product.ecoImpact?.netWeightGrams || 150) * quantity;

  if (!hasCustomInline) {
    const unitPrice = product.basePrice;
    const lineTotal = unitPrice * quantity;
    return {
      lineTotal,
      itemEcoGrams,
      orderItem: {
        productId: product._id,
        productName: product.name,
        productSlug: product.slug,
        category: product.category,
        thumbnail: product.thumbnail,
        model3D: {
          meshPreset: product.model3D?.meshPreset || 'tote_bag',
          glbUrl: product.model3D?.glbUrl || '',
        },
        quantity,
        selectedColor:
          rawItem.selectedColor || product.model3D?.defaultBaseColor || BASE_COLORS.OCEAN_TEAL,
        selectedStrapColor:
          rawItem.selectedStrapColor ||
          product.model3D?.defaultStrapColor ||
          BASE_COLORS.ROPE_NATURAL,
        selectedSize: rawItem.selectedSize || product.availableSizes?.[0] || 'Tiêu chuẩn',
        isCustom: false,
        customDesignId: null,
        customDesignSnapshot: null,
        bomSummary: [],
        unitPrice,
        subtotal: lineTotal,
        pricingBreakdown: {
          basePrice: unitPrice,
          craftFee: 0,
          materialsTotal: 0,
          unitPrice,
          lineTotal,
        },
        ecoImpactGrams: itemEcoGrams,
      },
    };
  }

  const inlineConfig = rawItem.customDesign || rawItem.customDesignSnapshot || {};
  const placementsInput =
    rawItem.placements || inlineConfig.placements || (savedDesign ? savedDesign.placements : []);

  const bomCalc = await calculateDesignBOM({ productId: product._id, placements: placementsInput, lang });

  const baseColor =
    rawItem.selectedColor ||
    inlineConfig.baseColor ||
    (savedDesign
      ? savedDesign.baseColor
      : product.model3D?.defaultBaseColor || BASE_COLORS.OCEAN_TEAL);

  const strapColor =
    rawItem.selectedStrapColor ||
    inlineConfig.strapColor ||
    (savedDesign
      ? savedDesign.strapColor
      : product.model3D?.defaultStrapColor || BASE_COLORS.ROPE_NATURAL);

  const selectedSize =
    rawItem.selectedSize ||
    inlineConfig.size ||
    (savedDesign ? savedDesign.size : product.availableSizes?.[0] || 'Tiêu chuẩn');

  const orderItemBomSummary = bomCalc.bomSummary.map((bomItem) => {
    const matKey = String(bomItem.materialId);
    const requiredForThisLine = bomItem.quantity * quantity;
    const prevMatDemand = materialDemandMap.get(matKey)?.totalQty || 0;

    materialDemandMap.set(matKey, {
      materialId: bomItem.materialId,
      name: bomItem.name,
      code: bomItem.code,
      totalQty: prevMatDemand + requiredForThisLine,
      availableStock: bomItem.availableStock,
    });

    return {
      materialId: bomItem.materialId,
      code: bomItem.code,
      name: bomItem.name,
      materialType: bomItem.materialType,
      meshPreset: bomItem.meshPreset,
      unitPrice: bomItem.unitPrice,
      quantityPerItem: bomItem.quantity,
      totalQuantity: requiredForThisLine,
      subtotal: bomItem.unitPrice * requiredForThisLine,
    };
  });

  const unitPrice = bomCalc.pricingBreakdown.estimatedPrice;
  const lineTotal = unitPrice * quantity;

  return {
    lineTotal,
    itemEcoGrams,
    orderItem: {
      productId: product._id,
      productName: product.name,
      productSlug: product.slug,
      category: product.category,
      thumbnail: product.thumbnail,
      model3D: {
        meshPreset: product.model3D?.meshPreset || 'tote_bag',
        glbUrl: product.model3D?.glbUrl || '',
      },
      quantity,
      selectedColor: baseColor,
      selectedStrapColor: strapColor,
      selectedSize,
      isCustom: true,
      customDesignId: savedDesign ? savedDesign._id : null,
      customDesignSnapshot: {
        shareCode: savedDesign ? savedDesign.shareCode : inlineConfig.shareCode || 'CUSTOM-DIRECT',
        name: savedDesign ? savedDesign.name : inlineConfig.name || `Custom ${product.name}`,
        baseColor,
        strapColor,
        size: selectedSize,
        note:
          inlineConfig.note ||
          inlineConfig.artisanNote ||
          (savedDesign ? savedDesign.note : '') ||
          '',
        artisanNote:
          inlineConfig.artisanNote ||
          inlineConfig.note ||
          (savedDesign ? savedDesign.note : '') ||
          '',
        meshPreset: product.model3D?.meshPreset || 'tote_bag',
        glbUrl: product.model3D?.glbUrl || '',
        basePrice: bomCalc.pricingBreakdown.basePrice,
        craftFee: bomCalc.pricingBreakdown.craftFee,
        materialsTotal: bomCalc.pricingBreakdown.materialsTotal,
        estimatedPrice: unitPrice,
        braceletConfig:
          rawItem.braceletConfig ||
          inlineConfig.braceletConfig ||
          (savedDesign && savedDesign.braceletConfig) || {
            wristSizeCm: 16,
            slotCount: 12,
            cordMaterial: 'recycled_net_cord',
          },
        placements: bomCalc.enrichedPlacements,
      },
      bomSummary: orderItemBomSummary,
      unitPrice,
      subtotal: lineTotal,
      pricingBreakdown: {
        basePrice: bomCalc.pricingBreakdown.basePrice,
        craftFee: bomCalc.pricingBreakdown.craftFee,
        materialsTotal: bomCalc.pricingBreakdown.materialsTotal,
        unitPrice,
        lineTotal,
      },
      ecoImpactGrams: itemEcoGrams,
    },
  };
};

const createOrder = async (payload, user = null, lang = 'vi') => {
  const { customerInfo, items, paymentMethod = 'cod' } = payload;

  if (!customerInfo || !customerInfo.fullName || !customerInfo.phone || !customerInfo.address) {
    throw new AppError(getMessage('INVALID_CUSTOMER_INFO', {}, lang), 400, 'INVALID_CUSTOMER_INFO');
  }
  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError(getMessage('EMPTY_ORDER_ITEMS', {}, lang), 400, 'EMPTY_ORDER_ITEMS');
  }

  const productDemandMap = new Map();
  const materialDemandMap = new Map();
  const preparedOrderItems = [];
  let subtotal = 0;
  let totalNetWeightGrams = 0;

  for (let i = 0; i < items.length; i++) {
    const prepared = await prepareOrderItem({
      rawItem: items[i],
      index: i,
      productDemandMap,
      materialDemandMap,
      lang,
    });
    subtotal += prepared.lineTotal;
    totalNetWeightGrams += prepared.itemEcoGrams;
    preparedOrderItems.push(prepared.orderItem);
  }

  await validateOrderInventory(productDemandMap, materialDemandMap, lang);
  await deductOrderInventory(productDemandMap, materialDemandMap, lang);

  const shippingFee = subtotal >= env.FREE_SHIPPING_THRESHOLD ? 0 : env.DEFAULT_SHIPPING_FEE;
  const totalAmount = subtotal + shippingFee;
  const orderCode = await generateOrderCode();
  const normalizedMethod = paymentMethod === 'vietqr' ? 'vietqr' : 'cod';

  const order = await Order.create({
    orderCode,
    userId: user ? user._id : null,
    customerInfo: {
      fullName: customerInfo.fullName,
      phone: customerInfo.phone,
      email: customerInfo.email || (user ? user.email : ''),
      address: customerInfo.address,
      city: customerInfo.city || 'Đà Nẵng',
      note: customerInfo.note || '',
    },
    items: preparedOrderItems,
    status: 'pending',
    statusHistory: [
      {
        status: 'pending',
        note: 'Đơn hàng được khởi tạo thành công và đã giữ nguyên liệu chế tác',
        updatedBy: user ? user.fullName : customerInfo.fullName,
        updatedAt: new Date(),
      },
    ],
    paymentMethod: normalizedMethod,
    paymentStatus: 'unpaid',
    vietqrInfo: buildVietQrInfo(orderCode, totalAmount),
    subtotal,
    shippingFee,
    totalAmount,
    finalAmount: totalAmount,
    totalNetWeightGrams,
    inventoryDeducted: true,
  });

  await LandingContent.findOneAndUpdate(
    { key: 'main_landing' },
    {
      $inc: {
        'impactStats.upcycledProductsCreated': preparedOrderItems.reduce(
          (acc, it) => acc + it.quantity,
          0
        ),
      },
    }
  );

  return order.toObject();
};

module.exports = {
  createOrder,
};
