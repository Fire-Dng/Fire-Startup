import { ENV } from '@/config/env';

const mediaUrl = (key: string): string => {
  const cleanBase = ENV.MEDIA_BASE_URL.replace(/\/+$/, '');
  const cleanKey = key.replace(/^\/+/, '');
  return `${cleanBase}/${cleanKey}`;
};

export const ASSETS = {
  hero: {
    main: mediaUrl('landing/1795542741909-f6df3922-hero-banner.jpg'),
    oceanAerial: mediaUrl('landing/1795542746429-c9e81d6d-net-product.jpg'),
    oceanWaves: mediaUrl('landing/1795542741909-f6df3922-hero-banner.jpg'),
    artisanWeaver: mediaUrl('landing/1795542741909-f6df3922-hero-banner.jpg'),
    fishingNets: mediaUrl('landing/1795542745032-eda1f571-ocean-net.jpg'),
  },
  landing: {
    oceanHero: mediaUrl('landing/1795542741909-f6df3922-hero-banner.jpg'),
    turquoiseSea: mediaUrl('landing/1795542746429-c9e81d6d-net-product.jpg'),
    emeraldWaves: mediaUrl('materials/1795542770817-61390820-shl-cockle-02.jpg'),
    coastalShore: mediaUrl('landing/1795542745032-eda1f571-ocean-net.jpg'),
    deepBlueReef: mediaUrl('materials/1795542771807-71cc1c8b-shl-cowrie-03.jpg'),
    fishingNetClose: mediaUrl('landing/1795542745032-eda1f571-ocean-net.jpg'),
    fishingNetHarbor: mediaUrl('landing/1795542746429-c9e81d6d-net-product.jpg'),
    fishingVillageBoat: mediaUrl('landing/1795542745032-eda1f571-ocean-net.jpg'),
    artisanWeavingHands: mediaUrl('landing/1795542741909-f6df3922-hero-banner.jpg'),
    upcycledNetTexture: mediaUrl('materials/1795542773928-7596955c-crd-knot-01.jpg'),
    processSteps: {
      step1OceanCollection: mediaUrl('landing/1795542745032-eda1f571-ocean-net.jpg'),
      step2NetSorting: mediaUrl('landing/1795542746429-c9e81d6d-net-product.jpg'),
      step3ArtisanWeaving: mediaUrl('landing/1795542741909-f6df3922-hero-banner.jpg'),
      step4FinishedCraft: mediaUrl(
        'products/1795542747440-d392bc68-tui-xach-luoi-dai-duong-son-tra-thumb.jpg'
      ),
    },
    gallery: [
      mediaUrl('products/1795542747440-d392bc68-tui-xach-luoi-dai-duong-son-tra-thumb.jpg'),
      mediaUrl('products/1795542748730-17e3da7d-tui-xach-luoi-dai-duong-son-tra-2.jpg'),
      mediaUrl('products/1795542753324-c7d6e68d-gio-dung-do-luoi-bien-cu-lao-cham-thumb.jpg'),
      mediaUrl('products/1795542767197-cbd7db6f-tui-deo-cheo-luoi-bien-hoi-an-vintage-thumb.jpg'),
      mediaUrl('products/1795542762001-35940bc9-vong-tay-day-luoi-tet-thu-cong-my-khe-thumb.jpg'),
      mediaUrl('products/1795542763029-d06f15f9-bo-phu-kien-charm-vo-so-oc-bien-tu-nhien-thumb.jpg'),
    ],
  },
  products: {
    toteBagMain: mediaUrl(
      'products/1795545303057-caad3437-tui-xach-luoi-dai-duong-son-tra-main.jpg'
    ),
    toteBagAlt: mediaUrl(
      'products/1795545303081-37abcaf8-tui-xach-luoi-dai-duong-son-tra-alt.jpg'
    ),
    meshShoulderBag: mediaUrl(
      'products/1795545303099-45dd62ea-tui-deo-cheo-luoi-bien-hoi-an-vintage.jpg'
    ),
    wovenHandbag: mediaUrl(
      'products/1795545303084-c1020e5a-gio-dung-do-luoi-bien-cu-lao-cham-alt.jpg'
    ),
    marketBasket: mediaUrl(
      'products/1795545303083-1fecdbc2-gio-dung-do-luoi-bien-cu-lao-cham-main.jpg'
    ),
    braidedBracelet: mediaUrl(
      'products/1795545303239-9879423e-vong-tay-day-luoi-tet-thu-cong-my-khe.jpg'
    ),
    zipWallet: mediaUrl(
      'products/1795545303085-2f9a57fc-vi-tien-khoa-keo-soi-luoi-thanh-khe.jpg'
    ),
    oceanVest: mediaUrl(
      'products/1795545303408-b9a48ccb-ao-khoac-gile-luoi-tai-che-hai-van.jpg'
    ),
    shellCharmHolder: mediaUrl(
      'products/1795545303386-070c757f-bo-phu-kien-charm-vo-so-oc-bien-tu-nhien.jpg'
    ),
    coastalJewelry: mediaUrl(
      'products/1795545303248-c7f07c2c-vong-tay-doi-hai-luu-xanh-ngoc.jpg'
    ),
  },
  materials: {
    scallopShell: mediaUrl('materials/1795542769260-d5fb3bf3-shl-scallop-01.jpg'),
    cowrieShell: mediaUrl('materials/1795542771807-71cc1c8b-shl-cowrie-03.jpg'),
    spiralSnail: mediaUrl('materials/1795542770817-61390820-shl-cockle-02.jpg'),
    starfishCharm: mediaUrl('materials/1795542772815-21f42598-bed-pearl-01.jpg'),
  },
  placeholders: {
    product: mediaUrl(
      'products/1795545303057-caad3437-tui-xach-luoi-dai-duong-son-tra-main.jpg'
    ),
    qrCode: ENV.VIETQR_FALLBACK_URL,
  },
} as const;

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
