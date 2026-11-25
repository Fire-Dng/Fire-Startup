import type { OrderStatus } from '@/types';

export function formatDateTimeDisplay(isoString: string, isEn: boolean): string {
  try {
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return isoString;
    return d.toLocaleString(isEn ? 'en-US' : 'vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export const ORDER_STAGE_STEPS: OrderStatus[] = [
  'pending',
  'confirmed',
  'in_crafting',
  'quality_check',
  'shipping',
  'delivered',
];

export const NEXT_ORDER_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: 'confirmed',
  confirmed: 'in_crafting',
  in_crafting: 'quality_check',
  quality_check: 'shipping',
  shipping: 'delivered',
};

export function getOrderStatusInfo(
  status: OrderStatus,
  isEn: boolean
): {
  label: string;
  badgeVariant: 'neutral' | 'blue' | 'orange' | 'teal' | 'green' | 'error';
  progressPct: number;
} {
  const map: Record<
    OrderStatus,
    {
      vi: string;
      en: string;
      badgeVariant: 'neutral' | 'blue' | 'orange' | 'teal' | 'green' | 'error';
      progressPct: number;
    }
  > = {
    pending: { vi: '1. Chờ xác nhận', en: '1. Pending', badgeVariant: 'neutral', progressPct: 16 },
    confirmed: { vi: '2. Đã duyệt BOM', en: '2. Confirmed', badgeVariant: 'blue', progressPct: 33 },
    in_crafting: {
      vi: '3. Đang đan & đính 3D',
      en: '3. In 3D Crafting',
      badgeVariant: 'orange',
      progressPct: 55,
    },
    quality_check: {
      vi: '4. Kiểm định QC',
      en: '4. Quality Check',
      badgeVariant: 'teal',
      progressPct: 75,
    },
    shipping: { vi: '5. Đang giao hàng', en: '5. Shipping', badgeVariant: 'blue', progressPct: 90 },
    delivered: {
      vi: '6. Đã hoàn thành',
      en: '6. Delivered',
      badgeVariant: 'green',
      progressPct: 100,
    },
    cancelled: { vi: 'Đã hủy', en: 'Cancelled', badgeVariant: 'error', progressPct: 0 },
  };
  const entry = map[status] || map.pending;
  return {
    label: isEn ? entry.en : entry.vi,
    badgeVariant: entry.badgeVariant,
    progressPct: entry.progressPct,
  };
}
