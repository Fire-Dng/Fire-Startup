const CustomMaterial = require('../models/CustomMaterial');
const AppError = require('../utils/AppError');
const { getMessage } = require('../i18n/messages');

const listMaterials = async (query = {}) => {
  const { materialType, includeInactive, search } = query;
  const filter = {};
  if (includeInactive !== 'true') filter.isActive = true;
  if (materialType && materialType !== 'all') filter.materialType = String(materialType);
  if (search && String(search).trim() !== '') {
    const regex = new RegExp(String(search).trim(), 'i');
    filter.$or = [{ name: regex }, { code: regex }, { description: regex }];
  }

  return CustomMaterial.find(filter).sort({ materialType: 1, unitPrice: 1 }).lean();
};

const createMaterial = async (rawPayload) => {
  const payload = { ...rawPayload };
  if (!payload.code && payload.name) {
    payload.code = `MAT-${Date.now().toString().slice(-5)}`;
  }
  return CustomMaterial.create(payload);
};

const updateMaterial = async (id, payload, lang = 'vi') => {
  const material = await CustomMaterial.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).lean();
  if (!material) {
    throw new AppError(getMessage('MATERIAL_NOT_FOUND', {}, lang), 404, 'MATERIAL_NOT_FOUND');
  }
  return material;
};

const deleteMaterial = async (id, lang = 'vi') => {
  const material = await CustomMaterial.findByIdAndDelete(id).lean();
  if (!material) {
    throw new AppError(getMessage('MATERIAL_NOT_FOUND', {}, lang), 404, 'MATERIAL_NOT_FOUND');
  }
  return { _id: id };
};

module.exports = {
  listMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
};
