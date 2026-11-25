const fs = require('fs');
const path = require('path');
const env = require('../../config/env');
const { MEDIA_FOLDERS } = require('../../config/assets');

const LOCAL_UPLOAD_ROOT = path.resolve(__dirname, '../../../uploads');

for (const folder of MEDIA_FOLDERS) {
  const dirPath = path.join(LOCAL_UPLOAD_ROOT, folder);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

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

const deleteFromLocalFallback = (resolvedKey) => {
  const localPath = path.join(LOCAL_UPLOAD_ROOT, resolvedKey);
  if (fs.existsSync(localPath)) {
    fs.unlinkSync(localPath);
  }
};

module.exports = {
  LOCAL_UPLOAD_ROOT,
  saveToLocalFallback,
  deleteFromLocalFallback,
};
