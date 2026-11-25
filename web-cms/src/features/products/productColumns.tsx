import React from 'react';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { StackItem } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { Badge } from '@astryxdesign/core/Badge';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { Button } from '@astryxdesign/core/Button';
import { proportional, pixel, type TableColumn } from '@astryxdesign/core/Table';
import type { CategoryItem, Product } from '@/types';
import { ASSETS, resolveAssetUrl } from '@/config/assets';
import { formatVnd } from '@/lib/validators';

export type ProductRow = Product & Record<string, unknown>;

export interface ProductColumnsOptions {
  isEn: boolean;
  piecesLabel: string;
  categories: CategoryItem[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function createProductColumns({
  isEn,
  piecesLabel,
  categories,
  onEdit,
  onDelete,
}: ProductColumnsOptions): TableColumn<ProductRow>[] {
  return [
    {
      key: 'name',
      header: isEn ? 'Product & Cloudinary Image' : 'Sản phẩm & Hình ảnh Cloudinary',
      width: proportional(2.2, { minWidth: 260 }),
      renderCell: (row) => {
        const rawImg = row.image || row.imageUrl || row.thumbnail || row.images?.[0];
        return (
          <HStack gap={3} vAlign="center">
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 8,
                overflow: 'hidden',
                flexShrink: 0,
                border: '1px solid var(--color-border)',
                background: 'var(--color-background-surface)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveAssetUrl(rawImg, ASSETS.placeholders.product)}
                alt={row.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
            <VStack gap={0.5}>
              <Text weight="semibold">{isEn ? row.nameEn || row.name : row.name}</Text>
              <Text type="supporting">
                Mesh: {row.model3D?.meshPreset || 'tote_bag'} •{' '}
                {row.ecoImpact?.netWeightGrams || 350}g lưới thu hồi
              </Text>
            </VStack>
          </HStack>
        );
      },
    },
    {
      key: 'category',
      header: isEn ? 'Category' : 'Danh mục',
      width: proportional(0.9, { minWidth: 120 }),
      renderCell: (row) => {
        const matchedCat = categories.find((c) => c.slug === row.category);
        return (
          <Badge
            variant="neutral"
            label={
              matchedCat
                ? isEn
                  ? matchedCat.nameEn || matchedCat.name
                  : matchedCat.name
                : row.category
            }
          />
        );
      },
    },
    {
      key: 'basePrice',
      header: isEn ? 'Base Price & 3D Fee' : 'Giá phôi & Phí khâu 3D',
      width: proportional(1.1, { minWidth: 160 }),
      align: 'end',
      renderCell: (row) => (
        <VStack gap={0.5} hAlign="end">
          <Text weight="semibold" hasTabularNumbers>
            {formatVnd(row.basePrice)}
          </Text>
          <Text type="supporting" hasTabularNumbers>
            +{formatVnd(row.craftFee)} phí đan 3D
          </Text>
        </VStack>
      ),
    },
    {
      key: 'stock',
      header: isEn ? 'Stock' : 'Tồn kho phôi',
      width: proportional(0.9, { minWidth: 120 }),
      align: 'end',
      renderCell: (row) => (
        <HStack gap={1.5} vAlign="center" hAlign="end">
          <StatusDot
            variant={row.stock <= 0 ? 'error' : row.stock <= 10 ? 'warning' : 'success'}
            label={row.stock <= 0 ? 'Out of stock' : 'In stock'}
          />
          <Text hasTabularNumbers>
            {row.stock} {piecesLabel}
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
