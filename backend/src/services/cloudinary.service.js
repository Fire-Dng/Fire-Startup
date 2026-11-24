const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const env = require('../config/env');
const {
  MEDIA_FOLDERS,
  ALLOWED_IMAGE_MIME_TYPES,
} = require('../config/assets');
const { getMessage } = require('../i18n/messages');
const AppError = require('../utils/AppError');

const LOCAL_UPLOAD_ROOT = path.resolve(__dirname, '../../uploads');

// Ensure local upload subdirectories exist for Smart Local Fallback when Cloudinary is not configured
for (const folder of MEDIA_FOLDERS) {
  const dirPath = path.join(LOCAL_UPLOAD_ROOT, folder);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// ============================================================================
// CLOUDINARY CONFIGURATION & UPLOADER (Native Fetch + SHA-1 Signature)
// ============================================================================

const parseCloudinaryCredentials = () => {
  if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
    if (
      env.CLOUDINARY_CLOUD_NAME !== 'your-cloud-name' &&
      env.CLOUDINARY_API_KEY !== 'your-cloudinary-api-key'
    ) {
      return {
        cloudName: env.CLOUDINARY_CLOUD_NAME,
        apiKey: env.CLOUDINARY_API_KEY,
        apiSecret: env.CLOUDINARY_API_SECRET,
      };
    }
  }
  if (env.CLOUDINARY_URL && env.CLOUDINARY_URL.startsWith('cloudinary://')) {
    try {
      const parsed = new URL(env.CLOUDINARY_URL);
      const cloudName = parsed.hostname;
      const apiKey = decodeURIComponent(parsed.username);
      const apiSecret = decodeURIComponent(parsed.password);
      if (cloudName && apiKey && apiSecret) {
        return { cloudName, apiKey, apiSecret };
      }
    } catch (_) {
      // Invalid CLOUDINARY_URL format
    }
  }
  return null;
};

const isCloudinaryConfigured = () => Boolean(parseCloudinaryCredentials());

const signCloudinaryParams = (params, apiSecret) => {
  const sortedKeys = Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== '')
    .sort();
  const stringToSign = sortedKeys.map((k) => `${k}=${params[k]}`).join('&') + apiSecret;
  return crypto.createHash('sha1').update(stringToSign).digest('hex');
};

const uploadToCloudinary = async ({ buffer, cleanFolder, cleanMime, publicIdSlug }) => {
  const creds = parseCloudinaryCredentials();
  if (!creds) return null;

  const timestamp = Math.floor(Date.now() / 1000);
  const folderPath = env.CLOUDINARY_FOLDER_PREFIX
    ? `${env.CLOUDINARY_FOLDER_PREFIX}/${cleanFolder}`
    : cleanFolder;
  const publicId = publicIdSlug;

  const signParams = {
    folder: folderPath,
    public_id: publicId,
    timestamp,
  };
  const signature = signCloudinaryParams(signParams, creds.apiSecret);

  const dataUri = `data:${cleanMime};base64,${buffer.toString('base64')}`;
  const form = new FormData();
  form.append('file', dataUri);
  form.append('api_key', creds.apiKey);
  form.append('timestamp', String(timestamp));
  form.append('folder', folderPath);
  form.append('public_id', publicId);
  form.append('signature', signature);

  const endpoint = `https://api.cloudinary.com/v1_1/${creds.cloudName}/image/upload`;
  const res = await fetch(endpoint, { method: 'POST', body: form });
  const json = await res.json();

  if (!res.ok || !json.secure_url) {
    throw new Error(json?.error?.message || `Cloudinary upload failed (${res.status})`);
  }

  return {
    storageMode: 'cloudinary',
    provider: 'cloudinary',
    cloudName: creds.cloudName,
    bucket: creds.cloudName,
    region: 'global-cdn',
    key: `${cleanFolder}/${path.basename(json.public_id)}`,
    publicId: json.public_id,
    folder: cleanFolder,
    mimeType: cleanMime,
    size: json.bytes || buffer.length,
    url: json.secure_url,
    publicUrl: json.secure_url,
  };
};

const deleteFromCloudinary = async (publicIdOrKey) => {
  const creds = parseCloudinaryCredentials();
  if (!creds || !publicIdOrKey) return false;

  const cleanId = String(publicIdOrKey).replace(/\.[a-z0-9]+$/i, '');
  const fullPublicId =
    env.CLOUDINARY_FOLDER_PREFIX && !cleanId.startsWith(`${env.CLOUDINARY_FOLDER_PREFIX}/`)
      ? `${env.CLOUDINARY_FOLDER_PREFIX}/${cleanId}`
      : cleanId;

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = signCloudinaryParams({ public_id: fullPublicId, timestamp }, creds.apiSecret);

  const form = new FormData();
  form.append('public_id', fullPublicId);
  form.append('api_key', creds.apiKey);
  form.append('timestamp', String(timestamp));
  form.append('signature', signature);

  const endpoint = `https://api.cloudinary.com/v1_1/${creds.cloudName}/image/destroy`;
  const res = await fetch(endpoint, { method: 'POST', body: form });
  return res.ok;
};

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
      getMessage('MEDIA_INVALID_FOLDER', { folder: cleanFolder, allowed: MEDIA_FOLDERS.join(', ') }, lang),
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

