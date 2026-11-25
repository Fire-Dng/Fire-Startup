const materialService = require('../services/material.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { getMessage, resolveLang } = require('../i18n/messages');

const getMaterials = asyncHandler(async (req, res) => {
  const materials = await materialService.listMaterials(req.query);
  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('GET_MATERIALS_SUCCESS', {}, req),
    data: materials,
    meta: { total: materials.length },
  });
});

const createMaterial = asyncHandler(async (req, res) => {
  const material = await materialService.createMaterial(req.body);
  return sendSuccess(res, {
    statusCode: 201,
    message: getMessage('CREATE_MATERIAL_SUCCESS', {}, req),
    data: material,
  });
});

const updateMaterial = asyncHandler(async (req, res) => {
  const lang = resolveLang(req);
  const material = await materialService.updateMaterial(req.params.id, req.body, lang);
  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('UPDATE_MATERIAL_SUCCESS', {}, req),
    data: material,
  });
});

const deleteMaterial = asyncHandler(async (req, res) => {
  const lang = resolveLang(req);
  const data = await materialService.deleteMaterial(req.params.id, lang);
  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('DELETE_MATERIAL_SUCCESS', {}, req),
    data,
  });
});

module.exports = {
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
};
