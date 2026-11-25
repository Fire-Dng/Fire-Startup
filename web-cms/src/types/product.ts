import type { ProductCategory } from './category';

export interface ProductModel3D {
  meshPreset: string;
  glbUrl?: string;
  defaultBaseColor: string;
  defaultStrapColor: string;
  availableColors?: string[];
  allowSurfacePlacement?: boolean;
}

export interface ProductEcoImpact {
  netWeightGrams: number;
  originSea: string;
  recycledPlasticPct: number;
  artisanGroup: string;
  co2SavedGrams?: number;
}

export interface Product {
  _id: string;
  name: string;
  nameEn?: string;
  slug: string;
  sku?: string;
  category: ProductCategory;
  shortDescription: string;
  shortDescriptionEn?: string;
  description: string;
  descriptionEn?: string;
  basePrice: number;
  craftFee: number;
  stock: number;
  image?: string;
  imageUrl?: string;
  imagePublicId?: string;
  images: string[];
  thumbnail?: string;
  isCustomizable: boolean;
  isFeatured?: boolean;
  isActive: boolean;
  sizes?: string[];
  colors?: string[];
  model3D: ProductModel3D;
  ecoImpact: ProductEcoImpact;
  createdAt?: string;
  updatedAt?: string;
}
