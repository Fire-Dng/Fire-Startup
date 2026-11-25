'use client';

import { useMemo, useState } from 'react';
import { FALLBACK_CATEGORIES } from '@/data/fallback';
import { createCategoryAdmin, deleteCategoryAdmin, updateCategoryAdmin } from '@/lib/api';
import type { CategoryItem, CustomMaterial, Product } from '@/types';
import type { CategoryRow } from './categoryColumns';
import type { CategoryFormState } from './CategoryDialog';

interface UseCategoriesOptions {
  products: Product[];
  materials: CustomMaterial[];
  isEn: boolean;
  notify: (msg: string) => void;
}

export function useCategories({ products, materials, isEn, notify }: UseCategoriesOptions) {
  const [categories, setCategories] = useState<CategoryItem[]>(FALLBACK_CATEGORIES);
  const [categorySearch, setCategorySearch] = useState('');
  const [categoryTypeFilter, setCategoryTypeFilter] = useState('all');

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [catForm, setCatForm] = useState<CategoryFormState>({
    name: '',
    nameEn: '',
    slug: '',
    type: 'product',
    meshPresetDefault: 'tote_bag',
    description: '',
    sortOrder: 1,
    isActive: true,
  });

  const filteredCategories = useMemo<CategoryRow[]>(() => {
    return categories
      .filter((c) => {
        if (categoryTypeFilter !== 'all' && c.type !== categoryTypeFilter) return false;
        if (categorySearch) {
          const q = categorySearch.toLowerCase();
          return (
            c.name.toLowerCase().includes(q) ||
            (c.nameEn || '').toLowerCase().includes(q) ||
            c.slug.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .map((c) => {
        const computedCount =
          c.type === 'material'
            ? materials.filter((m) => m.materialType === c.slug).length
            : products.filter((p) => p.category === c.slug).length;
        const computedStock =
          c.type === 'material'
            ? materials
                .filter((m) => m.materialType === c.slug)
                .reduce((s, m) => s + m.stockQuantity, 0)
            : products.filter((p) => p.category === c.slug).reduce((s, p) => s + p.stock, 0);
        return {
          ...c,
          itemCount: computedCount,
          totalStock: computedStock,
        } as CategoryRow;
      });
  }, [categories, categoryTypeFilter, categorySearch, products, materials]);

  const openNewCategoryModal = () => {
    setEditingCategory(null);
    setCatForm({
      name: '',
      nameEn: '',
      slug: '',
      type: 'product',
      meshPresetDefault: 'tote_bag',
      description: '',
      sortOrder: categories.length + 1,
      isActive: true,
    });
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setCatForm({
      name: cat.name,
      nameEn: cat.nameEn || '',
      slug: cat.slug,
      type: cat.type || 'product',
      meshPresetDefault: cat.meshPresetDefault || 'tote_bag',
      description: cat.description || '',
      sortOrder: cat.sortOrder || 1,
      isActive: cat.isActive,
    });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!catForm.name.trim()) return;
    const cleanSlug =
      catForm.slug.trim() ||
      catForm.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const payload: Partial<CategoryItem> = {
      name: catForm.name.trim(),
      nameEn: catForm.nameEn.trim() || catForm.name.trim(),
      slug: cleanSlug,
      type: catForm.type,
      meshPresetDefault: catForm.meshPresetDefault,
      description: catForm.description,
      sortOrder: Number(catForm.sortOrder) || 1,
      isActive: catForm.isActive,
    };

    try {
      if (editingCategory) {
        const updated = await updateCategoryAdmin(editingCategory._id, payload);
        setCategories((prev) => prev.map((c) => (c._id === editingCategory._id ? updated : c)));
      } else {
        const created = await createCategoryAdmin(payload);
        setCategories((prev) => [...prev, created]);
      }
    } catch {
      const localCat: CategoryItem = {
        ...(editingCategory || ({ _id: `cat-${Date.now()}` } as CategoryItem)),
        ...(payload as CategoryItem),
      };
      if (editingCategory) {
        setCategories((prev) => prev.map((c) => (c._id === editingCategory._id ? localCat : c)));
      } else {
        setCategories((prev) => [...prev, localCat]);
      }
    }

    setIsCategoryModalOpen(false);
    setEditingCategory(null);
    notify(isEn ? 'Saved category successfully' : 'Đã lưu thông tin danh mục thành công');
  };

  const removeCategory = async (id: string, name: string) => {
    try {
      await deleteCategoryAdmin(id);
    } catch {
      // Fallback local removal
    }
    setCategories((prev) => prev.filter((c) => c._id !== id));
    notify(isEn ? `Deleted category "${name}"` : `Đã xóa danh mục "${name}"`);
  };

  return {
    categories,
    setCategories,
    categorySearch,
    setCategorySearch,
    categoryTypeFilter,
    setCategoryTypeFilter,
    filteredCategories,
    isCategoryModalOpen,
    setIsCategoryModalOpen,
    editingCategory,
    catForm,
    setCatForm,
    openNewCategoryModal,
    openEditCategoryModal,
    handleSaveCategory,
    removeCategory,
  };
}
