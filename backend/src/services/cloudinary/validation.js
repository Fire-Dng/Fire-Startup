const path = require('path');
const crypto = require('crypto');
const { MEDIA_FOLDERS, ALLOWED_IMAGE_MIME_TYPES } = require('../../config/assets');
const { getMessage } = require('../../i18n/messages');
const AppError = require('../../utils/AppError');

const MIME_TO_EXT = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
};

const validateFolderAndMime = ({ folder = 'products', mimeType = 'image/jpeg', lang = 'vi' }) => {
  const cleanFolder = String(folder || 'products').trim().toLowerCase();
  if (!MEDIA_FOLDERS.includes(cleanFolder)) {
    throw new AppError(
      getMessage(
        'MEDIA_INVALID_FOLDER',
        { folder: cleanFolder, allowed: MEDIA_FOLDERS.join(', ') },
        lang
      ),
      400,
      'INVALID_MEDIA_FOLDER'
    );
  }

  const cleanMime = String(mimeType || '').trim().toLowerCase();
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(cleanMime)) {
    throw new AppError(
      getMessage('MEDIA_INVALID_MIME', { mimeType: cleanMime || 'unknown' }, lang),
      400,
      'INVALID_MEDIA_MIME_TYPE'
    );
  }

  return { cleanFolder, cleanMime };
};

const buildObjectKey = (folder, originalName = 'image.jpg', mimeType = 'image/jpeg') => {
  const extFromMime = MIME_TO_EXT[mimeType] || '.jpg';
  const baseName =
    path
      .basename(String(originalName || 'image'), path.extname(String(originalName || '')))
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, '-')
      .replace(/(^-|-$)+/g, '')
      .slice(0, 48) || 'media';

  const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  return {
    key: `${folder}/${uniqueSuffix}-${baseName}${extFromMime}`,
    publicIdSlug: `${uniqueSuffix}-${baseName}`,
  };
};

module.exports = {
  MIME_TO_EXT,
  validateFolderAndMime,
  buildObjectKey,
};
