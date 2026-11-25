'use client';

import React from 'react';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { StackItem } from '@astryxdesign/core/Stack';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Selector } from '@astryxdesign/core/Selector';
import { Table, type TableColumn } from '@astryxdesign/core/Table';
import { useCms } from '@/context/CmsContext';
import type { MaterialRow } from './materialColumns';

export interface MaterialsTabProps {
  materialSearch: string;
  onMaterialSearchChange: (val: string) => void;
  materialTypeFilter: string;
  onMaterialTypeFilterChange: (val: string) => void;
  filteredMaterials: MaterialRow[];
  materialColumns: TableColumn<MaterialRow>[];
}

export function MaterialsTab({
  materialSearch,
  onMaterialSearchChange,
  materialTypeFilter,
  onMaterialTypeFilterChange,
  filteredMaterials,
  materialColumns,
}: MaterialsTabProps) {
  const { isEn } = useCms();

  return (
    <VStack gap={5}>
      <HStack gap={3} vAlign="end" wrap="wrap">
        <StackItem size="fill">
          <TextInput
            type="search"
            label={isEn ? 'Search shells, snails, charms' : 'Tìm kiếm nguyên liệu BOM'}
            value={materialSearch}
            onChange={onMaterialSearchChange}
            placeholder={
              isEn
                ? 'Search scallop shell, spiral snail, starfish...'
                : 'Tìm vỏ sò điệp, ốc xoắn, sao biển...'
            }
            startIcon="search"
            hasClear
            width="100%"
          />
        </StackItem>

        <Selector
          label={isEn ? 'Material Group' : 'Nhóm phụ kiện'}
          value={materialTypeFilter}
          onChange={onMaterialTypeFilterChange}
          width={220}
          options={[
            { value: 'all', label: isEn ? 'All groups' : 'Tất cả nhóm phụ kiện' },
            { value: 'shell', label: 'Vỏ sò (Shell)' },
            { value: 'snail', label: 'Ốc biển (Snail)' },
            { value: 'charm', label: 'Charm biển (Charm)' },
            { value: 'bead', label: 'Ngọc trai / Hạt (Bead)' },
            { value: 'cord', label: 'Nút dây lưới (Cord)' },
          ]}
        />
      </HStack>

      <Table
        data={filteredMaterials}
        columns={materialColumns}
        idKey="_id"
        density="balanced"
        hasHover
      />
    </VStack>
  );
}