/**
 * Generate Signed Upload URL / Params (Cloudinary Signed Upload or Local Multipart Fallback)
 */
const createPresignedUploadUrl = async ({
  folder = 'products',
  fileName = 'upload.jpg',
  mimeType = 'image/jpeg',
  lang = 'vi',
}) => {
  const { cleanFolder, cleanMime } = validateFolderAndMime({ folder, mimeType, lang });
  const { key, publicIdSlug } = buildObjectKey(cleanFolder, fileName, cleanMime);

  const cloudinaryCreds = parseCloudinaryCredentials();
  if (cloudinaryCreds) {
    const timestamp = Math.floor(Date.now() / 1000);
    const folderPath = env.CLOUDINARY_FOLDER_PREFIX
      ? `${env.CLOUDINARY_FOLDER_PREFIX}/${cleanFolder}`
      : cleanFolder;
    const signature = signCloudinaryParams(
      { folder: folderPath, public_id: publicIdSlug, timestamp },
      cloudinaryCreds.apiSecret
    );

    return {
      storageMode: 'cloudinary',
      provider: 'cloudinary',
      uploadMethod: 'POST_CLOUDINARY',
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudinaryCreds.cloudName}/image/upload`,
      publicUrl: `https://res.cloudinary.com/${cloudinaryCreds.cloudName}/image/upload/${folderPath}/${publicIdSlug}`,
      key,
      folder: cleanFolder,
      contentType: cleanMime,
      cloudinaryParams: {
        cloudName: cloudinaryCreds.cloudName,
        apiKey: cloudinaryCreds.apiKey,
        timestamp,
        folder: folderPath,
        publicId: publicIdSlug,
        signature,
      },
      expiresIn: env.MEDIA_SIGNED_EXPIRES_IN,
    };
  }

  return {
    storageMode: 'local-fallback',
    provider: 'local',
    uploadMethod: 'POST_MULTIPART',
    uploadUrl: `${env.BACKEND_PUBLIC_URL}/api/media/upload`,
    publicUrl: `${env.BACKEND_PUBLIC_URL}/uploads/${key}`,
    key,
    folder: cleanFolder,
    contentType: cleanMime,
    expiresIn: env.MEDIA_SIGNED_EXPIRES_IN,
  };
};

const saveToLocalFallback = ({ buffer, key, cleanFolder, cleanMime }) => {
  const targetFilePath = path.join(LOCAL_UPLOAD_ROOT, key);
  fs.mkdirSync(path.dirname(targetFilePath), { recursive: true });
  fs.writeFileSync(targetFilePath, buffer);

  const publicUrl = `${env.BACKEND_PUBLIC_URL}/uploads/${key}`;
  return {
    storageMode: 'local-fallback',
    provider: 'local',
    cloudName: env.CLOUDINARY_CLOUD_NAME || '',
    bucket: env.CLOUDINARY_CLOUD_NAME || 'local-uploads',
    region: 'local',
    key,
    folder: cleanFolder,
    mimeType: cleanMime,
    size: buffer.length,
    url: publicUrl,
    publicUrl,
  };
};

/**
 * Upload file Buffer to Cloudinary (Primary) -> Smart Local Fallback (/uploads/...)
 */
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

  // 1. Primary: Cloudinary
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

  // 2. Fallback: Smart Local Storage (/uploads/...)
  return saveToLocalFallback({ buffer, key, cleanFolder, cleanMime });
};

/**
 * Delete object from Cloudinary or Smart Local Fallback
 */
const deleteMediaObject = async ({ key = '', url = '', lang = 'vi' }) => {
  let resolvedKey = String(key || '').trim();

  if (!resolvedKey && url) {
    const cleanUrl = String(url).trim();
    const uploadsMatch = cleanUrl.match(/\/uploads\/((?:landing|products|materials|custom-previews)\/[^?#]+)/);
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
      getMessage('MEDIA_INVALID_FOLDER', { folder: folderPrefix, allowed: MEDIA_FOLDERS.join(', ') }, lang),
      400,
      'INVALID_MEDIA_FOLDER'
    );
  }

  if (isCloudinaryConfigured()) {
    try {
      await deleteFromCloudinary(resolvedKey);
    } catch (cloudErr) {
      console.warn(`[Cloudinary Delete Warning] Could not delete "${resolvedKey}": ${cloudErr.message}`);
    }
  }

  const localPath = path.join(LOCAL_UPLOAD_ROOT, resolvedKey);
  if (fs.existsSync(localPath)) {
    fs.unlinkSync(localPath);
  }

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
