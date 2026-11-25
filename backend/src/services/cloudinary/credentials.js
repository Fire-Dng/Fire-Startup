const crypto = require('crypto');
const env = require('../../config/env');

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

module.exports = {
  parseCloudinaryCredentials,
  isCloudinaryConfigured,
  signCloudinaryParams,
};
