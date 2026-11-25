export interface LandingHeroBanner {
  title: string;
  subtitle: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundImageUrl: string;
  secondaryImageUrl?: string;
  tertiaryImageUrl?: string;
}

export interface LandingProcessStep {
  stepNumber: number;
  title: string;
  description: string;
  imageUrl: string;
  badgeText?: string;
}

export interface LandingContent {
  heroTitle: string;
  heroSubtitle: string;
  heroCtaPrimary: string;
  heroCtaSecondary: string;
  heroBanner?: LandingHeroBanner;
  impactCounters: {
    netsCollectedKg: number;
    marineLifeSaved: number;
    upcycledProductsCreated: number;
    localArtisansSupported: number;
  };
  recyclingSteps: Array<{
    stepNumber: number;
    title: string;
    description: string;
    badgeText: string;
    imageUrl?: string;
  }>;
  processSteps?: LandingProcessStep[];
  galleryImages?: string[];
  artisanStory: {
    headline: string;
    heading?: string;
    villageName: string;
    quote: string;
    body: string;
    bodyText?: string;
    artisanName: string;
    artisanRole: string;
    avatarUrl?: string;
    workshopImageUrl?: string;
  };
}
