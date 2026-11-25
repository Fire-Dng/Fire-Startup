'use client';

import { useMemo, useState } from 'react';
import { ASSETS } from '@/config/assets';
import { PRODUCT_COLOR_PRESETS } from '@/config/theme';
import { FALLBACK_PRODUCTS } from '@/data/fallback';
import { createProductAdmin, deleteProductAdmin, updateProductAdmin } from '@/lib/api';
import { validateCurrencyAmount } from '@/lib/validators';
import type { CategoryItem, Product } from '@/types';
import type { ProductRow } from './productColumns';
import type { ProductFormState } from './ProductDialog';

interface UseProductsOptions {
  isEn: boolean;
  locale: 'vi' | 'en';
  t: (key: string) => string;
  notify: (msg: string) => void;
}

export function useProducts({ isEn, locale, t, notify }: UseProductsOptions) {
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] = useState('all');

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodForm, setProdForm] = useState<ProductFormState>({
    name: '',
    nameEn: '',
    slug: '',
    category: 'bag',
    basePrice: 320000,
    craftFee: 30000,
    stock: 25,
    shortDescription: '',
    shortDescriptionEn: '',
    description: '',
    descriptionEn: '',
    imageUrl: ASSETS.products.toteBagMain,
    meshPreset: 'tote_bag',
    glbUrl: '',
    netWeightGrams: 380,
    originSea: 'Bán đảo Sơn Trà, Đà Nẵng',
    isCustomizable: true,
  });

  const filteredProducts = useMemo<ProductRow[]>(() => {
    return products
      .filter((p) => {
        if (productCatFilter !== 'all' && p.category !== productCatFilter) return false;
        if (productSearch) {
          return p.name.toLowerCase().includes(productSearch.toLowerCase());
        }
        return true;
      })
      .map((p) => p as ProductRow);
  }, [products, productCatFilter, productSearch]);

  const basePriceValidation = useMemo(
    () =>
      validateCurrencyAmount(prodForm.basePrice, {
        min: 10000,
        max: 100_000_000,
        allowZero: false,
        fieldName: isEn ? 'Base price' : 'Giá phôi gốc',
        locale,
      }),
    [prodForm.basePrice, isEn, locale]
  );

  const craftFeeValidation = useMemo(
    () =>
      validateCurrencyAmount(prodForm.craftFee, {
        min: 0,
        max: 50_000_000,
        allowZero: true,
        fieldName: isEn ? '3D craft fee' : 'Phí khâu 3D',
        locale,
      }),
    [prodForm.craftFee, isEn, locale]
  );

  const openNewProductModal = (categories: CategoryItem[]) => {
    setEditingProduct(null);
    setProdForm({
      name: '',
      nameEn: '',
      slug: '',
      category: categories[0]?.slug || 'bag',
      basePrice: 320000,
      craftFee: 30000,
      stock: 25,
      shortDescription: '',
      shortDescriptionEn: '',
      description: '',
      descriptionEn: '',
      imageUrl: ASSETS.products.toteBagMain,
      meshPreset: 'tote_bag',
      glbUrl: '',
      netWeightGrams: 380,
      originSea: 'Bán đảo Sơn Trà, Đà Nẵng',
      isCustomizable: true,
    });
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (prod: Product) => {
    setEditingProduct(prod);
    setProdForm({
      name: prod.name,
      nameEn: prod.nameEn || '',
      slug: prod.slug,
      category: prod.category,
      basePrice: prod.basePrice,
      craftFee: prod.craftFee,
      stock: prod.stock,
      shortDescription: prod.shortDescription,
      shortDescriptionEn: prod.shortDescriptionEn || '',
      description: prod.description || prod.shortDescription || '',
      descriptionEn: prod.descriptionEn || prod.shortDescriptionEn || '',
      imageUrl:
        prod.image ||
        prod.imageUrl ||
        prod.images?.[0] ||
        prod.thumbnail ||
        ASSETS.products.toteBagMain,
      meshPreset: prod.model3D?.meshPreset || 'tote_bag',
      glbUrl: prod.model3D?.glbUrl || '',
      netWeightGrams: prod.ecoImpact?.netWeightGrams || 350,
      originSea: prod.ecoImpact?.originSea || t('common.centralSea'),
      isCustomizable: prod.isCustomizable,
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!prodForm.name.trim() || !basePriceValidation.isValid || !craftFeeValidation.isValid) {
      return;
    }
    const resolvedImg =
      prodForm.imageUrl ||
      editingProduct?.image ||
      editingProduct?.imageUrl ||
      editingProduct?.images?.[0] ||
      ASSETS.placeholders.product;

    const payload: Partial<Product> = {
      name: prodForm.name,
      nameEn: prodForm.nameEn.trim() || prodForm.name,
      slug:
        prodForm.slug ||
        prodForm.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd')
          .replace(/[^a-z0-9]+/g, '-'),
      category: prodForm.category,
      basePrice: basePriceValidation.value,
      craftFee: craftFeeValidation.value,
      stock: Number(prodForm.stock),
      shortDescription: prodForm.shortDescription,
      shortDescriptionEn: prodForm.shortDescriptionEn,
      description: prodForm.description || prodForm.shortDescription,
      descriptionEn: prodForm.descriptionEn || prodForm.shortDescriptionEn,
      isCustomizable: prodForm.isCustomizable,
      isActive: true,
      image: resolvedImg,
      imageUrl: resolvedImg,
      thumbnail: resolvedImg,
      images: [resolvedImg],
      model3D: {
        meshPreset: prodForm.meshPreset,
        glbUrl: prodForm.glbUrl,
        defaultBaseColor: PRODUCT_COLOR_PRESETS.kelpGreen,
        defaultStrapColor: PRODUCT_COLOR_PRESETS.terracottaRust,
      },
      ecoImpact: {
        netWeightGrams: Number(prodForm.netWeightGrams),
        originSea: prodForm.originSea,
        recycledPlasticPct: 92,
        artisanGroup: t('eco.defaultArtisanGroup'),
      },
    };

    try {
      if (editingProduct) {
        const updated = await updateProductAdmin(editingProduct._id, payload);
        setProducts((prev) => prev.map((p) => (p._id === editingProduct._id ? updated : p)));
      } else {
        const created = await createProductAdmin(payload);
        setProducts((prev) => [created, ...prev]);
      }
    } catch {
      const localProd: Product = {
        ...(editingProduct || ({ _id: `prod-${Date.now()}` } as Product)),
        ...(payload as Product),
      };
      if (editingProduct) {
        setProducts((prev) => prev.map((p) => (p._id === editingProduct._id ? localProd : p)));
      } else {
        setProducts((prev) => [localProd, ...prev]);
      }
    }

    setIsProductModalOpen(false);
    setEditingProduct(null);
    notify(
      isEn
        ? 'Saved product & Cloudinary image'
        : 'Đã lưu sản phẩm & hình ảnh Cloudinary thành công'
    );
  };

  const removeProduct = async (id: string, name: string) => {
    try {
      await deleteProductAdmin(id);
    } catch {
      // Fallback local removal
    }
    setProducts((prev) => prev.filter((p) => p._id !== id));
    notify(isEn ? `Deleted "${name}"` : `Đã xóa sản phẩm "${name}"`);
  };

  return {
    products,
    setProducts,
    productSearch,
    setProductSearch,
    productCatFilter,
    setProductCatFilter,
    filteredProducts,
    isProductModalOpen,
    setIsProductModalOpen,
    editingProduct,
    prodForm,
    setProdForm,
    basePriceValidation,
    craftFeeValidation,
    openNewProductModal,
    openEditProductModal,
    handleSaveProduct,
    removeProduct,
  };
}
