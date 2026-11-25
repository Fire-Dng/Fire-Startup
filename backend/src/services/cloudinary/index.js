const path = require('path');
const env = require('../../config/env');
const { MEDIA_FOLDERS, ALLOWED_IMAGE_MIME_TYPES } = require('../../config/assets');
const { getMessage } = require('../../i18n/messages');
const AppError = require('../../utils/AppError');
const { parseCloudinaryCredentials, isCloudinaryConfigured } = require('./credentials');
const { validateFolderAndMime, buildObjectKey } = require('./validation');
const {
  LOCAL_UPLOAD_ROOT,
  saveToLocalFallback,
  deleteFromLocalFallback,
} = require('./local');
const {
  uploadToCloudinary,
  deleteFromCloudinary,
  createPresignedUploadUrl,
} = require('./remote');

const getStorageStatus = () => {
  const cloudinaryCreds = parseCloudinaryCredentials();
  const cloudinaryActive = Boolean(cloudinaryCreds);

  const storageMode = cloudinaryActive ? 'cloudinary' : 'local-fallback';
  const publicBaseUrl = cloudinaryActive
    ? `https://res.cloudinary.com/${cloudinaryCreds.cloudName}/image/upload`
    : `${env.BACKEND_PUBLIC_URL}/uploads`;

  return {
    storageMode,
    provider: cloudinaryActive ? 'cloudinary' : 'local',
    isCloudinaryConfigured: cloudinaryActive,
    cloudName: cloudinaryCreds?.cloudName || env.CLOUDINARY_CLOUD_NAME || '',
    bucket: cloudinaryActive ? cloudinaryCreds.cloudName : 'local-uploads',
    region: cloudinaryActive ? 'global-cdn' : 'local',
    publicBaseUrl,
    folders: MEDIA_FOLDERS,
    allowedMimeTypes: ALLOWED_IMAGE_MIME_TYPES,
    maxFileSizeMb: env.UPLOAD_MAX_FILE_SIZE_MB,
    presignedExpiresIn: env.MEDIA_SIGNED_EXPIRES_IN,
  };
};

const uploadMediaBuffer = async ({
  buffer,
  originalName = 'upload.jpg',
  mimeType = 'image/jpeg',
  size = 0,
  folder = 'products',
  customKey = '',
  lang = 'vi',
}) => {
  if (!buffer || !Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new AppError(getMessage('MEDIA_MISSING_FILE', {}, lang), 400, 'MISSING_FILE');
  }

  const maxBytes = env.UPLOAD_MAX_FILE_SIZE_MB * 1024 * 1024;
  if (buffer.length > maxBytes || size > maxBytes) {
    throw new AppError(
      getMessage('MEDIA_FILE_TOO_LARGE', { maxSizeMb: env.UPLOAD_MAX_FILE_SIZE_MB }, lang),
      400,
      'FILE_TOO_LARGE'
    );
  }

  const { cleanFolder, cleanMime } = validateFolderAndMime({ folder, mimeType, lang });
  const generated = buildObjectKey(cleanFolder, originalName, cleanMime);
  const key = customKey ? `${cleanFolder}/${path.basename(customKey)}` : generated.key;

  if (isCloudinaryConfigured()) {
    try {
      const uploaded = await uploadToCloudinary({
        buffer,
        cleanFolder,
        cleanMime,
        publicIdSlug: generated.publicIdSlug,
      });
      if (uploaded) return uploaded;
    } catch (cloudErr) {
      console.warn(
        `[Cloudinary Upload Warning] Could not upload to Cloudinary (${cloudErr.message}). Falling back to local storage...`
      );
    }
  }

  return saveToLocalFallback({ buffer, key, cleanFolder, cleanMime });
};

const deleteMediaObject = async ({ key = '', url = '', lang = 'vi' }) => {
  let resolvedKey = String(key || '').trim();

  if (!resolvedKey && url) {
    const cleanUrl = String(url).trim();
    const uploadsMatch = cleanUrl.match(
      /\/uploads\/((?:landing|products|materials|custom-previews)\/[^?#]+)/
    );
    const cloudinaryMatch = cleanUrl.match(
      /cloudinary\.com\/[^/]+\/image\/upload\/(?:v\d+\/)?(?:[^/]+\/)?((?:landing|products|materials|custom-previews)\/[^.?#]+)/
    );
    if (uploadsMatch) resolvedKey = uploadsMatch[1];
    else if (cloudinaryMatch) resolvedKey = cloudinaryMatch[1];
  }

  resolvedKey = resolvedKey.replace(/^\/+/, '');
  if (!resolvedKey) {
    throw new AppError(getMessage('MEDIA_MISSING_KEY', {}, lang), 400, 'MISSING_MEDIA_KEY');
  }

  const folderPrefix = resolvedKey.split('/')[0];
  if (!MEDIA_FOLDERS.includes(folderPrefix)) {
    throw new AppError(
      getMessage(
        'MEDIA_INVALID_FOLDER',
        { folder: folderPrefix, allowed: MEDIA_FOLDERS.join(', ') },
        lang
      ),
      400,
      'INVALID_MEDIA_FOLDER'
    );
  }

  if (isCloudinaryConfigured()) {
    try {
      await deleteFromCloudinary(resolvedKey);
    } catch (cloudErr) {
      console.warn(
        `[Cloudinary Delete Warning] Could not delete "${resolvedKey}": ${cloudErr.message}`
      );
    }
  }

  deleteFromLocalFallback(resolvedKey);

  return {
    deleted: true,
    key: resolvedKey,
    storageMode: isCloudinaryConfigured() ? 'cloudinary' : 'local-fallback',
  };
};

module.exports = {
  LOCAL_UPLOAD_ROOT,
  isCloudinaryConfigured,
  getStorageStatus,
  createPresignedUploadUrl,
  uploadMediaBuffer,
  uploadBuffer: uploadMediaBuffer,
  deleteMediaObject,
};
