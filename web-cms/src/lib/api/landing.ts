import { LandingContent } from '@/types';
import { ASSETS } from '@/config/assets';
import { FALLBACK_LANDING_CONTENT } from '@/data/fallback';
import { fetchApi, getAdminAuthHeaders } from './client';

function normalizeLandingContent(raw?: Partial<LandingContent> | null): LandingContent {
  if (!raw) return FALLBACK_LANDING_CONTENT;

  const heroBanner = {
    title: raw.heroBanner?.title || raw.heroTitle || FALLBACK_LANDING_CONTENT.heroTitle,
    subtitle:
      raw.heroBanner?.subtitle || raw.heroSubtitle || FALLBACK_LANDING_CONTENT.heroSubtitle,
    ctaText:
      raw.heroBanner?.ctaText || raw.heroCtaPrimary || FALLBACK_LANDING_CONTENT.heroCtaPrimary,
    ctaLink: raw.heroBanner?.ctaLink || '/shop',
    backgroundImageUrl:
      raw.heroBanner?.backgroundImageUrl ||
      FALLBACK_LANDING_CONTENT.heroBanner?.backgroundImageUrl ||
      ASSETS.landing.oceanHero,
    secondaryImageUrl:
      raw.heroBanner?.secondaryImageUrl ||
      FALLBACK_LANDING_CONTENT.heroBanner?.secondaryImageUrl ||
      ASSETS.landing.fishingNetClose,
    tertiaryImageUrl:
      raw.heroBanner?.tertiaryImageUrl ||
      FALLBACK_LANDING_CONTENT.heroBanner?.tertiaryImageUrl ||
      ASSETS.products.toteBagMain,
  };

  const processSteps =
    raw.processSteps && raw.processSteps.length > 0
      ? raw.processSteps
      : (raw.recyclingSteps || FALLBACK_LANDING_CONTENT.recyclingSteps).map((step, idx) => ({
          stepNumber: step.stepNumber || idx + 1,
          title: step.title,
          description: step.description,
          badgeText: step.badgeText,
          imageUrl:
            step.imageUrl ||
            FALLBACK_LANDING_CONTENT.processSteps?.[idx]?.imageUrl ||
            ASSETS.landing.oceanHero,
        }));

  const recyclingSteps =
    raw.recyclingSteps && raw.recyclingSteps.length > 0
      ? raw.recyclingSteps.map((step, idx) => ({
          ...step,
          imageUrl: step.imageUrl || processSteps[idx]?.imageUrl || ASSETS.landing.oceanHero,
        }))
      : processSteps.map((step) => ({
          stepNumber: step.stepNumber,
          title: step.title,
          description: step.description,
          badgeText: step.badgeText || `Step 0${step.stepNumber}`,
          imageUrl: step.imageUrl,
        }));

  const galleryImages =
    raw.galleryImages && raw.galleryImages.length > 0
      ? raw.galleryImages
      : FALLBACK_LANDING_CONTENT.galleryImages || [...ASSETS.landing.gallery];

  const rawArtisan = raw.artisanStory || FALLBACK_LANDING_CONTENT.artisanStory;
  const artisanStory = {
    headline:
      rawArtisan.headline ||
      rawArtisan.heading ||
      FALLBACK_LANDING_CONTENT.artisanStory.headline,
    heading:
      rawArtisan.heading ||
      rawArtisan.headline ||
      FALLBACK_LANDING_CONTENT.artisanStory.headline,
    villageName: rawArtisan.villageName || FALLBACK_LANDING_CONTENT.artisanStory.villageName,
    quote: rawArtisan.quote || FALLBACK_LANDING_CONTENT.artisanStory.quote,
    body: rawArtisan.body || rawArtisan.bodyText || FALLBACK_LANDING_CONTENT.artisanStory.body,
    bodyText:
      rawArtisan.bodyText || rawArtisan.body || FALLBACK_LANDING_CONTENT.artisanStory.body,
    artisanName: rawArtisan.artisanName || FALLBACK_LANDING_CONTENT.artisanStory.artisanName,
    artisanRole: rawArtisan.artisanRole || FALLBACK_LANDING_CONTENT.artisanStory.artisanRole,
    avatarUrl:
      rawArtisan.avatarUrl ||
      FALLBACK_LANDING_CONTENT.artisanStory.avatarUrl ||
      ASSETS.hero.artisanWeaver,
    workshopImageUrl:
      rawArtisan.workshopImageUrl ||
      FALLBACK_LANDING_CONTENT.artisanStory.workshopImageUrl ||
      ASSETS.landing.fishingNetHarbor,
  };

  return {
    heroTitle: raw.heroTitle || heroBanner.title,
    heroSubtitle: raw.heroSubtitle || heroBanner.subtitle,
    heroCtaPrimary: raw.heroCtaPrimary || heroBanner.ctaText || 'Khám Phá Cửa Hàng Xanh',
    heroCtaSecondary: raw.heroCtaSecondary || FALLBACK_LANDING_CONTENT.heroCtaSecondary,
    heroBanner,
    impactCounters: raw.impactCounters || FALLBACK_LANDING_CONTENT.impactCounters,
    recyclingSteps,
    processSteps,
    galleryImages,
    artisanStory,
  };
}

export async function getLandingContent(): Promise<LandingContent> {
  try {
    const res = await fetchApi<LandingContent>('/content/landing');
    if (res?.data) {
      return normalizeLandingContent(res.data);
    }
    return FALLBACK_LANDING_CONTENT;
  } catch {
    return FALLBACK_LANDING_CONTENT;
  }
}

export async function updateLandingContent(
  payload: Partial<LandingContent>
): Promise<LandingContent> {
  const authHeaders = await getAdminAuthHeaders();
  try {
    const res = await fetchApi<LandingContent>('/admin/landing', {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(payload),
    });
    return normalizeLandingContent(res.data);
  } catch {
    const res = await fetchApi<LandingContent>('/content/landing', {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(payload),
    });
    return normalizeLandingContent(res.data);
  }
}
