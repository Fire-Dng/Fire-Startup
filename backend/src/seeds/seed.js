const User = require('../models/User');
const Product = require('../models/Product');
const CustomMaterial = require('../models/CustomMaterial');
const CustomDesign = require('../models/CustomDesign');
const Order = require('../models/Order');
const LandingContent = require('../models/LandingContent');
const env = require('../config/env');
const { PRODUCT_ASSETS, buildVietQrImageUrl } = require('../config/assets');
const { BASE_COLORS, CHARM_COLORS } = require('../config/theme');
const { connectDB } = require('../config/db');
const initialUsers = require('./data/users');
const initialProducts = require('./data/products');
const initialMaterials = require('./data/materials');

const seedDatabase = async ({ force = false } = {}) => {
  await connectDB();

  const existingProductsCount = await Product.countDocuments();
  if (existingProductsCount > 0 && !force) {
    console.log(`[Seeder] Database already contains ${existingProductsCount} products. Skipping auto-seed.`);
    return;
  }

  console.log('[Seeder] Seeding DTU Upcycled Fishing Net & 3D Ocean Craft database...');

  if (force) {
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      CustomMaterial.deleteMany({}),
      CustomDesign.deleteMany({}),
      Order.deleteMany({}),
      LandingContent.deleteMany({}),
    ]);
  }

  // 1. Create Users
  const createdUsers = [];
  for (const u of initialUsers) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) {
      createdUsers.push(await User.create(u));
    } else {
      createdUsers.push(exists);
    }
  }
  const customerUser = createdUsers.find((u) => u.role === 'customer') || createdUsers[0];

  // 2. Create LandingContent with full S3-ready image fields (heroBanner, processSteps, galleryImages, artisanStory)
  const existingLanding = await LandingContent.findOne({ key: 'main_landing' });
  if (!existingLanding) {
    await LandingContent.create({ key: 'main_landing' });
  }

  // 3. Create Products
  const createdProducts = [];
  for (const p of initialProducts) {
    const exists = await Product.findOne({ slug: p.slug });
    if (!exists) {
      createdProducts.push(await Product.create(p));
    } else {
      createdProducts.push(exists);
    }
  }

  // 4. Create CustomMaterials
  const createdMaterials = [];
  for (const m of initialMaterials) {
    const exists = await CustomMaterial.findOne({ code: m.code });
    if (!exists) {
      createdMaterials.push(await CustomMaterial.create(m));
    } else {
      createdMaterials.push(exists);
    }
  }

  // 5. Create sample CustomDesign & sample Orders with 3D Snapshots for immediate CMS / Lookup testing
  const toteBag = createdProducts.find((p) => p.slug === 'tui-xach-luoi-dai-duong-son-tra') || createdProducts[0];
  const bracelet = createdProducts.find((p) => p.slug === 'vong-tay-day-luoi-tet-thu-cong-my-khe') || createdProducts[4];
  const scallop = createdMaterials.find((m) => m.code === 'SHL-SCALLOP-01') || createdMaterials[0];
  const spiralSnail = createdMaterials.find((m) => m.code === 'SNL-SPIRAL-01') || createdMaterials[3];
  const starfish = createdMaterials.find((m) => m.code === 'CHM-STAR-01') || createdMaterials[6];
  const pearl = createdMaterials.find((m) => m.code === 'BED-PEARL-01') || createdMaterials[9];

  const existingDesign = await CustomDesign.findOne({ shareCode: '3D-SONTRA1' });
  let sampleDesign = existingDesign;
  if (!sampleDesign && toteBag && scallop && spiralSnail) {
    const samplePlacements = [
      {
        placementId: 'pl_seed_1',
        materialId: scallop._id,
        materialName: scallop.name,
        materialCode: scallop.code,
        materialType: scallop.materialType,
        meshPreset: scallop.model3D.meshPreset,
        glbUrl: '',
        unitPrice: scallop.unitPrice,
        position: [-0.35, 0.15, 0.42],
        normal: [0, 0.08, 0.99],
        rotation: 15,
        scale: 1.1,
        color: CHARM_COLORS.PEARL_WHITE,
      },
      {
        placementId: 'pl_seed_2',
        materialId: scallop._id,
        materialName: scallop.name,
        materialCode: scallop.code,
        materialType: scallop.materialType,
        meshPreset: scallop.model3D.meshPreset,
        glbUrl: '',
        unitPrice: scallop.unitPrice,
        position: [0.35, 0.15, 0.42],
        normal: [0, 0.08, 0.99],
        rotation: -15,
        scale: 1.1,
        color: CHARM_COLORS.PEARL_WHITE,
      },
      {
        placementId: 'pl_seed_3',
        materialId: scallop._id,
        materialName: scallop.name,
        materialCode: scallop.code,
        materialType: scallop.materialType,
        meshPreset: scallop.model3D.meshPreset,
        glbUrl: '',
        unitPrice: scallop.unitPrice,
        position: [0, -0.2, 0.44],
        normal: [0, 0, 1],
        rotation: 0,
        scale: 1.25,
        color: CHARM_COLORS.SUN_GOLD,
      },
      {
        placementId: 'pl_seed_4',
        materialId: spiralSnail._id,
        materialName: spiralSnail.name,
        materialCode: spiralSnail.code,
        materialType: spiralSnail.materialType,
        meshPreset: spiralSnail.model3D.meshPreset,
        glbUrl: '',
        unitPrice: spiralSnail.unitPrice,
        position: [0, 0.22, 0.43],
        normal: [0, 0.05, 0.99],
        rotation: 30,
        scale: 1.15,
        color: CHARM_COLORS.AMBER_GOLD,
      },
    ];

    sampleDesign = await CustomDesign.create({
      shareCode: '3D-SONTRA1',
      name: 'Túi Lưới Sơn Trà Đính 3 Sò Điệp & 1 Ốc Hoàng Kim',
      productId: toteBag._id,
      userId: customerUser._id,
      baseColor: BASE_COLORS.OCEAN_TEAL,
      strapColor: BASE_COLORS.ROPE_NATURAL,
      size: 'Tiêu chuẩn (38x42cm)',
      note: 'Khâu chỉ cước trắng bền chắc giúp mình nhé xưởng!',
      placements: samplePlacements,
      pricingBreakdown: {
        basePrice: 320000,
        craftFee: 30000,
        materialsTotal: 70000,
        estimatedPrice: 420000,
      },
      bomSummary: [
        {
          materialId: scallop._id,
          code: scallop.code,
          name: scallop.name,
          materialType: scallop.materialType,
          meshPreset: scallop.model3D.meshPreset,
          unitPrice: 15000,
          quantity: 3,
          subtotal: 45000,
        },
        {
          materialId: spiralSnail._id,
          code: spiralSnail.code,
          name: spiralSnail.name,
          materialType: spiralSnail.materialType,
          meshPreset: spiralSnail.model3D.meshPreset,
          unitPrice: 25000,
          quantity: 1,
          subtotal: 25000,
        },
      ],
      previewThumbnail: toteBag.thumbnail,
    });
  }

  const existingOrderCount = await Order.countDocuments();
  if (existingOrderCount === 0 && sampleDesign && toteBag && bracelet && starfish && pearl) {
    const orderCode1 = 'DTU-20261108-OCN1';
    const orderCode2 = 'DTU-20261108-OCN2';

    await Order.create([
      {
        orderCode: orderCode1,
        userId: customerUser._id,
        customerInfo: {
          fullName: 'Lê Minh Hải',
          phone: '0905888999',
          email: env.SEED_CUSTOMER_EMAIL,
          address: '12 Bạch Đằng, Quận Hải Châu',
          city: 'Đà Nẵng',
          note: 'Giao giờ hành chính giúp mình',
        },
        items: [
          {
            productId: toteBag._id,
            productName: toteBag.name,
            productSlug: toteBag.slug,
            category: toteBag.category,
            thumbnail: toteBag.thumbnail,
            model3D: {
              meshPreset: toteBag.model3D.meshPreset,
              glbUrl: '',
            },
            quantity: 1,
            selectedColor: BASE_COLORS.OCEAN_TEAL,
            selectedStrapColor: BASE_COLORS.ROPE_NATURAL,
            selectedSize: 'Tiêu chuẩn (38x42cm)',
            isCustom: true,
            customDesignId: sampleDesign._id,
            customDesignSnapshot: {
              shareCode: sampleDesign.shareCode,
              name: sampleDesign.name,
              baseColor: sampleDesign.baseColor,
              strapColor: sampleDesign.strapColor,
              size: sampleDesign.size,
              note: sampleDesign.note,
              meshPreset: toteBag.model3D.meshPreset,
              glbUrl: '',
              placements: sampleDesign.placements,
            },
            bomSummary: [
              {
                materialId: scallop._id,
                code: scallop.code,
                name: scallop.name,
                materialType: scallop.materialType,
                meshPreset: scallop.model3D.meshPreset,
                unitPrice: 15000,
                quantityPerItem: 3,
                totalQuantity: 3,
                subtotal: 45000,
              },
              {
                materialId: spiralSnail._id,
                code: spiralSnail.code,
                name: spiralSnail.name,
                materialType: spiralSnail.materialType,
                meshPreset: spiralSnail.model3D.meshPreset,
                unitPrice: 25000,
                quantityPerItem: 1,
                totalQuantity: 1,
                subtotal: 25000,
              },
            ],
            pricingBreakdown: {
              basePrice: 320000,
              craftFee: 30000,
              materialsTotal: 70000,
              unitPrice: 420000,
              lineTotal: 420000,
            },
            ecoImpactGrams: 240,
          },
        ],
        status: 'in_crafting',
        statusHistory: [
          {
            status: 'pending',
            note: 'Khách hàng đặt đơn Custom 3D',
            updatedBy: 'Lê Minh Hải',
            updatedAt: new Date(Date.now() - 86400000 * 2),
          },
          {
            status: 'confirmed',
            note: 'Xưởng xác nhận đủ vỏ sò điệp và ốc xoắn trong kho',
            updatedBy: 'Quản Trị Viên Nét Biển DTU',
            updatedAt: new Date(Date.now() - 86400000),
          },
          {
            status: 'in_crafting',
            note: 'Nghệ nhân Nguyễn Thị Lành đang đan phôi và khâu vỏ sò theo tọa độ 3D',
            updatedBy: 'Nghệ Nhân Nguyễn Thị Lành',
            updatedAt: new Date(),
          },
        ],
        paymentMethod: 'vietqr',
        paymentStatus: 'paid',
        vietqrInfo: {
          bankId: env.VIETQR_BANK_ID,
          bankName: env.VIETQR_BANK_NAME,
          accountNo: env.VIETQR_ACCOUNT_NO,
          accountName: env.VIETQR_ACCOUNT_NAME,
          amount: 450000,
          transferContent: orderCode1,
          qrImageUrl: buildVietQrImageUrl({
            amount: 450000,
            transferContent: orderCode1,
          }),
        },
        subtotal: 420000,
        shippingFee: 30000,
        totalAmount: 450000,
        finalAmount: 450000,
        totalNetWeightGrams: 240,
        inventoryDeducted: true,
      },
      {
        orderCode: orderCode2,
        userId: null,
        customerInfo: {
          fullName: 'Trần Ngọc Bảo Trâm',
          phone: '0912345678',
          email: 'baotram.danang@gmail.com',
          address: '88 Võ Nguyên Giáp, Quận Sơn Trà',
          city: 'Đà Nẵng',
          note: 'Làm quà tặng sinh nhật bạn, gói giấy kraft giúp mình',
        },
        items: [
          {
            productId: bracelet._id,
            productName: bracelet.name,
            productSlug: bracelet.slug,
            category: bracelet.category,
            thumbnail: bracelet.thumbnail,
            model3D: {
              meshPreset: bracelet.model3D.meshPreset,
              glbUrl: '',
            },
            quantity: 2,
            selectedColor: BASE_COLORS.OCEAN_TEAL,
            selectedStrapColor: BASE_COLORS.CORAL_AMBER,
            selectedSize: 'Tiêu chuẩn (16-18cm)',
            isCustom: true,
            customDesignId: null,
            customDesignSnapshot: {
              shareCode: '3D-BRC88',
              name: 'Vòng Tay Mỹ Khê Đính Sao Biển & Ngọc Trai',
              baseColor: BASE_COLORS.OCEAN_TEAL,
              strapColor: BASE_COLORS.CORAL_AMBER,
              size: 'Tiêu chuẩn (16-18cm)',
              note: 'Đính sao biển ở chính giữa vòng',
              meshPreset: bracelet.model3D.meshPreset,
              glbUrl: '',
              braceletConfig: {
                wristSizeCm: 16,
                slotCount: 12,
                cordMaterial: 'recycled_net_cord',
              },
              placements: [
                {
                  placementId: 'pl_brc_1',
                  materialId: starfish._id,
                  materialName: starfish.name,
                  materialCode: starfish.code,
                  materialType: starfish.materialType,
                  meshPreset: starfish.model3D.meshPreset,
                  glbUrl: '',
                  unitPrice: starfish.unitPrice,
                  position: [0, 0.72, 0],
                  normal: [0, 1, 0],
                  rotation: 0,
                  scale: 1.0,
                  color: CHARM_COLORS.STARFISH_ORANGE,
                  slotIndex: 0,
                  isDanglingCharm: true,
                },
                {
                  placementId: 'pl_brc_2',
                  materialId: pearl._id,
                  materialName: pearl.name,
                  materialCode: pearl.code,
                  materialType: pearl.materialType,
                  meshPreset: pearl.model3D.meshPreset,
                  glbUrl: '',
                  unitPrice: pearl.unitPrice,
                  position: [0.51, 0.51, 0],
                  normal: [0.7, 0.7, 0],
                  rotation: 0,
                  scale: 1.0,
                  color: CHARM_COLORS.PEARL_WHITE,
                  slotIndex: 1,
                  isDanglingCharm: false,
                },
              ],
            },
            bomSummary: [
              {
                materialId: starfish._id,
                code: starfish.code,
                name: starfish.name,
                materialType: starfish.materialType,
                meshPreset: starfish.model3D.meshPreset,
                unitPrice: 22000,
                quantityPerItem: 1,
                totalQuantity: 2,
                subtotal: 44000,
              },
              {
                materialId: pearl._id,
                code: pearl.code,
                name: pearl.name,
                materialType: pearl.materialType,
                meshPreset: pearl.model3D.meshPreset,
                unitPrice: 12000,
                quantityPerItem: 1,
                totalQuantity: 2,
                subtotal: 24000,
              },
            ],
            pricingBreakdown: {
              basePrice: 95000,
              craftFee: 15000,
              materialsTotal: 34000,
              unitPrice: 144000,
              lineTotal: 288000,
            },
            ecoImpactGrams: 70,
          },
        ],
        status: 'pending',
        statusHistory: [
          {
            status: 'pending',
            note: 'Đơn hàng mới tạo chờ xác nhận',
            updatedBy: 'Trần Ngọc Bảo Trâm',
            updatedAt: new Date(),
          },
        ],
        paymentMethod: 'cod',
        paymentStatus: 'unpaid',
        vietqrInfo: {
          bankId: env.VIETQR_BANK_ID,
          bankName: env.VIETQR_BANK_NAME,
          accountNo: env.VIETQR_ACCOUNT_NO,
          accountName: env.VIETQR_ACCOUNT_NAME,
          amount: 318000,
          transferContent: orderCode2,
          qrImageUrl: buildVietQrImageUrl({
            amount: 318000,
            transferContent: orderCode2,
          }),
        },
        subtotal: 288000,
        shippingFee: 30000,
        totalAmount: 318000,
        finalAmount: 318000,
        totalNetWeightGrams: 70,
        inventoryDeducted: true,
      },
    ]);
  }

  console.log('[Seeder] Seed completed successfully!');
};

if (require.main === module) {
  seedDatabase({ force: true })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
