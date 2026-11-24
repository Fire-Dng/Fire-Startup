const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên danh mục không được để trống'],
      trim: true,
    },
    nameEn: {
      type: String,
      trim: true,
      default: '',
    },
    slug: {
      type: String,
      required: [true, 'Mã định danh (slug) danh mục không được để trống'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['product', 'material'],
      default: 'product',
    },
    meshPresetDefault: {
      type: String,
      default: 'tote_bag',
    },
    description: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    sortOrder: {
      type: Number,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

categorySchema.index({ type: 1, sortOrder: 1, isActive: 1 });

module.exports = mongoose.model('Category', categorySchema);
