'use client';

import React from 'react';
import { Drawer, DrawerHeader } from '@astryxdesign/core/Drawer';
import { Layout, LayoutContent, LayoutFooter } from '@astryxdesign/core/Layout';
import { Card } from '@astryxdesign/core/Card';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Divider } from '@astryxdesign/core/Divider';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Badge } from '@astryxdesign/core/Badge';
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { MetadataList, MetadataListItem } from '@astryxdesign/core/MetadataList';
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput';
import { ProgressBar } from '@astryxdesign/core/ProgressBar';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { ThreeCanvasViewer } from '@/components/three/ThreeCanvasViewer';
import { formatVnd } from '@/lib/validators';
import type { Order, OrderStatus } from '@/types';
import {
  getOrderStatusInfo,
  NEXT_ORDER_STATUS,
  ORDER_STAGE_STEPS,
} from '../orderStatus';

export interface OrderInspectorDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  isEn: boolean;
  selectedPlacementId: string | null;
  onSelectPlacement: (id: string | null) => void;
  checkedPlacementIds: string[];
  onTogglePlacementCheck: (id: string, checked: boolean) => void;
  onStepStatus: (order: Order, nextStatus: OrderStatus) => void;
  onTogglePayment: (order: Order) => void;
}

export function OrderInspectorDrawer({
  isOpen,
  onOpenChange,
  order,
  isEn,
  selectedPlacementId,
  onSelectPlacement,
  checkedPlacementIds,
  onTogglePlacementCheck,
  onStepStatus,
  onTogglePayment,
}: OrderInspectorDrawerProps) {
  const customItem = order?.items.find((i) => i.isCustom && i.customDesignSnapshot);
  const statusInfo = order ? getOrderStatusInfo(order.status, isEn) : null;

  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      label={isEn ? '3D Crafting Inspector Workstation' : 'Máy trạm chế tác 3D Inspector'}
      width={760}
    >
      <Layout
        header={
          <DrawerHeader
            title={
              order
                ? `${isEn ? '3D Crafting Ticket:' : 'Phiếu chế tác 3D:'} ${order.orderCode}`
                : isEn
                  ? '3D Crafting Inspector'
                  : 'Máy Trạm Chế Tác 3D'
            }
            subtitle={
              order ? `${order.customerInfo.fullName} • ${order.customerInfo.phone}` : undefined
            }
            endContent={
              statusInfo ? (
                <Badge variant={statusInfo.badgeVariant} label={statusInfo.label} />
              ) : undefined
            }
            onOpenChange={onOpenChange}
          />
        }
        content={
          <LayoutContent>
            {order && (
              <VStack gap={5}>
                <Card>
                  <VStack gap={3}>
                    <ProgressBar
                      label={
                        isEn
                          ? 'Crafting Progress (BR-05)'
                          : 'Tiến độ chế tác đơn hàng (BR-05)'
                      }
                      value={statusInfo?.progressPct || 0}
                      max={100}
                      hasValueLabel
                      variant={order.status === 'delivered' ? 'success' : 'accent'}
                    />
                    <HStack gap={1.5} wrap="wrap">
                      {ORDER_STAGE_STEPS.map((st) => {
                        const info = getOrderStatusInfo(st, isEn);
                        const isCurrent = order.status === st;
                        return (
                          <Button
                            key={st}
                            label={info.label}
                            variant={isCurrent ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => onStepStatus(order, st)}
                          />
                        );
                      })}
                    </HStack>
                  </VStack>
                </Card>

                <MetadataList columns={2}>
                  <MetadataListItem label={isEn ? 'Customer' : 'Khách hàng'}>
                    {order.customerInfo.fullName} ({order.customerInfo.phone})
                  </MetadataListItem>
                  <MetadataListItem label={isEn ? 'Shipping Address' : 'Địa chỉ giao hàng'}>
                    {order.customerInfo.address}
                  </MetadataListItem>
                  <MetadataListItem label={isEn ? 'Total Amount' : 'Tổng thanh toán'}>
                    <Text weight="semibold" hasTabularNumbers>
                      {formatVnd(order.finalAmount)} ({order.paymentMethod.toUpperCase()})
                    </Text>
                  </MetadataListItem>
                  <MetadataListItem label={isEn ? 'Payment Status' : 'Trạng thái thu tiền'}>
                    <Button
                      label={
                        order.paymentStatus === 'paid'
                          ? isEn
                            ? 'Paid — Click to toggle'
                            : 'Đã thu tiền (Chạm để đổi)'
                          : isEn
                            ? 'Unpaid — Click to mark paid'
                            : 'Chưa thu tiền (Bấm xác nhận thu)'
                      }
                      variant="secondary"
                      size="sm"
                      onClick={() => onTogglePayment(order)}
                    />
                  </MetadataListItem>
                </MetadataList>

                {customItem && customItem.customDesignSnapshot ? (
                  <VStack gap={4}>
                    <Heading level={3}>
                      {isEn
                        ? 'Interactive 3D Blueprint & Shell Coordinates'
                        : 'Mô hình 3D & Tọa độ đính Vỏ sò / Ốc biển'}
                    </Heading>

                    <div
                      style={{
                        height: 340,
                        width: '100%',
                        borderRadius: 12,
                        overflow: 'hidden',
                        border: '1px solid var(--color-border)',
                        background: 'var(--color-background-surface)',
                      }}
                    >
                      <ThreeCanvasViewer
                        mode="inspector"
                        productPreset={customItem.customDesignSnapshot.meshPreset || 'tote_bag'}
                        productGlbUrl={customItem.customDesignSnapshot.glbUrl}
                        baseColor={customItem.customDesignSnapshot.baseColor}
                        strapColor={customItem.customDesignSnapshot.strapColor}
                        placements={customItem.customDesignSnapshot.placements}
                        braceletConfig={customItem.customDesignSnapshot.braceletConfig}
                        selectedPlacementId={selectedPlacementId}
                        onSelectPlacement={onSelectPlacement}
                        className="h-full w-full"
                      />
                    </div>

                    {customItem.customDesignSnapshot.artisanNote && (
                      <Banner
                        status="info"
                        container="card"
                        collapsible={false}
                        title={
                          isEn ? 'Customer Note for Artisan' : 'Ghi chú của khách cho nghệ nhân'
                        }
                        description={customItem.customDesignSnapshot.artisanNote}
                      />
                    )}

                    <Card>
                      <VStack gap={3}>
                        <HStack gap={2} vAlign="center" hAlign="between">
                          <Heading level={4}>
                            {isEn
                              ? 'Artisan BOM Attachment Checklist'
                              : 'Checklist phụ kiện Vỏ sò / Ốc cần đính (BOM)'}
                          </Heading>
                          <Badge
                            variant="neutral"
                            label={`${checkedPlacementIds.length}/${customItem.customDesignSnapshot.placements.length}`}
                          />
                        </HStack>

                        <Divider />

                        <VStack gap={2}>
                          {customItem.customDesignSnapshot.placements.map((pl, idx) => {
                            const isChecked = checkedPlacementIds.includes(pl.placementId);
                            return (
                              <HStack
                                key={pl.placementId}
                                gap={3}
                                vAlign="center"
                                hAlign="between"
                              >
                                <CheckboxInput
                                  label={`#${idx + 1} ${pl.materialName}`}
                                  description={`Tọa độ 3D: (${pl.position
                                    .map((n) => n.toFixed(2))
                                    .join(', ')}) • Góc xoay: ${pl.rotation}° • Tỉ lệ: ${pl.scale}x`}
                                  value={isChecked}
                                  onChange={(checked) => {
                                    onSelectPlacement(pl.placementId);
                                    onTogglePlacementCheck(pl.placementId, checked);
                                  }}
                                />
                                <Text type="code" hasTabularNumbers>
                                  +{formatVnd(pl.unitPrice)}
                                </Text>
                              </HStack>
                            );
                          })}
                        </VStack>

                        <Divider />

                        <MetadataList columns={3}>
                          <MetadataListItem label={isEn ? 'Base Blank' : 'Giá phôi lưới'}>
                            {formatVnd(customItem.customDesignSnapshot.basePrice)}
                          </MetadataListItem>
                          <MetadataListItem label={isEn ? '3D Craft Fee' : 'Phí khâu 3D'}>
                            +{formatVnd(customItem.customDesignSnapshot.craftFee)}
                          </MetadataListItem>
                          <MetadataListItem label={isEn ? 'BOM Materials' : 'Tổng phụ kiện'}>
                            +{formatVnd(customItem.customDesignSnapshot.materialsTotal)}
                          </MetadataListItem>
                        </MetadataList>
                      </VStack>
                    </Card>
                  </VStack>
                ) : (
                  <EmptyState
                    isCompact
                    title={
                      isEn
                        ? 'Standard Ready-Made Product Blank'
                        : 'Đơn hàng phôi tiêu chuẩn (Không đính phụ kiện 3D)'
                    }
                    description={
                      isEn
                        ? 'This order does not include custom 3D shell attachments.'
                        : 'Khách đặt phôi tiêu chuẩn, nghệ nhân có thể chuyển thẳng sang bước kiểm định QC & đóng gói.'
                    }
                  />
                )}
              </VStack>
            )}
          </LayoutContent>
        }
        footer={
          <LayoutFooter>
            <HStack gap={2} hAlign="end">
              <Button
                label={isEn ? 'Close' : 'Đóng'}
                variant="secondary"
                onClick={() => onOpenChange(false)}
              />
              {order && NEXT_ORDER_STATUS[order.status] && (
                <Button
                  label={
                    isEn
                      ? 'Advance to Next Stage'
                      : `Chuyển sang "${
                          getOrderStatusInfo(
                            NEXT_ORDER_STATUS[order.status] as OrderStatus,
                            false
                          ).label
                        }"`
                  }
                  variant="primary"
                  onClick={() => {
                    const nextSt = NEXT_ORDER_STATUS[order.status];
                    if (nextSt) onStepStatus(order, nextSt);
                  }}
                />
              )}
            </HStack>
          </LayoutFooter>
        }
      />
    </Drawer>
  );
}
