'use client';

import React from 'react';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { StackItem } from '@astryxdesign/core/Stack';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Selector } from '@astryxdesign/core/Selector';
import { Table, type TableColumn } from '@astryxdesign/core/Table';
import { useCms } from '@/context/CmsContext';
import type { ProductRow } from './productColumns';

export interface ProductsTabProps {
  productSearch: string;
  onProductSearchChange: (val: string) => void;
  productCatFilter: string;
  onProductCatFilterChange: (val: string) => void;
  categoryOptions: Array<{ value: string; label: string }>;
  filteredProducts: ProductRow[];
  productColumns: TableColumn<ProductRow>[];
}

export function ProductsTab({
  productSearch,
  onProductSearchChange,
  productCatFilter,
  onProductCatFilterChange,
  categoryOptions,
  filteredProducts,
  productColumns,
}: ProductsTabProps) {
  const { isEn, t } = useCms();

  return (
    <VStack gap={5}>
      <HStack gap={3} vAlign="end" wrap="wrap">
        <StackItem size="fill">
          <TextInput
            type="search"
            label={isEn ? 'Search products' : 'Tìm kiếm sản phẩm'}
            value={productSearch}
            onChange={onProductSearchChange}
            placeholder={
              isEn
                ? 'Search product by name...'
                : 'Nhập tên túi lưới, giỏ, ví, vòng tay...'
            }
            startIcon="search"
            hasClear
            width="100%"
          />
        </StackItem>

        <Selector
          label={isEn ? 'Category' : 'Danh mục sản phẩm'}
          value={productCatFilter}
          onChange={onProductCatFilterChange}
          width={240}
          options={[{ value: 'all', label: t('categories.all') }, ...categoryOptions]}
        />
      </HStack>

      <Table
        data={filteredProducts}
        columns={productColumns}
        idKey="_id"
        density="balanced"
        hasHover
      />
    </VStack>
  );
}
