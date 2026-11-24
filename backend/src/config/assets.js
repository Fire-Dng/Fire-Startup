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

const DEFAULT_CLOUDINARY_BASE = 'https://res.cloudinary.com/fbemz6fi/image/upload/wavo';

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
  return DEFAULT_CLOUDINARY_BASE;
};

const resolveMediaUrl = (key) => {
  const cleanKey = String(key || '').replace(/^\/+/, '');
  return `${resolveMediaPublicBaseUrl()}/${cleanKey}`;
};

const LANDING_ASSETS = {
  HERO_BANNER: resolveMediaUrl('landing/1795542741909-f6df3922-hero-banner.jpg'),
  OCEAN_NET_RECOVERY: resolveMediaUrl('landing/1795542745032-eda1f571-ocean-net.jpg'),
  TURQUOISE_SEA_WAVE: resolveMediaUrl('landing/1795542746429-c9e81d6d-net-product.jpg'),
  CORAL_REEF_LIFE: resolveMediaUrl('materials/1795542771807-71cc1c8b-shl-cowrie-03.jpg'),
  ARTISAN_LANH_AVATAR: resolveMediaUrl('landing/1795542741909-f6df3922-hero-banner.jpg'),
  ARTISAN_YEN_AVATAR: resolveMediaUrl('landing/1795542745032-eda1f571-ocean-net.jpg'),
  WORKSHOP_CRAFTING: resolveMediaUrl('landing/1795542746429-c9e81d6d-net-product.jpg'),
};

const PRODUCT_ASSETS = {
  TOTE_BAG_SON_TRA_MAIN: resolveMediaUrl('products/1795542747440-d392bc68-tui-xach-luoi-dai-duong-son-tra-thumb.jpg'),
  TOTE_BAG_SON_TRA_ALT: resolveMediaUrl('products/1795542748730-17e3da7d-tui-xach-luoi-dai-duong-son-tra-2.jpg'),
  BASKET_CU_LAO_CHAM: resolveMediaUrl('products/1795542753324-c7d6e68d-gio-dung-do-luoi-bien-cu-lao-cham-thumb.jpg'),
  BASKET_CU_LAO_ALT: resolveMediaUrl('products/1795542754343-7e3c4a34-gio-dung-do-luoi-bien-cu-lao-cham-2.jpg'),
  WALLET_THANH_KHE: resolveMediaUrl('products/1795542755473-14fe3da8-vi-tien-khoa-keo-soi-luoi-thanh-khe-thumb.jpg'),
  VEST_HAI_VAN: resolveMediaUrl('products/1795542759144-5b9994ca-ao-khoac-gile-luoi-tai-che-hai-van-thumb.jpg'),
  BRACELET_MY_KHE: resolveMediaUrl('products/1795542762001-35940bc9-vong-tay-day-luoi-tet-thu-cong-my-khe-thumb.jpg'),
  SHELL_CHARM_SET: resolveMediaUrl('products/1795542763029-d06f15f9-bo-phu-kien-charm-vo-so-oc-bien-tu-nhien-thumb.jpg'),
  CROSSBODY_HOI_AN: resolveMediaUrl('products/1795542767197-cbd7db6f-tui-deo-cheo-luoi-bien-hoi-an-vintage-thumb.jpg'),
  BRACELET_HAI_LUU: resolveMediaUrl('products/1795542768222-821bd09a-vong-tay-doi-hai-luu-xanh-ngoc-thumb.jpg'),
};

const MATERIAL_ASSETS = {
  SHELL_CLOSEUP: resolveMediaUrl('materials/1795542769260-d5fb3bf3-shl-scallop-01.jpg'),
  BEACH_WAVE: resolveMediaUrl('materials/1795542770817-61390820-shl-cockle-02.jpg'),
  OCEAN_CORAL: resolveMediaUrl('materials/1795542771807-71cc1c8b-shl-cowrie-03.jpg'),
  PEARL_CRAFT: resolveMediaUrl('materials/1795542772815-21f42598-bed-pearl-01.jpg'),
  NET_CORD: resolveMediaUrl('materials/1795542773928-7596955c-crd-knot-01.jpg'),
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
