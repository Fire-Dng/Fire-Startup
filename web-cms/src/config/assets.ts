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
      'products/1795542747440-d392bc68-tui-xach-luoi-dai-duong-son-tra-thumb.jpg'
    ),
    toteBagAlt: mediaUrl(
      'products/1795542748730-17e3da7d-tui-xach-luoi-dai-duong-son-tra-2.jpg'
    ),
    meshShoulderBag: mediaUrl(
      'products/1795542767197-cbd7db6f-tui-deo-cheo-luoi-bien-hoi-an-vintage-thumb.jpg'
    ),
    wovenHandbag: mediaUrl(
      'products/1795542754343-7e3c4a34-gio-dung-do-luoi-bien-cu-lao-cham-2.jpg'
    ),
    marketBasket: mediaUrl(
      'products/1795542753324-c7d6e68d-gio-dung-do-luoi-bien-cu-lao-cham-thumb.jpg'
    ),
    braidedBracelet: mediaUrl(
      'products/1795542762001-35940bc9-vong-tay-day-luoi-tet-thu-cong-my-khe-thumb.jpg'
    ),
    zipWallet: mediaUrl(
      'products/1795542755473-14fe3da8-vi-tien-khoa-keo-soi-luoi-thanh-khe-thumb.jpg'
    ),
    oceanVest: mediaUrl(
      'products/1795542759144-5b9994ca-ao-khoac-gile-luoi-tai-che-hai-van-thumb.jpg'
    ),
    shellCharmHolder: mediaUrl(
      'products/1795542763029-d06f15f9-bo-phu-kien-charm-vo-so-oc-bien-tu-nhien-thumb.jpg'
    ),
    coastalJewelry: mediaUrl(
      'products/1795542768222-821bd09a-vong-tay-doi-hai-luu-xanh-ngoc-thumb.jpg'
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
      'products/1795542747440-d392bc68-tui-xach-luoi-dai-duong-son-tra-thumb.jpg'
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
