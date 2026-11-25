import React from 'react';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { StackItem } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { Badge } from '@astryxdesign/core/Badge';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { Button } from '@astryxdesign/core/Button';
import { proportional, pixel, type TableColumn } from '@astryxdesign/core/Table';
import type { CustomMaterial } from '@/types';
import { ASSETS, resolveAssetUrl } from '@/config/assets';
import { formatVnd } from '@/lib/validators';

export type MaterialRow = CustomMaterial & Record<string, unknown>;

export interface MaterialColumnsOptions {
  isEn: boolean;
  piecesLabel: string;
  onEdit: (material: CustomMaterial) => void;
  onDelete: (material: CustomMaterial) => void;
}

export function createMaterialColumns({
  isEn,
  piecesLabel,
  onEdit,
  onDelete,
}: MaterialColumnsOptions): TableColumn<MaterialRow>[] {
  return [
    {
      key: 'name',
      header: isEn ? 'Marine Shell / Snail Material' : 'Nguyên liệu vỏ sò / ốc biển',
      width: proportional(2.1, { minWidth: 240 }),
      renderCell: (row) => (
        <HStack gap={3} vAlign="center">
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              overflow: 'hidden',
              flexShrink: 0,
              border: '1px solid var(--color-border)',
              background: 'var(--color-background-surface)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolveAssetUrl(row.thumbnail, ASSETS.materials.scallopShell)}
              alt={row.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
          <VStack gap={0.5}>
            <Text weight="semibold">{row.name}</Text>
            <Text type="supporting">
              Preset 3D: {row.model3D?.meshPreset} • Màu {row.colorHex}
            </Text>
          </VStack>
        </HStack>
      ),
    },
    {
      key: 'materialType',
      header: isEn ? 'Group' : 'Nhóm phụ kiện',
      width: proportional(0.9, { minWidth: 120 }),
      renderCell: (row) => <Badge variant="neutral" label={row.materialType} />,
    },
    {
      key: 'unitPrice',
      header: isEn ? 'Unit Price' : 'Đơn giá đính 3D',
      width: proportional(1, { minWidth: 145 }),
      align: 'end',
      renderCell: (row) => (
        <Text weight="medium" hasTabularNumbers>
          {formatVnd(row.unitPrice)} / {piecesLabel}
        </Text>
      ),
    },
    {
      key: 'stockQuantity',
      header: isEn ? 'BOM Inventory' : 'Tồn kho BOM',
      width: proportional(1, { minWidth: 140 }),
      align: 'end',
      renderCell: (row) => (
        <HStack gap={1.5} vAlign="center" hAlign="end">
          <StatusDot
            variant={
              row.stockQuantity <= 0
                ? 'error'
                : row.stockQuantity <= 15
                  ? 'warning'
                  : 'success'
            }
            label={row.stockQuantity <= 15 ? 'Low stock' : 'In stock'}
          />
          <Text hasTabularNumbers weight={row.stockQuantity <= 15 ? 'semibold' : 'normal'}>
            {row.stockQuantity} {piecesLabel}
          </Text>
        </HStack>
      ),
    },
    {
      key: '_id',
      header: isEn ? 'Actions' : 'Thao tác',
      width: pixel(190),
      align: 'end',
      renderCell: (row) => (
        <HStack gap={1.5} hAlign="end">
          <StackItem size="static">
            <Button
              label={isEn ? 'Edit' : 'Chỉnh sửa'}
              variant="secondary"
              size="sm"
              onClick={() => onEdit(row)}
            />
          </StackItem>
          <StackItem size="static">
            <Button
              label={isEn ? 'Delete' : 'Xóa'}
              variant="ghost"
              size="sm"
              onClick={() => onDelete(row)}
            />
          </StackItem>
        </HStack>
      ),
    },
  ];
}
