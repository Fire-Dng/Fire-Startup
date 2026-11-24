import { ENV } from '@/config/env';

const mediaUrl = (key: string): string => {
  const cleanBase = ENV.MEDIA_BASE_URL.replace(/\/+$/, '');
  const cleanKey = key.replace(/^\/+/, '');
  return `${cleanBase}/${cleanKey}`;
};

export const ASSETS = {
  hero: {
    main: mediaUrl('landing/1794196747773-8f48dbf8-hero-banner.jpg'),
    oceanAerial: mediaUrl('landing/1794196752400-49373941-recycling-step-2.jpg'),
    oceanWaves: mediaUrl('landing/1794196747773-8f48dbf8-hero-banner.jpg'),
    artisanWeaver: mediaUrl('landing/1794196754885-c2af6f99-artisan-lanh-avatar.jpg'),
    fishingNets: mediaUrl('landing/1794196749896-4f82463d-ocean-net.jpg'),
  },
  landing: {
    oceanHero: mediaUrl('landing/1794196747773-8f48dbf8-hero-banner.jpg'),
    turquoiseSea: mediaUrl('landing/1794196752400-49373941-recycling-step-2.jpg'),
    emeraldWaves: mediaUrl('materials/1794196760593-6f275285-shl-cockle-02.jpg'),
    coastalShore: mediaUrl('landing/1794196756459-83ea5bec-artisan-avatar-2.jpg'),
    deepBlueReef: mediaUrl('materials/1794196761363-36da91bb-shl-cowrie-03.jpg'),
    fishingNetClose: mediaUrl('landing/1794196749896-4f82463d-ocean-net.jpg'),
    fishingNetHarbor: mediaUrl('landing/1794196755297-f322ade6-workshop-crafting.jpg'),
    fishingVillageBoat: mediaUrl('landing/1794196756459-83ea5bec-artisan-avatar-2.jpg'),
    artisanWeavingHands: mediaUrl('landing/1794196754885-c2af6f99-artisan-lanh-avatar.jpg'),
    upcycledNetTexture: mediaUrl('materials/1794196762117-a0b31a5b-crd-knot-01.jpg'),
    processSteps: {
      step1OceanCollection: mediaUrl('landing/1794196749896-4f82463d-ocean-net.jpg'),
      step2NetSorting: mediaUrl('landing/1794196752400-49373941-recycling-step-2.jpg'),
      step3ArtisanWeaving: mediaUrl('landing/1794196755297-f322ade6-workshop-crafting.jpg'),
      step4FinishedCraft: mediaUrl(
        'products/1794196756807-6bc1252c-tui-xach-luoi-dai-duong-son-tra-thumb.jpg'
      ),
    },
    gallery: [
      mediaUrl('products/1794196756807-6bc1252c-tui-xach-luoi-dai-duong-son-tra-thumb.jpg'),
      mediaUrl('products/1794196757209-9cf5fa65-tui-xach-luoi-dai-duong-son-tra-2.jpg'),
      mediaUrl('products/1794196757534-14829cfe-gio-dung-do-luoi-bien-cu-lao-cham-thumb.jpg'),
      mediaUrl('products/1794196759566-d7cdf222-tui-deo-cheo-luoi-bien-hoi-an-vintage-thumb.jpg'),
      mediaUrl('products/1794196758849-f7e98149-vong-tay-day-luoi-tet-thu-cong-my-khe-thumb.jpg'),
      mediaUrl('products/1794196759170-3dc5da58-bo-phu-kien-charm-vo-so-oc-bien-tu-nhien-thumb.jpg'),
    ],
  },
  products: {
    toteBagMain: mediaUrl(
      'products/1794196756807-6bc1252c-tui-xach-luoi-dai-duong-son-tra-thumb.jpg'
    ),
    toteBagAlt: mediaUrl(
      'products/1794196757209-9cf5fa65-tui-xach-luoi-dai-duong-son-tra-2.jpg'
    ),
    meshShoulderBag: mediaUrl(
      'products/1794196759566-d7cdf222-tui-deo-cheo-luoi-bien-hoi-an-vintage-thumb.jpg'
    ),
    wovenHandbag: mediaUrl(
      'products/1794196757857-83712507-gio-dung-do-luoi-bien-cu-lao-cham-2.jpg'
    ),
    marketBasket: mediaUrl(
      'products/1794196757534-14829cfe-gio-dung-do-luoi-bien-cu-lao-cham-thumb.jpg'
    ),
    braidedBracelet: mediaUrl(
      'products/1794196758849-f7e98149-vong-tay-day-luoi-tet-thu-cong-my-khe-thumb.jpg'
    ),
    zipWallet: mediaUrl(
      'products/1794196758186-4f750e12-vi-tien-khoa-keo-soi-luoi-thanh-khe-thumb.jpg'
    ),
    oceanVest: mediaUrl(
      'products/1794196758517-aae9e898-ao-khoac-gile-luoi-tai-che-hai-van-thumb.jpg'
    ),
    shellCharmHolder: mediaUrl(
      'products/1794196759170-3dc5da58-bo-phu-kien-charm-vo-so-oc-bien-tu-nhien-thumb.jpg'
    ),
    coastalJewelry: mediaUrl(
      'products/1794196759891-3fe67342-vong-tay-doi-hai-luu-xanh-ngoc-thumb.jpg'
    ),
  },
  materials: {
    scallopShell: mediaUrl('materials/1794196760274-2acd6510-shl-scallop-01.jpg'),
    cowrieShell: mediaUrl('materials/1794196761363-36da91bb-shl-cowrie-03.jpg'),
    spiralSnail: mediaUrl('materials/1794196760593-6f275285-shl-cockle-02.jpg'),
    starfishCharm: mediaUrl('materials/1794196761741-1c18332a-bed-pearl-01.jpg'),
  },
  placeholders: {
    product: mediaUrl(
      'products/1794196756807-6bc1252c-tui-xach-luoi-dai-duong-son-tra-thumb.jpg'
    ),
    qrCode: ENV.VIETQR_FALLBACK_URL,
  },
} as const;

/**
 * Resolves any asset URL seamlessly across:
 * 1. Full AWS S3 / CloudFront / HTTPS URLs (`https://...`, `http://...`, `data:...`, `blob:...`)
 * 2. Relative backend upload paths (`/uploads/...` -> resolved against API origin)
 * 3. Relative S3 object keys (`landing/...`, `products/...` -> resolved against ENV.S3_BASE_URL)
 * 4. Fallback to provided default or `ASSETS.placeholders.product`
 */
export function resolveAssetUrl(
  urlOrPath?: string | null,
  fallbackUrl: string = ASSETS.placeholders.product
): string {
  const raw = (urlOrPath || '').trim();
  if (!raw) return fallbackUrl;

  if (
    raw.startsWith('http://') ||
    raw.startsWith('https://') ||
    raw.startsWith('data:') ||
    raw.startsWith('blob:')
  ) {
    return raw;
  }

  // Relative local upload path from backend (`/uploads/...`)
  if (raw.startsWith('/uploads/')) {
    const apiBase = ENV.API_URL.replace(/\/api\/?$/, '');
    return apiBase ? `${apiBase}${raw}` : raw;
  }

  // Relative media key when NEXT_PUBLIC_MEDIA_BASE_URL is configured
  if (ENV.MEDIA_BASE_URL) {
    const cleanBase = ENV.MEDIA_BASE_URL.replace(/\/+$/, '');
    const cleanKey = raw.replace(/^\/+/, '');
    return `${cleanBase}/${cleanKey}`;
  }

  return raw;
}
