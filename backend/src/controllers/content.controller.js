const contentService = require('../services/content.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { getMessage } = require('../i18n/messages');

const getLandingContent = asyncHandler(async (req, res) => {
  const data = await contentService.getLandingContentData();
  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('GET_LANDING_SUCCESS', {}, req),
    data,
  });
});

const updateLandingContent = asyncHandler(async (req, res) => {
  const data = await contentService.updateLandingContentData(req.body);
  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('UPDATE_LANDING_SUCCESS', {}, req),
    data,
  });
});

module.exports = { getLandingContent, updateLandingContent };
