'use client';

import React from 'react';
import { Grid } from '@astryxdesign/core/Grid';
import { Card } from '@astryxdesign/core/Card';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Divider } from '@astryxdesign/core/Divider';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Badge } from '@astryxdesign/core/Badge';
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { List, ListItem } from '@astryxdesign/core/List';
import { ProgressBar } from '@astryxdesign/core/ProgressBar';
import { Table, type TableColumn } from '@astryxdesign/core/Table';
import { formatVnd } from '@/lib/validators';
import { useCms } from '@/context/CmsContext';
import type { CustomMaterial } from '@/types';
import type { OrderRow } from '@/features/orders/orderColumns';
import type { KpiStats } from './useKpiStats';
import { KpiCards } from './components/KpiCards';
import { RevenueChart } from './components/RevenueChart';

export interface DashboardTabProps {
  kpiStats: KpiStats;
  recentOrders: OrderRow[];
  orderColumns: TableColumn<OrderRow>[];
  onSelectCategoryFilter: (slug: string) => void;
  onEditMaterial: (material: CustomMaterial) => void;
}

export function DashboardTab({
  kpiStats,
  recentOrders,
  orderColumns,
  onSelectCategoryFilter,
  onEditMaterial,
}: DashboardTabProps) {
  const { isEn, locale, t, setActiveTab } = useCms();

  return (
    <VStack gap={6}>
      <KpiCards kpiStats={kpiStats} isEn={isEn} locale={locale} />

      <Grid columns={{ minWidth: 380, repeat: 'fit' }} gap={4}>
        <RevenueChart
          monthlyTrend={kpiStats.monthlyTrend}
          revenue={kpiStats.revenue}
          totalOrders={kpiStats.totalOrders}
          isEn={isEn}
          locale={locale}
        />

        <div className="cms-anim-enter cms-anim-delay-3">
          <Card>
            <VStack gap={4}>
              <HStack gap={2} vAlign="center" hAlign="between" wrap="wrap">
                <VStack gap={0.5}>
                  <Heading level={3}>
                    {isEn
                      ? 'Category Stock & Inventory Value Distribution'
                      : 'Tỷ Trọng Tồn Kho & Giá Trị Theo Danh Mục'}
                  </Heading>
                  <Text type="supporting">
                    {isEn
                      ? 'Click any category row to filter products in that category'
                      : 'Bấm vào từng dòng danh mục để mở danh sách sản phẩm thuộc nhóm đó'}
                  </Text>
                </VStack>
                <Button
                  label={isEn ? 'Manage Categories' : 'Quản lý danh mục'}
                  variant="secondary"
                  size="sm"
                  onClick={() => setActiveTab('categories')}
                />
              </HStack>

              <VStack gap={2}>
                {kpiStats.categoryBreakdown.map((cat) => {
                  const maxStock = 100;
                  return (
                    <div
                      key={cat.slug}
                      className="cms-category-row"
                      onClick={() => {
                        onSelectCategoryFilter(cat.slug);
                        setActiveTab('products');
                      }}
                    >
                      <VStack gap={1.5}>
                        <HStack gap={2} vAlign="center" hAlign="between">
                          <HStack gap={1.5} vAlign="center">
                            <Text weight="medium">{cat.name}</Text>
                            <Badge
                              variant="neutral"
                              label={`${cat.productCount} ${isEn ? 'SKUs' : 'mẫu'}`}
                            />
                          </HStack>
                          <Text type="supporting" hasTabularNumbers>
                            {cat.totalStock} {t('common.pieces')} • {formatVnd(cat.inventoryValue)}
                          </Text>
                        </HStack>
                        <ProgressBar
                          label={cat.name}
                          isLabelHidden
                          value={Math.min(maxStock, cat.totalStock)}
                          max={maxStock}
                          variant={cat.totalStock <= 15 ? 'warning' : 'accent'}
                        />
                      </VStack>
                    </div>
                  );
                })}
              </VStack>
            </VStack>
          </Card>
        </div>
      </Grid>

      {kpiStats.lowStockMats.length > 0 && (
        <Banner
          status="warning"
          container="card"
          collapsible={false}
          title={
            isEn
              ? `Low Stock BOM Alert (${kpiStats.lowStockMats.length} items below safety threshold)`
              : `Cảnh báo tồn kho BOM (${kpiStats.lowStockMats.length} nguyên liệu vỏ sò / ốc dưới ngưỡng an toàn ≤ 15 cái)`
          }
          description={
            isEn
              ? 'Restock these materials so customers can continue attaching them in the 3D Studio.'
              : 'Bấm vào nguyên liệu bên dưới để cập nhật bổ sung số lượng tồn kho cho phòng 3D Studio.'
          }
          endContent={
            <Button
              label={isEn ? 'Open BOM Inventory' : 'Quản lý kho BOM'}
              variant="secondary"
              size="sm"
              onClick={() => setActiveTab('materials')}
            />
          }
        >
          <List density="compact" hasDividers>
            {kpiStats.lowStockMats.map((m) => (
              <ListItem
                key={m._id}
                label={m.name}
                description={`${isEn ? '3D Preset:' : 'Mã 3D:'} ${m.model3D?.meshPreset} • ${formatVnd(m.unitPrice)} / ${t('common.pieces')}`}
                endContent={
                  <Badge variant="warning" label={`${m.stockQuantity} ${t('common.pieces')}`} />
                }
                onClick={() => onEditMaterial(m)}
              />
            ))}
          </List>
        </Banner>
      )}

      <Divider />

      <VStack gap={4}>
        <HStack gap={2} vAlign="center" hAlign="between" wrap="wrap">
          <VStack gap={0.5}>
            <Heading level={2}>
              {isEn ? 'Recent 3D Crafting Tickets' : 'Phiếu Chế Tác 3D Mới Tiếp Nhận'}
            </Heading>
            <Text type="supporting">
              {isEn
                ? 'Click "Open 3D Ticket" on any order to inspect the customer’s 3D blueprint.'
                : 'Bấm "Mở phiếu 3D" trên từng đơn hàng để kiểm tra mô hình 3D và danh sách vỏ sò cần đính.'}
            </Text>
          </VStack>
          <Button
            label={isEn ? 'View All Orders' : 'Xem tất cả đơn hàng'}
            variant="secondary"
            size="sm"
            onClick={() => setActiveTab('orders')}
          />
        </HStack>

        <Table
          data={recentOrders}
          columns={orderColumns}
          idKey="orderCode"
          density="balanced"
          hasHover
        />
      </VStack>
    </VStack>
  );
}
