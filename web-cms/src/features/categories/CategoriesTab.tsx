'use client';

import React from 'react';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { StackItem } from '@astryxdesign/core/Stack';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Selector } from '@astryxdesign/core/Selector';
import { Table, type TableColumn } from '@astryxdesign/core/Table';
import { useCms } from '@/context/CmsContext';
import type { CategoryRow } from './categoryColumns';

export interface CategoriesTabProps {
  categorySearch: string;
  onCategorySearchChange: (val: string) => void;
  categoryTypeFilter: string;
  onCategoryTypeFilterChange: (val: string) => void;
  filteredCategories: CategoryRow[];
  categoryColumns: TableColumn<CategoryRow>[];
}

export function CategoriesTab({
  categorySearch,
  onCategorySearchChange,
  categoryTypeFilter,
  onCategoryTypeFilterChange,
  filteredCategories,
  categoryColumns,
}: CategoriesTabProps) {
  const { isEn } = useCms();

  return (
    <VStack gap={5}>
      <HStack gap={3} vAlign="end" wrap="wrap">
        <StackItem size="fill">
          <TextInput
            type="search"
            label={isEn ? 'Search categories' : 'Tìm kiếm danh mục'}
            value={categorySearch}
            onChange={onCategorySearchChange}
            placeholder={
              isEn
                ? 'Search by category name or slug...'
                : 'Nhập tên danh mục hoặc mã định danh (bag, basket, wallet...)'
            }
            startIcon="search"
            hasClear
            width="100%"
          />
        </StackItem>

        <Selector
          label={isEn ? 'Category Scope' : 'Loại danh mục'}
          value={categoryTypeFilter}
          onChange={onCategoryTypeFilterChange}
          width={220}
          options={[
            { value: 'all', label: isEn ? 'All categories' : 'Tất cả danh mục' },
            { value: 'product', label: isEn ? 'Product Categories' : 'Danh mục sản phẩm' },
            { value: 'material', label: isEn ? 'Material Groups' : 'Nhóm nguyên liệu BOM' },
          ]}
        />
      </HStack>

      <Table
        data={filteredCategories}
        columns={categoryColumns}
        idKey="_id"
        density="balanced"
        hasHover
      />
    </VStack>
  );
}
