'use client';

import React from 'react';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { StackItem } from '@astryxdesign/core/Stack';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Selector } from '@astryxdesign/core/Selector';
import { Button } from '@astryxdesign/core/Button';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Table, type TableColumn } from '@astryxdesign/core/Table';
import { useCms } from '@/context/CmsContext';
import type { OrderRow } from './orderColumns';

export interface OrdersTabProps {
  orderSearch: string;
  onOrderSearchChange: (val: string) => void;
  orderStatusFilter: string;
  onOrderStatusFilterChange: (val: string) => void;
  filteredOrders: OrderRow[];
  orderColumns: TableColumn<OrderRow>[];
}

export function OrdersTab({
  orderSearch,
  onOrderSearchChange,
  orderStatusFilter,
  onOrderStatusFilterChange,
  filteredOrders,
  orderColumns,
}: OrdersTabProps) {
  const { isEn, t } = useCms();

  const resetFilters = () => {
    onOrderSearchChange('');
    onOrderStatusFilterChange('all');
  };

  return (
    <VStack gap={5}>
      <HStack gap={3} vAlign="end" wrap="wrap">
        <StackItem size="fill">
          <TextInput
            type="search"
            label={isEn ? 'Search orders' : 'Tìm kiếm đơn hàng'}
            value={orderSearch}
            onChange={onOrderSearchChange}
            placeholder={
              isEn
                ? 'Order code DTU-..., customer name, or phone...'
                : 'Nhập mã đơn DTU-..., tên khách hàng hoặc SĐT...'
            }
            startIcon="search"
            hasClear
            width="100%"
          />
        </StackItem>

        <Selector
          label={isEn ? 'Crafting Stage' : 'Lọc theo tiến độ chế tác'}
          value={orderStatusFilter}
          onChange={onOrderStatusFilterChange}
          width={240}
          options={[
            { value: 'all', label: isEn ? 'All stages (7)' : 'Tất cả trạng thái (7)' },
            { value: 'pending', label: t('status.pending') },
            { value: 'confirmed', label: t('status.confirmed') },
            { value: 'in_crafting', label: t('status.in_crafting') },
            { value: 'quality_check', label: t('status.quality_check') },
            { value: 'shipping', label: t('status.shipping') },
            { value: 'delivered', label: t('status.delivered') },
            { value: 'cancelled', label: t('status.cancelled') },
          ]}
        />

        {(orderSearch || orderStatusFilter !== 'all') && (
          <Button label={isEn ? 'Reset' : 'Xóa lọc'} variant="ghost" onClick={resetFilters} />
        )}
      </HStack>

      {filteredOrders.length === 0 ? (
        <EmptyState
          title={isEn ? 'No matching orders found' : 'Không tìm thấy đơn hàng phù hợp'}
          description={
            isEn
              ? 'Try clearing your search query or status filter.'
              : 'Hãy thử xóa từ khóa tìm kiếm hoặc chọn lại bộ lọc trạng thái.'
          }
          actions={
            <Button
              label={isEn ? 'Reset Filters' : 'Đặt lại bộ lọc'}
              variant="secondary"
              onClick={resetFilters}
            />
          }
        />
      ) : (
        <Table
          data={filteredOrders}
          columns={orderColumns}
          idKey="orderCode"
          density="balanced"
          hasHover
        />
      )}
    </VStack>
  );
}
