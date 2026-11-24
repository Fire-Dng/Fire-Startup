/**
 * Cloudinary Media Synchronization Script (`npm run cloudinary:sync`)
 * Downloads initial sample images for LandingContent, Products, and CustomMaterials,
 * uploads them to the configured Cloudinary account under `wavo/landing/`, `wavo/products/`, `wavo/materials/`,
 * and updates MongoDB documents with the new Cloudinary URLs.
 */
const mongoose = require('mongoose');
const env = require('../config/env');
const { connectDB } = require('../config/db');
const { isCloudinaryConfigured, uploadMediaBuffer } = require('../services/cloudinary.service');
const LandingContent = require('../models/LandingContent');
const Product = require('../models/Product');
const CustomMaterial = require('../models/CustomMaterial');

const urlCache = new Map();

const fetchAndUploadToCloudinary = async (sourceUrl, folder, fileNameHint) => {
  if (!sourceUrl || typeof sourceUrl !== 'string' || !sourceUrl.startsWith('http')) {
    return sourceUrl;
  }
  if (env.CLOUDINARY_CLOUD_NAME && sourceUrl.includes(`res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}`)) {
    return sourceUrl;
  }

  const cacheKey = `${folder}:${sourceUrl}`;
  if (urlCache.has(cacheKey)) {
    return urlCache.get(cacheKey);
  }

  const res = await fetch(sourceUrl);
  if (!res.ok) {
    console.warn(`[Cloudinary Sync] Skipping unreachable URL (${res.status}): ${sourceUrl}`);
    return sourceUrl;
  }

  const contentType = res.headers.get('content-type') || 'image/jpeg';
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const uploaded = await uploadMediaBuffer({
    buffer,
    originalName: fileNameHint || 'synced-image.jpg',
    mimeType: contentType.split(';')[0].trim(),
    size: buffer.length,
    folder,
  });

  console.log(`  ✔ Uploaded [${folder}] -> ${uploaded.publicUrl}`);
  urlCache.set(cacheKey, uploaded.publicUrl);
  return uploaded.publicUrl;
};

const runCloudinarySync = async () => {
  console.log('====================================================================');
  console.log('🌊 DTU COASTAL CRAFT — CLOUDINARY MEDIA SYNCHRONIZATION TOOL');
  console.log('====================================================================');

  if (!isCloudinaryConfigured()) {
    console.log('ℹ Cloudinary credentials (CLOUDINARY_URL hoặc CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET) chưa được điền trong .env.');
    console.log('  Hệ thống hiện đang hoạt động ở chế độ Smart Local Fallback (/uploads/...).');
    console.log('  Để đồng bộ toàn bộ ảnh mẫu lên Cloudinary:');
    console.log('  1. Điền CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET vào backend/.env');
    console.log('  2. Chạy lại lệnh: npm run cloudinary:sync');
    return;
  }

  await connectDB();
  console.log(`[Cloudinary Sync] Đang đồng bộ hình ảnh lên Cloudinary (${env.CLOUDINARY_CLOUD_NAME})...`);

  // 1. Sync LandingContent
  const landing = await LandingContent.findOne({ key: 'main_landing' });
  if (landing) {
    console.log('\n[1/3] Đồng bộ hình ảnh LandingContent...');
    const heroBg = await fetchAndUploadToCloudinary(
      landing.hero?.heroImage || landing.heroBanner?.backgroundImageUrl,
      'landing',
      'hero-banner.jpg'
    );
    const heroSec = await fetchAndUploadToCloudinary(
      landing.hero?.secondaryImageUrl || landing.heroBanner?.secondaryImageUrl,
      'landing',
      'ocean-net.jpg'
    );
    const heroTer = await fetchAndUploadToCloudinary(
      landing.hero?.tertiaryImageUrl || landing.heroBanner?.tertiaryImageUrl,
      'landing',
      'net-product.jpg'
    );

    landing.hero.heroImage = heroBg;
    landing.hero.secondaryImageUrl = heroSec;
    landing.hero.tertiaryImageUrl = heroTer;
    landing.heroBanner.backgroundImageUrl = heroBg;
    landing.heroBanner.secondaryImageUrl = heroSec;
    landing.heroBanner.tertiaryImageUrl = heroTer;

    await landing.save();
  }

  // 2. Sync Products
  const products = await Product.find();
  console.log(`\n[2/3] Đồng bộ hình ảnh cho ${products.length} Products...`);
  for (const prod of products) {
    const primaryUrl = await fetchAndUploadToCloudinary(
      prod.image || prod.imageUrl || prod.thumbnail,
      'products',
      `${prod.slug}-thumb.jpg`
    );
    prod.image = primaryUrl;
    prod.imageUrl = primaryUrl;
    prod.thumbnail = primaryUrl;
    if (Array.isArray(prod.images)) {
      const newImgs = [];
      for (let i = 0; i < prod.images.length; i++) {
        newImgs.push(await fetchAndUploadToCloudinary(prod.images[i], 'products', `${prod.slug}-${i + 1}.jpg`));
      }
      prod.images = newImgs;
    }
    await prod.save();
  }

  // 3. Sync CustomMaterials
  const materials = await CustomMaterial.find();
  console.log(`\n[3/3] Đồng bộ hình ảnh cho ${materials.length} CustomMaterials...`);
  for (const mat of materials) {
    mat.thumbnail = await fetchAndUploadToCloudinary(mat.thumbnail, 'materials', `${mat.code.toLowerCase()}.jpg`);
    await mat.save();
  }

  console.log('\n✅ Hoàn tất đồng bộ toàn bộ hình ảnh lên Cloudinary và cập nhật MongoDB!');
};

if (require.main === module) {
  runCloudinarySync()
    .then(async () => {
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('[Cloudinary Sync Error]:', err);
      await mongoose.disconnect();
      process.exit(1);
    });
}

module.exports = { runCloudinarySync };
