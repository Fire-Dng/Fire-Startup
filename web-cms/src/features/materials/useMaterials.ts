'use client';

import { useMemo, useState } from 'react';
import { ASSETS } from '@/config/assets';
import { PRODUCT_COLOR_PRESETS } from '@/config/theme';
import { FALLBACK_MATERIALS } from '@/data/fallback';
import { createMaterialAdmin, deleteMaterialAdmin, updateMaterialAdmin } from '@/lib/api';
import { validateCurrencyAmount } from '@/lib/validators';
import type { CustomMaterial } from '@/types';
import type { MaterialRow } from './materialColumns';
import type { MaterialFormState } from './MaterialDialog';

interface UseMaterialsOptions {
  isEn: boolean;
  locale: 'vi' | 'en';
  notify: (msg: string) => void;
}

export function useMaterials({ isEn, locale, notify }: UseMaterialsOptions) {
  const [materials, setMaterials] = useState<CustomMaterial[]>(FALLBACK_MATERIALS);
  const [materialSearch, setMaterialSearch] = useState('');
  const [materialTypeFilter, setMaterialTypeFilter] = useState('all');

  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<CustomMaterial | null>(null);
  const [matForm, setMatForm] = useState<MaterialFormState>({
    name: '',
    materialType: 'shell',
    unitPrice: 15000,
    stockQuantity: 100,
    colorHex: PRODUCT_COLOR_PRESETS.sandCream,
    thumbnail: ASSETS.materials.scallopShell,
    meshPreset: 'scallop_shell',
    glbUrl: '',
    description: '',
  });

  const filteredMaterials = useMemo<MaterialRow[]>(() => {
    return materials
      .filter((m) => {
        if (materialTypeFilter !== 'all' && m.materialType !== materialTypeFilter) return false;
        if (materialSearch) {
          return m.name.toLowerCase().includes(materialSearch.toLowerCase());
        }
        return true;
      })
      .map((m) => m as MaterialRow);
  }, [materials, materialTypeFilter, materialSearch]);

  const matUnitPriceValidation = useMemo(
    () =>
      validateCurrencyAmount(matForm.unitPrice, {
        min: 1000,
        max: 20_000_000,
        allowZero: false,
        fieldName: isEn ? 'Unit price' : 'Đơn giá phụ kiện',
        locale,
      }),
    [matForm.unitPrice, isEn, locale]
  );

  const openNewMaterialModal = () => {
    setEditingMaterial(null);
    setMatForm({
      name: '',
      materialType: 'shell',
      unitPrice: 15000,
      stockQuantity: 100,
      colorHex: PRODUCT_COLOR_PRESETS.sandCream,
      thumbnail: ASSETS.materials.scallopShell,
      meshPreset: 'scallop_shell',
      glbUrl: '',
      description: '',
    });
    setIsMaterialModalOpen(true);
  };

  const openEditMaterialModal = (mat: CustomMaterial) => {
    setEditingMaterial(mat);
    setMatForm({
      name: mat.name,
      materialType: mat.materialType,
      unitPrice: mat.unitPrice,
      stockQuantity: mat.stockQuantity,
      colorHex: mat.colorHex,
      thumbnail: mat.thumbnail || ASSETS.materials.scallopShell,
      meshPreset: mat.model3D?.meshPreset || 'scallop_shell',
      glbUrl: mat.model3D?.glbUrl || '',
      description: mat.description || '',
    });
    setIsMaterialModalOpen(true);
  };

  const handleSaveMaterial = async () => {
    if (!matForm.name.trim() || !matUnitPriceValidation.isValid) return;
    const payload: Partial<CustomMaterial> = {
      name: matForm.name,
      materialType: matForm.materialType,
      unitPrice: matUnitPriceValidation.value,
      stockQuantity: Number(matForm.stockQuantity),
      colorHex: matForm.colorHex,
      thumbnail: matForm.thumbnail || editingMaterial?.thumbnail || ASSETS.materials.scallopShell,
      description: matForm.description,
      isActive: true,
      model3D: {
        meshPreset: matForm.meshPreset,
        glbUrl: matForm.glbUrl,
        defaultScale: 1.0,
      },
    };

    try {
      if (editingMaterial) {
        const updated = await updateMaterialAdmin(editingMaterial._id, payload);
        setMaterials((prev) => prev.map((m) => (m._id === editingMaterial._id ? updated : m)));
      } else {
        const created = await createMaterialAdmin(payload);
        setMaterials((prev) => [created, ...prev]);
      }
    } catch {
      const localMat: CustomMaterial = {
        ...(editingMaterial || ({ _id: `mat-${Date.now()}` } as CustomMaterial)),
        ...(payload as CustomMaterial),
      };
      if (editingMaterial) {
        setMaterials((prev) => prev.map((m) => (m._id === editingMaterial._id ? localMat : m)));
      } else {
        setMaterials((prev) => [localMat, ...prev]);
      }
    }

    setIsMaterialModalOpen(false);
    setEditingMaterial(null);
    notify(
      isEn
        ? 'Saved material & BOM inventory'
        : 'Đã cập nhật nguyên liệu vỏ sò / ốc biển & tồn kho BOM'
    );
  };

  const removeMaterial = async (id: string, name: string) => {
    try {
      await deleteMaterialAdmin(id);
    } catch {
      // Fallback local removal
    }
    setMaterials((prev) => prev.filter((m) => m._id !== id));
    notify(isEn ? `Deleted "${name}"` : `Đã xóa nguyên liệu "${name}"`);
  };

  return {
    materials,
    setMaterials,
    materialSearch,
    setMaterialSearch,
    materialTypeFilter,
    setMaterialTypeFilter,
    filteredMaterials,
    isMaterialModalOpen,
    setIsMaterialModalOpen,
    editingMaterial,
    matForm,
    setMatForm,
    matUnitPriceValidation,
    openNewMaterialModal,
    openEditMaterialModal,
    handleSaveMaterial,
    removeMaterial,
  };
}
