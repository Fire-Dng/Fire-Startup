export type MaterialCategory =
  | 'shell'
  | 'snail'
  | 'charm'
  | 'bead'
  | 'cord';

export interface BraceletConfig {
  wristSizeCm: number;
  slotCount: number;
  cordMaterial?: string;
}

export interface CustomMaterial {
  _id: string;
  name: string;
  code?: string;
  materialType: MaterialCategory;
  description?: string;
  unitPrice: number;
  stockQuantity: number;
  colorHex: string;
  thumbnail?: string;
  isActive: boolean;
  model3D: {
    meshPreset: string;
    glbUrl?: string;
    defaultScale?: number;
  };
}

export interface Placement3D {
  placementId: string;
  materialId: string;
  materialName: string;
  materialType?: MaterialCategory | string;
  meshPreset: string;
  glbUrl?: string;
  unitPrice: number;
  position: [number, number, number];
  normal: [number, number, number];
  rotation: number;
  scale: number;
  color: string;
  slotIndex?: number;
  isDanglingCharm?: boolean;
}

export interface CustomDesignSnapshot {
  _id?: string;
  productId: string;
  productName: string;
  productSlug: string;
  meshPreset: string;
  glbUrl?: string;
  baseColor: string;
  strapColor: string;
  braceletConfig?: BraceletConfig;
  previewImageUrl?: string;
  artisanNote?: string;
  placements: Placement3D[];
  basePrice: number;
  craftFee: number;
  materialsTotal: number;
  estimatedPrice: number;
}
