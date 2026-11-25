export type ProductCategory =
  | 'basket'
  | 'bag'
  | 'wallet'
  | 'apparel'
  | 'bracelet'
  | 'accessory'
  | string;

export interface CategoryItem {
  _id: string;
  name: string;
  nameEn?: string;
  slug: string;
  type: 'product' | 'material';
  meshPresetDefault?: string;
  description?: string;
  image?: string;
  sortOrder: number;
  isActive: boolean;
  itemCount?: number;
  totalStock?: number;
  createdAt?: string;
  updatedAt?: string;
}
