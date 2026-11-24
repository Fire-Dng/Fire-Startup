export const ENV = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  STORE_URL: process.env.NEXT_PUBLIC_STORE_URL || 'http://localhost:3000',
  CMS_URL: process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3002',
  CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_UPLOAD_PRESET: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '',
  MEDIA_BASE_URL:
    process.env.NEXT_PUBLIC_MEDIA_BASE_URL ||
    process.env.NEXT_PUBLIC_CLOUDINARY_BASE_URL ||
    'https://dtu-img-db-868017909899-ap-southeast-2-an.s3.ap-southeast-2.amazonaws.com',
  VIETQR_FALLBACK_URL:
    process.env.NEXT_PUBLIC_VIETQR_FALLBACK_URL ||
    'https://img.vietqr.io/image/MB-0905123456-compact2.png',
  DEFAULT_ADMIN_EMAIL: process.env.NEXT_PUBLIC_DEFAULT_ADMIN_EMAIL || 'admin@dtu-upcycled.vn',
  DEFAULT_ADMIN_PASSWORD: process.env.NEXT_PUBLIC_DEFAULT_ADMIN_PASSWORD || 'Password123!',
  KEEP_ALIVE_MINUTES: Number(process.env.NEXT_PUBLIC_KEEP_ALIVE_MINUTES) || 8,
} as const;
