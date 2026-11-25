'use client';

import React from 'react';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { Layout, LayoutContent, LayoutFooter } from '@astryxdesign/core/Layout';
import { FormLayout } from '@astryxdesign/core/FormLayout';
import { TextInput } from '@astryxdesign/core/TextInput';
import { NumberInput } from '@astryxdesign/core/NumberInput';
import { TextArea } from '@astryxdesign/core/TextArea';
import { Selector } from '@astryxdesign/core/Selector';
import { Switch } from '@astryxdesign/core/Switch';
import { HStack } from '@astryxdesign/core/HStack';
import { Button } from '@astryxdesign/core/Button';
import type { CategoryItem } from '@/types';

export interface CategoryFormState {
  name: string;
  nameEn: string;
  slug: string;
  type: 'product' | 'material';
  meshPresetDefault: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
}

export interface CategoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingCategory: CategoryItem | null;
  form: CategoryFormState;
  onChange: (next: CategoryFormState) => void;
  onSave: () => void;
  isEn: boolean;
  cancelLabel: string;
}

export function CategoryDialog({
  isOpen,
  onOpenChange,
  editingCategory,
  form,
  onChange,
  onSave,
  isEn,
  cancelLabel,
}: CategoryDialogProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      purpose="form"
      width={600}
      maxHeight="85dvh"
    >
      <Layout
        header={
          <DialogHeader
            title={
              editingCategory
                ? isEn
                  ? 'Update Category'
                  : 'Cập Nhật Danh Mục Sản Phẩm'
                : isEn
                  ? 'Create New Category'
                  : 'Thêm Danh Mục Mới'
            }
            subtitle={
              isEn
                ? 'Configure category slug, default 3D mesh preset, and display order.'
                : 'Cấu hình mã định danh (slug), phôi 3D mặc định và thứ tự hiển thị trên cửa hàng.'
            }
            onOpenChange={onOpenChange}
          />
        }
        content={
          <LayoutContent>
            <FormLayout defaultOptionality="required">
              <FormLayout direction="horizontal">
                <TextInput
                  label={isEn ? 'Category Name (VI)' : 'Tên danh mục (Tiếng Việt)'}
                  isRequired
                  value={form.name}
                  onChange={(val) => onChange({ ...form, name: val })}
                  placeholder="Túi xách lưới đại dương"
                  width="100%"
                />

                <TextInput
                  label={isEn ? 'Category Name (EN)' : 'Tên danh mục (Tiếng Anh)'}
                  isOptional
                  value={form.nameEn}
                  onChange={(val) => onChange({ ...form, nameEn: val })}
                  placeholder="Upcycled Net Bags"
                  width="100%"
                />
              </FormLayout>

              <FormLayout direction="horizontal">
                <TextInput
                  label={isEn ? 'Category Slug' : 'Mã định danh (Slug)'}
                  isOptional
                  value={form.slug}
                  onChange={(val) => onChange({ ...form, slug: val })}
                  placeholder="bag"
                  width="100%"
                />

                <Selector
                  label={isEn ? 'Default 3D Mesh Preset' : 'Phôi 3D mặc định'}
                  value={form.meshPresetDefault}
                  onChange={(val) => onChange({ ...form, meshPresetDefault: val })}
                  width="100%"
                  options={[
                    { value: 'tote_bag', label: 'tote_bag (Túi xách lưới)' },
                    { value: 'storage_basket', label: 'storage_basket (Giỏ đựng đồ)' },
                    { value: 'zip_wallet', label: 'zip_wallet (Ví khóa kéo)' },
                    { value: 'eco_shirt', label: 'eco_shirt (Áo khoác tái chế)' },
                    { value: 'woven_bracelet', label: 'woven_bracelet (Vòng tay dây lưới)' },
                    { value: 'shell_charm_set', label: 'shell_charm_set (Phụ kiện charm)' },
                  ]}
                />
              </FormLayout>

              <FormLayout direction="horizontal">
                <Selector
                  label={isEn ? 'Category Type' : 'Phân nhóm'}
                  value={form.type}
                  onChange={(val) =>
                    onChange({ ...form, type: val as 'product' | 'material' })
                  }
                  width="100%"
                  options={[
                    { value: 'product', label: isEn ? 'Product Category' : 'Danh mục sản phẩm' },
                    { value: 'material', label: isEn ? 'BOM Material Group' : 'Nhóm nguyên liệu BOM' },
                  ]}
                />

                <NumberInput
                  label={isEn ? 'Display Order' : 'Thứ tự ưu tiên hiển thị'}
                  value={form.sortOrder}
                  onChange={(val) => onChange({ ...form, sortOrder: val ?? 1 })}
                  min={1}
                  step={1}
                  isIntegerOnly
                  isWheelEnabled={false}
                  width="100%"
                />
              </FormLayout>

              <TextArea
                label={isEn ? 'Description' : 'Mô tả danh mục'}
                isOptional
                value={form.description}
                onChange={(val) => onChange({ ...form, description: val })}
                rows={2}
                width="100%"
              />

              <Switch
                label={isEn ? 'Display Category on Storefront' : 'Hiển thị danh mục trên Web Store'}
                value={form.isActive}
                onChange={(checked) => onChange({ ...form, isActive: checked })}
              />
            </FormLayout>
          </LayoutContent>
        }
        footer={
          <LayoutFooter>
            <HStack gap={2} hAlign="end">
              <Button label={cancelLabel} variant="secondary" onClick={() => onOpenChange(false)} />
              <Button
                label={isEn ? 'Save Category' : 'Lưu danh mục'}
                variant="primary"
                onClick={onSave}
              />
            </HStack>
          </LayoutFooter>
        }
      />
    </Dialog>
  );
}
