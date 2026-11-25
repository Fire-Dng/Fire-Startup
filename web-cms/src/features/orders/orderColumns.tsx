import React from 'react';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { StackItem } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { Badge } from '@astryxdesign/core/Badge';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { Button } from '@astryxdesign/core/Button';
import { proportional, pixel, type TableColumn } from '@astryxdesign/core/Table';
import type { Order, OrderStatus } from '@/types';
import { formatVnd } from '@/lib/validators';
import {
  formatDateTimeDisplay,
  getOrderStatusInfo,
  NEXT_ORDER_STATUS,
} from './orderStatus';

export type OrderRow = Order & Record<string, unknown>;

export interface OrderColumnsOptions {
  isEn: boolean;
  isHydrated: boolean;
  onStepStatus: (order: Order, nextStatus: OrderStatus) => void;
  onOpenInspector: (order: Order) => void;
}

export function createOrderColumns({
  isEn,
  isHydrated,
  onStepStatus,
  onOpenInspector,
}: OrderColumnsOptions): TableColumn<OrderRow>[] {
  return [
    {
      key: 'orderCode',
      header: isEn ? 'Order Code' : 'Mã đơn hàng',
      width: proportional(1.2, { minWidth: 160 }),
      renderCell: (row) => (
        <VStack gap={0.5}>
          <Text type="code" weight="semibold">
            {row.orderCode}
          </Text>
          <Text type="supporting" hasTabularNumbers>
            {isHydrated ? formatDateTimeDisplay(row.createdAt, isEn) : row.createdAt.slice(0, 10)}
          </Text>
        </VStack>
      ),
    },
    {
      key: 'customerInfo',
      header: isEn ? 'Customer' : 'Khách hàng',
      width: proportional(1.2, { minWidth: 165 }),
      renderCell: (row) => (
        <VStack gap={0.5}>
          <Text weight="medium">{row.customerInfo.fullName}</Text>
          <Text type="supporting" hasTabularNumbers>
            {row.customerInfo.phone}
          </Text>
        </VStack>
      ),
    },
    {
      key: 'items',
      header: isEn ? 'Order Type' : 'Phân loại đơn',
      width: proportional(1.1, { minWidth: 150 }),
      renderCell: (row) => {
        const customItem = row.items.find((i) => i.isCustom);
        const charmCount = customItem?.customDesignSnapshot?.placements?.length || 0;
        return customItem ? (
          <VStack gap={0.5}>
            <Text weight="medium">{isEn ? '3D Custom Craft' : 'Chế tác 3D'}</Text>
            <Text type="supporting">
              {charmCount > 0
                ? isEn
                  ? `${charmCount} attached shells`
                  : `Đính ${charmCount} vỏ sò / charm`
                : isEn
                  ? 'Custom color / size'
                  : 'Tùy chỉnh màu dây'}
            </Text>
          </VStack>
        ) : (
          <Text type="supporting">{isEn ? 'Standard Blank' : 'Phôi tiêu chuẩn'}</Text>
        );
      },
    },
    {
      key: 'finalAmount',
      header: isEn ? 'Total & Payment' : 'Tổng tiền & Thanh toán',
      width: proportional(1.1, { minWidth: 160 }),
      align: 'end',
      renderCell: (row) => (
        <VStack gap={0.5} hAlign="end">
          <Text weight="semibold" hasTabularNumbers>
            {formatVnd(row.finalAmount)}
          </Text>
          <HStack gap={1} vAlign="center" hAlign="end">
            <StatusDot
              variant={row.paymentStatus === 'paid' ? 'success' : 'warning'}
              label={row.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
            />
            <Text type="supporting">
              {row.paymentStatus === 'paid'
                ? isEn
                  ? 'Paid (VietQR)'
                  : 'Đã thanh toán'
                : isEn
                  ? 'Unpaid (COD)'
                  : 'Chưa thu tiền'}
            </Text>
          </HStack>
        </VStack>
      ),
    },
    {
      key: 'status',
      header: isEn ? 'Crafting Stage' : 'Tiến độ chế tác',
      width: proportional(1.1, { minWidth: 160 }),
      renderCell: (row) => {
        const st = getOrderStatusInfo(row.status, isEn);
        return <Badge variant={st.badgeVariant} label={st.label} />;
      },
    },
    {
      key: '_id',
      header: isEn ? 'Actions' : 'Thao tác',
      width: pixel(270),
      align: 'end',
      renderCell: (row) => {
        const nextSt = NEXT_ORDER_STATUS[row.status];
        return (
          <HStack gap={1.5} hAlign="end" vAlign="center">
            {nextSt && (
              <StackItem size="static">
                <Button
                  label={isEn ? 'Next Stage' : 'Bước kế tiếp'}
                  variant="secondary"
                  size="sm"
                  onClick={() => onStepStatus(row, nextSt)}
                />
              </StackItem>
            )}
            <StackItem size="static">
              <Button
                label={isEn ? 'Open 3D Ticket' : 'Mở phiếu 3D'}
                variant="primary"
                size="sm"
                onClick={() => onOpenInspector(row)}
              />
            </StackItem>
          </HStack>
        );
      },
    },
  ];
}
