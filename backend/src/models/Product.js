const mongoose = require('mongoose');
const { BASE_COLORS, NET_COLORS, STRAP_COLORS } = require('../config/theme');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên sản phẩm không được để trống'],
      trim: true,
    },
    nameEn: {
      type: String,
      trim: true,
      default: '',
    },
    slug: {
      type: String,
      required: [true, 'Slug sản phẩm không được để trống'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    sku: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Danh mục sản phẩm không được để trống'],
      trim: true,
      lowercase: true,
    },
    shortDescription: {
      type: String,
      default: '',
    },
    shortDescriptionEn: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    descriptionEn: {
      type: String,
      default: '',
    },
    basePrice: {
      type: Number,
      required: [true, 'Giá gốc không được để trống'],
      min: [0, 'Giá gốc không được âm'],
    },
    craftFee: {
      type: Number,
      default: 0,
      min: [0, 'Phí chế tác không được âm'],
    },
    stock: {
      type: Number,
      required: true,
      default: 20,
      min: [0, 'Tồn kho không được âm'],
    },
    images: {
      type: [String],
      default: [],
    },
    image: {
      type: String,
      default: '',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    imagePublicId: {
      type: String,
      default: '',
    },
    thumbnail: {
      type: String,
      default: '',
    },
    isCustomizable: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    availableColors: {
      type: [
        {
          name: { type: String, required: true },
          hex: { type: String, required: true },
        },
      ],
      default: () => NET_COLORS,
    },
    availableStrapColors: {
      type: [
        {
          name: { type: String, required: true },
          hex: { type: String, required: true },
        },
      ],
      default: () => STRAP_COLORS,
    },
    availableSizes: {
      type: [String],
      default: ['Tiêu chuẩn'],
    },
    model3D: {
      meshPreset: {
        type: String,
        default: 'tote_bag',
      },
      glbUrl: {
        type: String,
        default: '',
      },
      defaultBaseColor: {
        type: String,
        default: BASE_COLORS.OCEAN_TEAL,
      },
      defaultStrapColor: {
        type: String,
        default: BASE_COLORS.ROPE_NATURAL,
      },
      roughness: {
        type: Number,
        default: 0.75,
      },
      metalness: {
        type: Number,
        default: 0.05,
      },
    },
    ecoImpact: {
      netWeightGrams: {
        type: Number,
        default: 150,
      },
      oceanOrigin: {
        type: String,
        default: 'Vịnh Đà Nẵng & Cù Lao Chàm',
      },
      artisanGroup: {
        type: String,
        default: 'Hợp tác xã Phụ nữ Làng chài Thanh Khê',
      },
      recycledPlasticRatio: {
        type: Number,
        default: 92,
      },
      co2SavedGrams: {
        type: Number,
        default: 420,
      },
    },
    soldCount: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 4.9,
    },
  },
  { timestamps: true }
);

// Keep image, imageUrl, thumbnail, and images[0] synchronized automatically
productSchema.pre('save', function syncProductImages(next) {
  const primaryImage =
    this.image ||
    this.imageUrl ||
    this.thumbnail ||
    (Array.isArray(this.images) && this.images.length > 0 ? this.images[0] : '');

  if (primaryImage) {
    if (!this.image) this.image = primaryImage;
    if (!this.imageUrl) this.imageUrl = primaryImage;
    if (!this.thumbnail) this.thumbnail = primaryImage;
    if (!Array.isArray(this.images) || this.images.length === 0) {
      this.images = [primaryImage];
    }
  }
  next();
});

// ESR Compound Indexes
productSchema.index({ category: 1, isActive: 1, isCustomizable: 1 });
productSchema.index({ isActive: 1, basePrice: 1 });
productSchema.index({ name: 'text', shortDescription: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
