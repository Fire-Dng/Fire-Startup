'use client';

import React, { useState } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Badge } from '@astryxdesign/core/Badge';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { SegmentedControl, SegmentedControlItem } from '@astryxdesign/core/SegmentedControl';
import { formatCompactVnd, formatVnd } from '@/lib/validators';
import type { KpiStats } from '../useKpiStats';

export interface RevenueChartProps {
  monthlyTrend: KpiStats['monthlyTrend'];
  revenue: number;
  totalOrders: number;
  isEn: boolean;
  locale: 'vi' | 'en';
}

export function RevenueChart({
  monthlyTrend,
  revenue,
  totalOrders,
  isEn,
  locale,
}: RevenueChartProps) {
  const [chartWindow, setChartWindow] = useState<'6m' | 'q4'>('6m');
  const [hoveredMonth, setHoveredMonth] = useState<string | null>('T11');

  const visiblePoints = chartWindow === 'q4' ? monthlyTrend.slice(-3) : monthlyTrend;
  const activePoint =
    visiblePoints.find((p) => p.month === hoveredMonth) ||
    visiblePoints[visiblePoints.length - 1];

  return (
    <div className="cms-anim-enter cms-anim-delay-2">
      <Card>
        <VStack gap={4}>
          <HStack gap={2} vAlign="center" hAlign="between" wrap="wrap">
            <VStack gap={0.5}>
              <Heading level={3}>
                {isEn
                  ? 'Workshop Revenue & Net Recovery'
                  : 'Biểu Đồ Doanh Thu & Sản Lượng Lưới Thu Hồi'}
              </Heading>
              <Text type="supporting">
                {isEn
                  ? 'Hover any month column to inspect detailed revenue & ocean net weight'
                  : 'Di chuột vào từng cột tháng để xem chi tiết doanh thu & lượng lưới tái chế'}
              </Text>
            </VStack>
            <SegmentedControl
              size="sm"
              label={isEn ? 'Time range' : 'Khoảng thời gian'}
              value={chartWindow}
              onChange={(val) => setChartWindow(val as '6m' | 'q4')}
            >
              <SegmentedControlItem value="6m" label={isEn ? '6 Months' : '6 Tháng'} />
              <SegmentedControlItem value="q4" label={isEn ? 'Quarter 4' : 'Quý IV'} />
            </SegmentedControl>
          </HStack>

          <HStack gap={3} vAlign="center" hAlign="between" wrap="wrap">
            <HStack gap={2} vAlign="center">
              <StatusDot variant="accent" isPulsing label={activePoint.month} />
              <Text weight="semibold">
                {isEn ? `Month ${activePoint.month}:` : `Tháng ${activePoint.month}:`}{' '}
                {formatVnd(activePoint.revenue)}
              </Text>
            </HStack>
            <Badge
              variant="blue"
              label={`${isEn ? 'Recovered:' : 'Thu hồi:'} ${activePoint.netsKg} kg lưới`}
            />
          </HStack>

          <div
            style={{
              width: '100%',
              height: 220,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: 16,
              paddingTop: 24,
              paddingBottom: 8,
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            {visiblePoints.map((point, idx) => {
              const maxRev = 20_000_000;
              const heightPct = Math.max(
                20,
                Math.min(100, Math.round((point.revenue / maxRev) * 100))
              );
              const isHighlighted = activePoint.month === point.month;
              return (
                <div
                  key={point.month}
                  onMouseEnter={() => setHoveredMonth(point.month)}
                  style={{
                    flex: 1,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 6,
                  }}
                >
                  <Text
                    type="supporting"
                    weight={isHighlighted ? 'semibold' : 'normal'}
                    hasTabularNumbers
                  >
                    {formatCompactVnd(point.revenue, locale)}
                  </Text>
                  <div
                    className="cms-chart-bar"
                    title={`${point.month}: ${formatVnd(point.revenue)} • ${point.netsKg}kg`}
                    style={{
                      width: '100%',
                      maxWidth: chartWindow === 'q4' ? 68 : 46,
                      height: `${heightPct}%`,
                      animationDelay: `${idx * 65}ms`,
                      borderRadius: '8px 8px 3px 3px',
                      background: isHighlighted
                        ? 'var(--color-accent)'
                        : 'var(--color-border-emphasized, rgba(120,120,128,0.32))',
                    }}
                  />
                  <Text
                    type="label"
                    weight={isHighlighted ? 'semibold' : 'normal'}
                    hasTabularNumbers
                  >
                    {point.month}
                  </Text>
                  <Text type="supporting" hasTabularNumbers>
                    {point.netsKg}kg
                  </Text>
                </div>
              );
            })}
          </div>

          <HStack gap={4} vAlign="center" hAlign="between" wrap="wrap">
            <HStack gap={2} vAlign="center">
              <StatusDot variant="accent" label="Selected Month" />
              <Text type="supporting">
                {isEn
                  ? 'Interactive bar selection'
                  : 'Chạm hoặc rê chuột lên cột để đối chiếu'}
              </Text>
            </HStack>
            <Text type="supporting" hasTabularNumbers>
              {isEn ? 'Average ticket value:' : 'Giá trị đơn trung bình:'}{' '}
              {formatVnd(totalOrders > 0 ? Math.round(revenue / totalOrders) : 384000)}
            </Text>
          </HStack>
        </VStack>
      </Card>
    </div>
  );
}
