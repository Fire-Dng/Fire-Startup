'use client';

import React from 'react';
import { Grid } from '@astryxdesign/core/Grid';
import { Card } from '@astryxdesign/core/Card';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Badge } from '@astryxdesign/core/Badge';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { formatCompactVnd, formatVnd } from '@/lib/validators';
import { AnimatedCounter } from './AnimatedCounter';
import { MiniSparkline } from './MiniSparkline';
import type { KpiStats } from '../useKpiStats';

export interface KpiCardsProps {
  kpiStats: KpiStats;
  isEn: boolean;
  locale: 'vi' | 'en';
}

export function KpiCards({ kpiStats, isEn, locale }: KpiCardsProps) {
  return (
    <Grid columns={{ minWidth: 220, repeat: 'fit' }} gap={4}>
      <div className="cms-anim-enter cms-anim-delay-1 cms-kpi-lift">
        <Card>
          <VStack gap={2}>
            <HStack gap={2} vAlign="center" hAlign="between">
              <Text type="supporting">
                {isEn ? 'Total Workshop Revenue' : 'Tổng doanh thu đơn hiện tại'}
              </Text>
              <Badge variant="green" label="+18.4%" />
            </HStack>
            <HStack gap={2} vAlign="end" hAlign="between">
              <Heading level={2}>
                <AnimatedCounter
                  value={kpiStats.revenue}
                  formatter={(v) => formatVnd(Math.round(v))}
                />
              </Heading>
              <MiniSparkline points={[280, 340, 310, 420, 490, 560, 768]} />
            </HStack>
            <Text type="supporting">
              {isEn
                ? `Cumulative Q4: ${formatCompactVnd(18268000, locale)}`
                : `Lũy kế quý IV: ${formatVnd(18268000)}`}
            </Text>
          </VStack>
        </Card>
      </div>

      <div className="cms-anim-enter cms-anim-delay-2 cms-kpi-lift">
        <Card>
          <VStack gap={2}>
            <HStack gap={2} vAlign="center" hAlign="between">
              <Text type="supporting">{isEn ? 'Total Orders' : 'Tổng đơn đặt hàng'}</Text>
              <StatusDot variant="success" isPulsing label="Live Orders" />
            </HStack>
            <HStack gap={2} vAlign="end" hAlign="between">
              <Heading level={2}>
                <AnimatedCounter
                  value={kpiStats.totalOrders}
                  formatter={(v) => `${Math.round(v)} ${isEn ? 'orders' : 'đơn hàng'}`}
                />
              </Heading>
              <MiniSparkline points={[12, 16, 15, 22, 28, 35, 42]} />
            </HStack>
            <Text type="supporting">
              {isEn ? 'Synced VietQR & COD' : 'Đồng bộ thanh toán VietQR & COD'}
            </Text>
          </VStack>
        </Card>
      </div>

      <div className="cms-anim-enter cms-anim-delay-3 cms-kpi-lift">
        <Card>
          <VStack gap={2}>
            <HStack gap={2} vAlign="center" hAlign="between">
              <Text type="supporting">
                {isEn ? 'Active 3D Crafting Tickets' : 'Phiếu đang chế tác 3D'}
              </Text>
              <StatusDot variant="accent" isPulsing label="3D Workstation Active" />
            </HStack>
            <HStack gap={2} vAlign="end" hAlign="between">
              <Heading level={2}>
                <AnimatedCounter
                  value={kpiStats.craftingCount}
                  formatter={(v) => `${Math.round(v)} ${isEn ? 'tickets' : 'phiếu 3D'}`}
                />
              </Heading>
              <MiniSparkline points={[3, 5, 4, 7, 6, 8, 9]} />
            </HStack>
            <Text type="supporting">
              {isEn ? 'In progress on 3D workstation' : 'Đang đan & đính ốc tại xưởng'}
            </Text>
          </VStack>
        </Card>
      </div>

      <div className="cms-anim-enter cms-anim-delay-4 cms-kpi-lift">
        <Card>
          <VStack gap={2}>
            <HStack gap={2} vAlign="center" hAlign="between">
              <Text type="supporting">
                {isEn ? 'Ghost Nets Recovered' : 'Lưới đánh cá thu hồi'}
              </Text>
              <Badge variant="teal" label="Eco Impact" />
            </HStack>
            <HStack gap={2} vAlign="end" hAlign="between">
              <Heading level={2}>
                <AnimatedCounter
                  value={kpiStats.totalNetsGrams / 1000}
                  formatter={(v) => `${v.toFixed(2)} kg`}
                />
              </Heading>
              <MiniSparkline points={[9.5, 11.2, 12.8, 14.1, 15.3, 16.4, 17.16]} />
            </HStack>
            <Text type="supporting" hasTabularNumbers>
              {kpiStats.totalNetsGrams.toLocaleString(isEn ? 'en-US' : 'vi-VN')} gram lưới biển tái
              sinh
            </Text>
          </VStack>
        </Card>
      </div>
    </Grid>
  );
}
