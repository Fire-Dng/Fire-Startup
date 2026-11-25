import React from 'react';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { StackItem } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { Button } from '@astryxdesign/core/Button';
import { proportional, pixel, type TableColumn } from '@astryxdesign/core/Table';
import type { CategoryItem } from '@/types';

export type CategoryRow = CategoryItem & Record<string, unknown>;

export interface CategoryColumnsOptions {
  isEn: boolean;
  piecesLabel: string;
  onEdit: (category: CategoryItem) => void;
  onDelete: (category: CategoryItem) => void;
}

export function createCategoryColumns({
  isEn,
  piecesLabel,
  onEdit,
  onDelete,
}: CategoryColumnsOptions): TableColumn<CategoryRow>[] {
  return [
    {
      key: 'name',
      header: isEn ? 'Category Name & Slug' : 'Tên danh mục & Mã định danh',
      width: proportional(1.8, { minWidth: 220 }),
      renderCell: (row) => (
        <VStack gap={0.5}>
          <Text weight="semibold">{isEn ? row.nameEn || row.name : row.name}</Text>
          <Text type="code">{row.slug}</Text>
        </VStack>
      ),
    },
    {
      key: 'description',
      header: isEn ? 'Description & 3D Preset' : 'Mô tả & Phôi 3D mặc định',
      width: proportional(2, { minWidth: 240 }),
      renderCell: (row) => (
        <VStack gap={0.5}>
          <Text type="supporting">{row.description || '—'}</Text>
          <Text type="supporting">
            Preset 3D: <Text type="code">{row.meshPresetDefault || 'tote_bag'}</Text>
          </Text>
        </VStack>
      ),
    },
    {
      key: 'itemCount',
      header: isEn ? 'Products / Items' : 'Số sản phẩm',
      width: proportional(0.9, { minWidth: 120 }),
      align: 'end',
      renderCell: (row) => (
        <Text weight="semibold" hasTabularNumbers>
          {row.itemCount ?? 0} {isEn ? 'items' : 'mẫu'}
        </Text>
      ),
    },
    {
      key: 'totalStock',
      header: isEn ? 'Total Stock' : 'Tổng tồn kho',
      width: proportional(0.9, { minWidth: 120 }),
      align: 'end',
      renderCell: (row) => (
        <Text hasTabularNumbers>
          {row.totalStock ?? 0} {piecesLabel}
        </Text>
      ),
    },
    {
      key: 'isActive',
      header: isEn ? 'Status' : 'Trạng thái',
      width: proportional(0.8, { minWidth: 120 }),
      renderCell: (row) => (
        <HStack gap={1.5} vAlign="center">
          <StatusDot
            variant={row.isActive ? 'success' : 'neutral'}
            label={row.isActive ? 'Active' : 'Hidden'}
          />
          <Text type="supporting">
            {row.isActive ? (isEn ? 'Active' : 'Hiển thị') : isEn ? 'Hidden' : 'Đang ẩn'}
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
