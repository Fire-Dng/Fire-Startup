/**
 * Centralized Media, Images, Cloudinary Folders & QR URL Registry for Backend
 */
const env = require('./env');

const MEDIA_FOLDERS = ['landing', 'products', 'materials', 'custom-previews'];

const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
];

const DEFAULT_MEDIA_CDN_BASE = 'https://dtu-img-db-868017909899-ap-southeast-2-an.s3.ap-southeast-2.amazonaws.com';

const resolveMediaPublicBaseUrl = () => {
  if (env.MEDIA_PUBLIC_BASE_URL) {
    return env.MEDIA_PUBLIC_BASE_URL;
  }
  if (
    env.CLOUDINARY_CLOUD_NAME &&
    env.CLOUDINARY_CLOUD_NAME !== 'your-cloud-name'
  ) {
    const prefix = env.CLOUDINARY_FOLDER_PREFIX ? `/${env.CLOUDINARY_FOLDER_PREFIX}` : '';
    return `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/image/upload${prefix}`;
  }
  return DEFAULT_MEDIA_CDN_BASE;
};

const resolveMediaUrl = (key) => {
  const cleanKey = String(key || '').replace(/^\/+/, '');
  return `${resolveMediaPublicBaseUrl()}/${cleanKey}`;
};

const LANDING_ASSETS = {
  HERO_BANNER: resolveMediaUrl('landing/1794196747773-8f48dbf8-hero-banner.jpg'),
  OCEAN_NET_RECOVERY: resolveMediaUrl('landing/1794196749896-4f82463d-ocean-net.jpg'),
  TURQUOISE_SEA_WAVE: resolveMediaUrl('landing/1794196752400-49373941-recycling-step-2.jpg'),
  CORAL_REEF_LIFE: resolveMediaUrl('materials/1794196761363-36da91bb-shl-cowrie-03.jpg'),
  ARTISAN_LANH_AVATAR: resolveMediaUrl('landing/1794196754885-c2af6f99-artisan-lanh-avatar.jpg'),
  ARTISAN_YEN_AVATAR: resolveMediaUrl('landing/1794196756459-83ea5bec-artisan-avatar-2.jpg'),
  WORKSHOP_CRAFTING: resolveMediaUrl('landing/1794196755297-f322ade6-workshop-crafting.jpg'),
};

const PRODUCT_ASSETS = {
  TOTE_BAG_SON_TRA_MAIN: resolveMediaUrl('products/1794196756807-6bc1252c-tui-xach-luoi-dai-duong-son-tra-thumb.jpg'),
  TOTE_BAG_SON_TRA_ALT: resolveMediaUrl('products/1794196757209-9cf5fa65-tui-xach-luoi-dai-duong-son-tra-2.jpg'),
  BASKET_CU_LAO_CHAM: resolveMediaUrl('products/1794196757534-14829cfe-gio-dung-do-luoi-bien-cu-lao-cham-thumb.jpg'),
  BASKET_CU_LAO_ALT: resolveMediaUrl('products/1794196757857-83712507-gio-dung-do-luoi-bien-cu-lao-cham-2.jpg'),
  WALLET_THANH_KHE: resolveMediaUrl('products/1794196758186-4f750e12-vi-tien-khoa-keo-soi-luoi-thanh-khe-thumb.jpg'),
  VEST_HAI_VAN: resolveMediaUrl('products/1794196758517-aae9e898-ao-khoac-gile-luoi-tai-che-hai-van-thumb.jpg'),
  BRACELET_MY_KHE: resolveMediaUrl('products/1794196758849-f7e98149-vong-tay-day-luoi-tet-thu-cong-my-khe-thumb.jpg'),
  SHELL_CHARM_SET: resolveMediaUrl('products/1794196759170-3dc5da58-bo-phu-kien-charm-vo-so-oc-bien-tu-nhien-thumb.jpg'),
  CROSSBODY_HOI_AN: resolveMediaUrl('products/1794196759566-d7cdf222-tui-deo-cheo-luoi-bien-hoi-an-vintage-thumb.jpg'),
  BRACELET_HAI_LUU: resolveMediaUrl('products/1794196759891-3fe67342-vong-tay-doi-hai-luu-xanh-ngoc-thumb.jpg'),
};

const MATERIAL_ASSETS = {
  SHELL_CLOSEUP: resolveMediaUrl('materials/1794196760274-2acd6510-shl-scallop-01.jpg'),
  BEACH_WAVE: resolveMediaUrl('materials/1794196760593-6f275285-shl-cockle-02.jpg'),
  OCEAN_CORAL: resolveMediaUrl('materials/1794196761363-36da91bb-shl-cowrie-03.jpg'),
  PEARL_CRAFT: resolveMediaUrl('materials/1794196761741-1c18332a-bed-pearl-01.jpg'),
  NET_CORD: resolveMediaUrl('materials/1794196762117-a0b31a5b-crd-knot-01.jpg'),
};

/**
 * Generates dynamic VietQR image URL using centralized env config
 */
const buildVietQrImageUrl = ({
  bankId = env.VIETQR_BANK_ID,
  accountNo = env.VIETQR_ACCOUNT_NO,
  template = env.VIETQR_TEMPLATE,
  amount = 0,
  transferContent = '',
  accountName = env.VIETQR_ACCOUNT_NAME,
}) => {
  const encodedName = encodeURIComponent(accountName);
  const encodedContent = encodeURIComponent(transferContent);
  return `${env.VIETQR_BASE_URL}/${bankId}-${accountNo}-${template}.png?amount=${amount}&addInfo=${encodedContent}&accountName=${encodedName}`;
};

module.exports = {
  MEDIA_FOLDERS,
  ALLOWED_IMAGE_MIME_TYPES,
  resolveMediaPublicBaseUrl,
  resolveMediaUrl,
  LANDING_ASSETS,
  PRODUCT_ASSETS,
  MATERIAL_ASSETS,
  buildVietQrImageUrl,
};
