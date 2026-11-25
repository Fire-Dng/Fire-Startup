const Product = require('../../models/Product');
const CustomMaterial = require('../../models/CustomMaterial');
const { getMessage } = require('../../i18n/messages');
const AppError = require('../../utils/AppError');

const validateOrderInventory = async (productDemandMap, materialDemandMap, lang = 'vi') => {
  for (const [, { product, totalQty }] of productDemandMap.entries()) {
    if (product.stock < totalQty) {
      throw new AppError(
        getMessage(
          'INSUFFICIENT_PRODUCT_STOCK',
          { name: product.name, required: totalQty, available: product.stock },
          lang
        ),
        400,
        'INSUFFICIENT_PRODUCT_STOCK',
        {
          productId: product._id,
          productName: product.name,
          required: totalQty,
          available: product.stock,
        }
      );
    }
  }

  for (const [, matDemand] of materialDemandMap.entries()) {
    const freshMat = await CustomMaterial.findById(matDemand.materialId).lean();
    if (!freshMat || !freshMat.isActive) {
      throw new AppError(
        getMessage('MATERIAL_UNAVAILABLE', { name: matDemand.name }, lang),
        400,
        'MATERIAL_UNAVAILABLE'
      );
    }
    if (freshMat.stockQuantity < matDemand.totalQty) {
      throw new AppError(
        getMessage(
          'INSUFFICIENT_MATERIAL_STOCK',
          {
            name: freshMat.name,
            code: freshMat.code,
            required: matDemand.totalQty,
            available: freshMat.stockQuantity,
          },
          lang
        ),
        400,
        'INSUFFICIENT_MATERIAL_STOCK',
        {
          materialId: freshMat._id,
          materialName: freshMat.name,
          materialCode: freshMat.code,
          required: matDemand.totalQty,
          available: freshMat.stockQuantity,
        }
      );
    }
  }
};

const deductOrderInventory = async (productDemandMap, materialDemandMap, lang = 'vi') => {
  const deductedProducts = [];
  const deductedMaterials = [];

  try {
    for (const [prodId, { product, totalQty }] of productDemandMap.entries()) {
      const updatedProd = await Product.findOneAndUpdate(
        { _id: prodId, stock: { $gte: totalQty } },
        { $inc: { stock: -totalQty, soldCount: totalQty } },
        { new: true }
      );
      if (!updatedProd) {
        throw new AppError(
          getMessage(
            'CONCURRENT_PRODUCT_OUT_OF_STOCK',
            { name: product.name, required: totalQty },
            lang
          ),
          400,
          'CONCURRENT_PRODUCT_OUT_OF_STOCK'
        );
      }
      deductedProducts.push({ productId: prodId, qty: totalQty });
    }

    for (const [matId, matDemand] of materialDemandMap.entries()) {
      const updatedMat = await CustomMaterial.findOneAndUpdate(
        { _id: matId, stockQuantity: { $gte: matDemand.totalQty } },
        { $inc: { stockQuantity: -matDemand.totalQty } },
        { new: true }
      );
      if (!updatedMat) {
        throw new AppError(
          getMessage(
            'CONCURRENT_MATERIAL_OUT_OF_STOCK',
            { name: matDemand.name, required: matDemand.totalQty },
            lang
          ),
          400,
          'CONCURRENT_MATERIAL_OUT_OF_STOCK'
        );
      }
      deductedMaterials.push({ materialId: matId, qty: matDemand.totalQty });
    }
  } catch (deductErr) {
    for (const p of deductedProducts) {
      await Product.findByIdAndUpdate(p.productId, { $inc: { stock: p.qty, soldCount: -p.qty } });
    }
    for (const m of deductedMaterials) {
      await CustomMaterial.findByIdAndUpdate(m.materialId, { $inc: { stockQuantity: m.qty } });
    }
    throw deductErr;
  }
};

/**
 * BR-06: Rollback Product & CustomMaterial inventory when an order is cancelled
 */
const rollbackOrderInventory = async (order) => {
  if (!order.inventoryDeducted) return;

  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { stock: item.quantity, soldCount: -item.quantity },
    });

    if (item.isCustom && Array.isArray(item.bomSummary)) {
      for (const bom of item.bomSummary) {
        if (bom.materialId && bom.totalQuantity > 0) {
          await CustomMaterial.findByIdAndUpdate(bom.materialId, {
            $inc: { stockQuantity: bom.totalQuantity },
          });
        }
      }
    }
  }
};

module.exports = {
  validateOrderInventory,
  deductOrderInventory,
  rollbackOrderInventory,
};
