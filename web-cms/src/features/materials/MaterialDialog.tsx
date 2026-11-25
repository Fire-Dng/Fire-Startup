'use client';

import React from 'react';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { Layout, LayoutContent, LayoutFooter } from '@astryxdesign/core/Layout';
import { FormLayout } from '@astryxdesign/core/FormLayout';
import { TextInput } from '@astryxdesign/core/TextInput';
import { NumberInput } from '@astryxdesign/core/NumberInput';
import { Selector } from '@astryxdesign/core/Selector';
import { HStack } from '@astryxdesign/core/HStack';
import { Button } from '@astryxdesign/core/Button';
import { S3ImageUploader } from '@/components/common/S3ImageUploader';
import { formatNumberInputVnd, formatVnd } from '@/lib/validators';
import type { CustomMaterial, MaterialCategory } from '@/types';

export interface MaterialFormState {
  name: string;
  materialType: MaterialCategory;
  unitPrice: number;
  stockQuantity: number;
  colorHex: string;
  thumbnail: string;
  meshPreset: string;
  glbUrl: string;
  description: string;
}

export interface MaterialDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingMaterial: CustomMaterial | null;
  form: MaterialFormState;
  onChange: (next: MaterialFormState) => void;
  onSave: () => void;
  unitPriceValidation: { isValid: boolean; message?: string };
  isEn: boolean;
  piecesLabel: string;
  cancelLabel: string;
}

export function MaterialDialog({
  isOpen,
  onOpenChange,
  editingMaterial,
  form,
  onChange,
  onSave,
  unitPriceValidation,
  isEn,
  piecesLabel,
  cancelLabel,
}: MaterialDialogProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      purpose="form"
      width={620}
      maxHeight="85dvh"
    >
      <Layout
        header={
          <DialogHeader
            title={
              editingMaterial
                ? isEn
                  ? 'Update Shell / Snail Material'
                  : 'Cập Nhật Nguyên Liệu Vỏ Sò / Ốc Biển'
                : isEn
                  ? 'Add New Marine Accessory'
                  : 'Thêm Phụ Kiện Biển Mới'
            }
            onOpenChange={onOpenChange}
          />
        }
        content={
          <LayoutContent>
            <FormLayout defaultOptionality="required">
              <S3ImageUploader
                folder="materials"
                compact
                label={
                  isEn
                    ? 'Shell / Snail Image (Cloudinary Upload)'
                    : 'Hình ảnh vỏ sò / ốc biển (Tải lên Cloudinary)'
                }
                value={form.thumbnail}
                onChange={(newUrl) => onChange({ ...form, thumbnail: newUrl })}
              />

              <FormLayout direction="horizontal">
                <TextInput
                  label={isEn ? 'Material Name' : 'Tên vỏ sò / ốc / charm'}
                  isRequired
                  value={form.name}
                  onChange={(val) => onChange({ ...form, name: val })}
                  width="100%"
                />

                <Selector
                  label={isEn ? 'Material Group' : 'Nhóm phụ kiện'}
                  value={form.materialType}
                  onChange={(val) =>
                    onChange({ ...form, materialType: val as MaterialCategory })
                  }
                  width="100%"
                  options={[
                    { value: 'shell', label: 'Vỏ sò (shell)' },
                    { value: 'snail', label: 'Ốc biển (snail)' },
                    { value: 'charm', label: 'Charm biển (charm)' },
                    { value: 'bead', label: 'Ngọc trai / Hạt (bead)' },
                    { value: 'cord', label: 'Nút dây lưới (cord)' },
                  ]}
                />
              </FormLayout>

              <FormLayout direction="horizontal">
                <Selector
                  label="Mesh Preset 3D"
                  value={form.meshPreset}
                  onChange={(val) => onChange({ ...form, meshPreset: val })}
                  width="100%"
                  options={[
                    { value: 'scallop_shell', label: 'scallop_shell (Vỏ sò điệp)' },
                    { value: 'cowrie_shell', label: 'cowrie_shell (Ốc sứ)' },
                    { value: 'spiral_snail', label: 'spiral_snail (Ốc xoắn)' },
                    { value: 'turban_snail', label: 'turban_snail (Ốc xà cừ)' },
                    { value: 'starfish_charm', label: 'starfish_charm (Sao biển)' },
                    { value: 'turtle_charm', label: 'turtle_charm (Rùa biển)' },
                    { value: 'pearl_bead', label: 'pearl_bead (Ngọc trai)' },
                    { value: 'fishing_cord_knot', label: 'fishing_cord_knot (Nút dây lưới)' },
                  ]}
                />

                <TextInput
                  label={isEn ? 'Color Hex' : 'Mã màu Hex 3D'}
                  value={form.colorHex}
                  onChange={(val) => onChange({ ...form, colorHex: val })}
                  width="100%"
                />
              </FormLayout>

              <FormLayout direction="horizontal">
                <NumberInput
                  label={isEn ? 'Unit Price' : 'Đơn giá đính 3D'}
                  description={`${isEn ? 'Formatted:' : 'Hiển thị:'} ${formatVnd(form.unitPrice)}`}
                  value={form.unitPrice}
                  onChange={(val) => onChange({ ...form, unitPrice: val ?? 0 })}
                  formatValue={formatNumberInputVnd}
                  status={
                    !unitPriceValidation.isValid
                      ? { type: 'error', message: unitPriceValidation.message }
                      : undefined
                  }
                  min={0}
                  step={1000}
                  units="VNĐ"
                  isWheelEnabled={false}
                  width="100%"
                />

                <NumberInput
                  label={isEn ? 'Stock Quantity (BOM)' : 'Số lượng tồn kho (BOM)'}
                  value={form.stockQuantity}
                  onChange={(val) => onChange({ ...form, stockQuantity: val ?? 0 })}
                  min={0}
                  step={1}
                  isIntegerOnly
                  units={piecesLabel}
                  isWheelEnabled={false}
                  width="100%"
                />
              </FormLayout>
            </FormLayout>
          </LayoutContent>
        }
        footer={
          <LayoutFooter>
            <HStack gap={2} hAlign="end">
              <Button label={cancelLabel} variant="secondary" onClick={() => onOpenChange(false)} />
              <Button
                label={isEn ? 'Save Material' : 'Lưu nguyên liệu'}
                variant="primary"
                isDisabled={!unitPriceValidation.isValid}
                onClick={onSave}
              />
            </HStack>
          </LayoutFooter>
        }
      />
    </Dialog>
  );
}
