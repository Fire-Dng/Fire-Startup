export type MediaStorageFolder =
  | 'landing'
  | 'products'
  | 'materials'
  | 'custom-previews';

export interface MediaStorageStatus {
  storageMode: 'cloudinary' | 'local-fallback';
  provider?: 'cloudinary' | 'local';
  isCloudinaryConfigured?: boolean;
  cloudName?: string;
  bucket: string;
  region: string;
  publicBaseUrl: string;
  maxFileSizeMb: number;
  folders: string[];
}

export interface MediaUploadResult {
  url: string;
  publicUrl?: string;
  key: string;
  publicId?: string;
  folder: string;
  storageMode: 'cloudinary' | 'local-fallback';
  contentType: string;
  size?: number;
}

export interface PresignedUrlResult {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  folder: string;
  expiresIn?: number;
}
