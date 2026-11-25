const path = require('path');
const env = require('../../config/env');
const { parseCloudinaryCredentials, signCloudinaryParams } = require('./credentials');
const { validateFolderAndMime, buildObjectKey } = require('./validation');

const uploadToCloudinary = async ({ buffer, cleanFolder, cleanMime, publicIdSlug }) => {
  const creds = parseCloudinaryCredentials();
  if (!creds) return null;

  const timestamp = Math.floor(Date.now() / 1000);
  const folderPath = env.CLOUDINARY_FOLDER_PREFIX
    ? `${env.CLOUDINARY_FOLDER_PREFIX}/${cleanFolder}`
    : cleanFolder;

  const signature = signCloudinaryParams(
    { folder: folderPath, public_id: publicIdSlug, timestamp },
    creds.apiSecret
  );

  const dataUri = `data:${cleanMime};base64,${buffer.toString('base64')}`;
  const form = new FormData();
  form.append('file', dataUri);
  form.append('api_key', creds.apiKey);
  form.append('timestamp', String(timestamp));
  form.append('folder', folderPath);
  form.append('public_id', publicIdSlug);
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

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  createPresignedUploadUrl,
};
