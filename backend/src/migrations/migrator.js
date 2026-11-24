const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');
const CustomMaterial = require('../models/CustomMaterial');
const Order = require('../models/Order');
const LandingContent = require('../models/LandingContent');
const User = require('../models/User');
const { ensureDefaultCategories } = require('../controllers/category.controller');
const { connectDB } = require('../config/db');
const env = require('../config/env');

const migrationLogSchema = new mongoose.Schema(
  {
    version: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    appliedAt: { type: Date, default: Date.now },
  },
  { collection: '_migrations' }
);

const MigrationLog =
  mongoose.models.MigrationLog || mongoose.model('MigrationLog', migrationLogSchema);

const MIGRATIONS = [
  {
    version: '20261125_001',
    name: 'ensure_default_categories',
    up: async () => {
      await ensureDefaultCategories();
    },
  },
  {
    version: '20261125_002',
    name: 'backfill_product_image_and_cloudinary_fields',
    up: async () => {
      const products = await Product.find();
      const oldS3Domain = 'dtu-img-db-868017909899-ap-southeast-2-an.s3.ap-southeast-2.amazonaws.com';
      const cloudBase =
        env.MEDIA_PUBLIC_BASE_URL ||
        (env.CLOUDINARY_CLOUD_NAME
          ? `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/image/upload/${env.CLOUDINARY_FOLDER_PREFIX || 'wavo'}`
          : '');

      const rewriteIfOldS3 = (url) => {
        if (!url || typeof url !== 'string') return url;
        if (cloudBase && url.includes(oldS3Domain)) {
          const parts = url.split(oldS3Domain + '/');
          if (parts[1]) return `${cloudBase}/${parts[1]}`;
        }
        return url;
      };

      for (const prod of products) {
        const primary = rewriteIfOldS3(
          prod.image ||
            prod.imageUrl ||
            prod.thumbnail ||
            (Array.isArray(prod.images) && prod.images[0]) ||
            ''
        );
        let changed = false;

        if (primary) {
          if (prod.image !== primary) {
            prod.image = primary;
            changed = true;
          }
          if (prod.imageUrl !== primary) {
            prod.imageUrl = primary;
            changed = true;
          }
          if (prod.thumbnail !== primary) {
            prod.thumbnail = primary;
            changed = true;
          }
          if (!Array.isArray(prod.images) || prod.images.length === 0) {
            prod.images = [primary];
            changed = true;
          } else {
            const rewrittenImgs = prod.images.map(rewriteIfOldS3);
            if (JSON.stringify(rewrittenImgs) !== JSON.stringify(prod.images)) {
              prod.images = rewrittenImgs;
              changed = true;
            }
          }
        }

        if (changed) {
          await prod.save();
        }
      }
    },
  },
  {
    version: '20261125_003',
    name: 'sync_database_indexes',
    up: async () => {
      await Promise.all([
        User.init(),
        Category.init(),
        Product.init(),
        CustomMaterial.init(),
        Order.init(),
        LandingContent.init(),
      ]);
    },
  },
];

/**
 * Runs all pending database migrations idempotently
 */
const runMigrations = async ({ force = false, silent = false } = {}) => {
  await connectDB();

  let appliedCount = 0;
  for (const migration of MIGRATIONS) {
    const existing = await MigrationLog.findOne({ version: migration.version }).lean();
    if (existing && !force) {
      continue;
    }

    if (!silent) {
      console.log(`🔄 [Migrator] Applying ${migration.version} (${migration.name})...`);
    }
    await migration.up();

    await MigrationLog.findOneAndUpdate(
      { version: migration.version },
      { version: migration.version, name: migration.name, appliedAt: new Date() },
      { upsert: true, new: true }
    );
    appliedCount += 1;
  }

  if (!silent) {
    if (appliedCount > 0) {
      console.log(`✔ [Migrator] Applied ${appliedCount} migration(s) successfully.`);
    } else {
      console.log('✔ [Migrator] Database schema & migrations are up to date.');
    }
  }

  return { appliedCount, totalMigrations: MIGRATIONS.length };
};

const getMigrationStatus = async () => {
  await connectDB();
  const applied = await MigrationLog.find().sort({ version: 1 }).lean();
  const appliedMap = new Map(applied.map((m) => [m.version, m.appliedAt]));
  return MIGRATIONS.map((m) => ({
    version: m.version,
    name: m.name,
    status: appliedMap.has(m.version) ? 'APPLIED' : 'PENDING',
    appliedAt: appliedMap.get(m.version) || null,
  }));
};

if (require.main === module) {
  const arg = process.argv[2] || 'up';
  (async () => {
    try {
      if (arg === 'status') {
        const list = await getMigrationStatus();
        console.table(list);
      } else if (arg === 'force' || arg === 'fresh') {
        await runMigrations({ force: true, silent: false });
      } else {
        await runMigrations({ force: false, silent: false });
      }
      await mongoose.disconnect();
      process.exit(0);
    } catch (err) {
      console.error('✖ [Migrator Error]:', err);
      await mongoose.disconnect();
      process.exit(1);
    }
  })();
}

module.exports = {
  runMigrations,
  getMigrationStatus,
  MigrationLog,
};
