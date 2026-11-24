function normalizeApiBaseUrl(rawUrl?: string): string {
  const fallback = 'http://localhost:5000/api';
  const trimmed = (rawUrl || fallback).trim().replace(/\/+$/, '');
  if (!trimmed) return fallback;
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

export const ENV = {
  API_URL: normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL),
  STORE_URL: (process.env.NEXT_PUBLIC_STORE_URL || 'http://localhost:3000').replace(/\/+$/, ''),
  CMS_URL: (process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3002').replace(/\/+$/, ''),
  CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'fbemz6fi',
  CLOUDINARY_UPLOAD_PRESET: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '',
  MEDIA_BASE_URL:
    process.env.NEXT_PUBLIC_MEDIA_BASE_URL ||
    process.env.NEXT_PUBLIC_CLOUDINARY_BASE_URL ||
    'https://res.cloudinary.com/fbemz6fi/image/upload/wavo',
  VIETQR_FALLBACK_URL:
    process.env.NEXT_PUBLIC_VIETQR_FALLBACK_URL ||
    'https://img.vietqr.io/image/MB-0905123456-compact2.png',
  DEFAULT_ADMIN_EMAIL: process.env.NEXT_PUBLIC_DEFAULT_ADMIN_EMAIL || 'admin@dtu-upcycled.vn',
  DEFAULT_ADMIN_PASSWORD: process.env.NEXT_PUBLIC_DEFAULT_ADMIN_PASSWORD || 'Password123!',
  KEEP_ALIVE_MINUTES: Number(process.env.NEXT_PUBLIC_KEEP_ALIVE_MINUTES) || 8,
} as const;
