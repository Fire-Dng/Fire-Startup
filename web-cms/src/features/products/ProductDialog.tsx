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
import { S3ImageUploader } from '@/components/common/S3ImageUploader';
import { formatNumberInputVnd, formatVnd } from '@/lib/validators';
import type { Product, ProductCategory } from '@/types';

export interface ProductFormState {
  name: string;
  slug: string;
  category: ProductCategory;
  basePrice: number;
  craftFee: number;
  stock: number;
  shortDescription: string;
  imageUrl: string;
  meshPreset: string;
  glbUrl: string;
  netWeightGrams: number;
  originSea: string;
  isCustomizable: boolean;
}

export interface ProductDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingProduct: Product | null;
  form: ProductFormState;
  onChange: (next: ProductFormState) => void;
  onSave: () => void;
  categoryOptions: Array<{ value: string; label: string }>;
  basePriceValidation: { isValid: boolean; message?: string };
  craftFeeValidation: { isValid: boolean; message?: string };
  isEn: boolean;
  piecesLabel: string;
  cancelLabel: string;
}

export function ProductDialog({
  isOpen,
  onOpenChange,
  editingProduct,
  form,
  onChange,
  onSave,
  categoryOptions,
  basePriceValidation,
  craftFeeValidation,
  isEn,
  piecesLabel,
  cancelLabel,
}: ProductDialogProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      purpose="form"
      width={680}
      maxHeight="88dvh"
    >
      <Layout
        header={
          <DialogHeader
            title={
              editingProduct
                ? isEn
                  ? 'Update Product & Cloudinary Image'
                  : 'Cập Nhật Sản Phẩm & Hình Ảnh Cloudinary'
                : isEn
                  ? 'Create New Product & Cloudinary Image'
                  : 'Thêm Sản Phẩm Mới & Hình Ảnh Cloudinary'
            }
            subtitle={
              isEn
                ? 'Currency fields are automatically formatted & validated via shared validators.'
                : 'Các trường giá tiền được tự động định dạng & kiểm tra hợp lệ bằng bộ validator dùng chung.'
            }
            onOpenChange={onOpenChange}
          />
        }
        content={
          <LayoutContent>
            <FormLayout defaultOptionality="required">
              <S3ImageUploader
                folder="products"
                label={
                  isEn
                    ? 'Product Image Field (`image` • Cloudinary Upload)'
                    : 'Trường hình ảnh sản phẩm (`image` • Tải lên Cloudinary)'
                }
                value={form.imageUrl}
                onChange={(newUrl) => onChange({ ...form, imageUrl: newUrl })}
              />

              <FormLayout direction="horizontal">
                <TextInput
                  label={isEn ? 'Product Name' : 'Tên sản phẩm'}
                  isRequired
                  value={form.name}
                  onChange={(val) => onChange({ ...form, name: val })}
                  placeholder="Túi Xách Lưới Đại Dương Sơn Trà"
                  width="100%"
                />

                <TextInput
                  label="Slug URL"
                  isOptional
                  value={form.slug}
                  onChange={(val) => onChange({ ...form, slug: val })}
                  placeholder="tui-xach-luoi-dai-duong-son-tra"
                  width="100%"
                />
              </FormLayout>

              <FormLayout direction="horizontal">
                <Selector
                  label={isEn ? 'Category' : 'Danh mục'}
                  value={form.category}
                  onChange={(val) => onChange({ ...form, category: val as ProductCategory })}
                  width="100%"
                  options={
                    categoryOptions.length > 0
                      ? categoryOptions
                      : [
                          { value: 'bag', label: 'Túi xách lưới (bag)' },
                          { value: 'basket', label: 'Giỏ đựng đồ (basket)' },
                          { value: 'wallet', label: 'Ví tiền (wallet)' },
                          { value: 'apparel', label: 'Áo quần (apparel)' },
                          { value: 'bracelet', label: 'Vòng tay (bracelet)' },
                          { value: 'accessory', label: 'Phụ kiện (accessory)' },
                        ]
                  }
                />

                <Selector
                  label="Mesh Preset 3D"
                  value={form.meshPreset}
                  onChange={(val) => onChange({ ...form, meshPreset: val })}
                  width="100%"
                  options={[
                    { value: 'tote_bag', label: 'tote_bag (Túi xách lưới)' },
                    { value: 'storage_basket', label: 'storage_basket (Giỏ tròn đan lưới)' },
                    { value: 'zip_wallet', label: 'zip_wallet (Ví cầm tay)' },
                    { value: 'eco_shirt', label: 'eco_shirt (Áo khoác Upcycled)' },
                    { value: 'woven_bracelet', label: 'woven_bracelet (Vòng tay dây lưới)' },
                    { value: 'shell_charm_set', label: 'shell_charm_set (Móc khóa phao)' },
                  ]}
                />
              </FormLayout>

              <FormLayout direction="horizontal">
                <NumberInput
                  label={isEn ? 'Base Price' : 'Giá phôi gốc'}
                  description={`${isEn ? 'Formatted:' : 'Hiển thị:'} ${formatVnd(form.basePrice)}`}
                  value={form.basePrice}
                  onChange={(val) => onChange({ ...form, basePrice: val ?? 0 })}
                  formatValue={formatNumberInputVnd}
                  status={
                    !basePriceValidation.isValid
                      ? { type: 'error', message: basePriceValidation.message }
                      : undefined
                  }
                  min={0}
                  step={10000}
                  units="VNĐ"
                  isWheelEnabled={false}
                  width="100%"
                />

                <NumberInput
                  label={isEn ? '3D Craft Fee' : 'Phí đan & khâu 3D'}
                  description={`${isEn ? 'Formatted:' : 'Hiển thị:'} ${formatVnd(form.craftFee)}`}
                  value={form.craftFee}
                  onChange={(val) => onChange({ ...form, craftFee: val ?? 0 })}
                  formatValue={formatNumberInputVnd}
                  status={
                    !craftFeeValidation.isValid
                      ? { type: 'error', message: craftFeeValidation.message }
                      : undefined
                  }
                  min={0}
                  step={5000}
                  units="VNĐ"
                  isWheelEnabled={false}
                  width="100%"
                />
              </FormLayout>

              <FormLayout direction="horizontal">
                <NumberInput
                  label={isEn ? 'Blank Stock' : 'Tồn kho phôi'}
                  value={form.stock}
                  onChange={(val) => onChange({ ...form, stock: val ?? 0 })}
                  min={0}
                  step={1}
                  isIntegerOnly
                  units={piecesLabel}
                  isWheelEnabled={false}
                  width="100%"
                />

                <NumberInput
                  label={isEn ? 'Recovered Net Weight' : 'Lượng lưới thu hồi'}
                  value={form.netWeightGrams}
                  onChange={(val) => onChange({ ...form, netWeightGrams: val ?? 0 })}
                  min={0}
                  step={10}
                  units="gram"
                  isWheelEnabled={false}
                  width="100%"
                />
              </FormLayout>

              <TextInput
                label={isEn ? 'External 3D .glb URL' : 'Đường dẫn file 3D .glb ngoài'}
                isOptional
                value={form.glbUrl}
                onChange={(val) => onChange({ ...form, glbUrl: val })}
                placeholder="/models/custom-bag.glb"
                width="100%"
              />

              <TextArea
                label={isEn ? 'Short Description' : 'Mô tả ngắn sản phẩm'}
                isOptional
                value={form.shortDescription}
                onChange={(val) => onChange({ ...form, shortDescription: val })}
                rows={2}
                width="100%"
              />

              <Switch
                label={
                  isEn
                    ? 'Allow 3D Studio Customization'
                    : 'Cho phép khách tùy biến đính ốc trong 3D Studio'
                }
                value={form.isCustomizable}
                onChange={(checked) => onChange({ ...form, isCustomizable: checked })}
              />
            </FormLayout>
          </LayoutContent>
        }
        footer={
          <LayoutFooter>
            <HStack gap={2} hAlign="end">
              <Button label={cancelLabel} variant="secondary" onClick={() => onOpenChange(false)} />
              <Button
                label={isEn ? 'Save Product' : 'Lưu sản phẩm'}
                variant="primary"
                isDisabled={!basePriceValidation.isValid || !craftFeeValidation.isValid}
                onClick={onSave}
              />
            </HStack>
          </LayoutFooter>
        }
      />
    </Dialog>
  );
}
