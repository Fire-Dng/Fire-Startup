'use client';

import { useMemo, useState } from 'react';
import { DEMO_CRAFTING_ORDER } from '@/data/fallback';
import { updateOrderPaymentStatus, updateOrderStatus } from '@/lib/api';
import type { Order, OrderStatus } from '@/types';
import type { OrderRow } from './orderColumns';

interface UseOrdersOptions {
  isEn: boolean;
  notify: (msg: string) => void;
}

export function useOrders({ isEn, notify }: UseOrdersOptions) {
  const [orders, setOrders] = useState<Order[]>([DEMO_CRAFTING_ORDER]);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [inspectedOrder, setInspectedOrder] = useState<Order | null>(DEMO_CRAFTING_ORDER);
  const [selectedInspectorPlacementId, setSelectedInspectorPlacementId] = useState<string | null>(
    null
  );
  const [checkedPlacementIds, setCheckedPlacementIds] = useState<string[]>([]);

  const filteredOrders = useMemo<OrderRow[]>(() => {
    return orders
      .filter((o) => {
        if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) return false;
        if (orderSearch) {
          const q = orderSearch.toLowerCase();
          return (
            o.orderCode.toLowerCase().includes(q) ||
            o.customerInfo.fullName.toLowerCase().includes(q) ||
            o.customerInfo.phone.includes(q)
          );
        }
        return true;
      })
      .map((o) => o as OrderRow);
  }, [orders, orderStatusFilter, orderSearch]);

  const openInspector = (order: Order) => {
    setInspectedOrder(order);
    setCheckedPlacementIds([]);
    setSelectedInspectorPlacementId(null);
    setIsInspectorOpen(true);
  };

  const togglePlacementCheck = (placementId: string, checked: boolean) => {
    setCheckedPlacementIds((prev) =>
      checked ? [...prev, placementId] : prev.filter((id) => id !== placementId)
    );
  };

  const handleStepOrderStatus = async (order: Order, nextStatus: OrderStatus) => {
    try {
      const updated = await updateOrderStatus(order._id, nextStatus);
      setOrders((prev) => prev.map((o) => (o._id === order._id ? updated : o)));
      if (inspectedOrder?._id === order._id) setInspectedOrder(updated);
      notify(
        isEn
          ? `Order ${order.orderCode} moved to "${nextStatus}"`
          : `Đã chuyển đơn ${order.orderCode} sang trạng thái mới`
      );
    } catch {
      const fallbackUpdated: Order = {
        ...order,
        status: nextStatus,
        updatedAt: new Date().toISOString(),
      };
      setOrders((prev) =>
        prev.map((o) => (o.orderCode === order.orderCode ? fallbackUpdated : o))
      );
      if (inspectedOrder?.orderCode === order.orderCode) setInspectedOrder(fallbackUpdated);
      notify(
        isEn
          ? `Order ${order.orderCode} moved to "${nextStatus}"`
          : `Đã chuyển đơn ${order.orderCode} sang trạng thái mới`
      );
    }
  };

  const handleTogglePayment = async (order: Order) => {
    const nextPay = order.paymentStatus === 'paid' ? 'unpaid' : 'paid';
    try {
      const updated = await updateOrderPaymentStatus(order._id, nextPay);
      setOrders((prev) => prev.map((o) => (o._id === order._id ? updated : o)));
      if (inspectedOrder?._id === order._id) setInspectedOrder(updated);
    } catch {
      const fallbackUpdated: Order = { ...order, paymentStatus: nextPay };
      setOrders((prev) =>
        prev.map((o) => (o.orderCode === order.orderCode ? fallbackUpdated : o))
      );
      if (inspectedOrder?.orderCode === order.orderCode) setInspectedOrder(fallbackUpdated);
    }
    notify(
      isEn
        ? `Updated payment status for ${order.orderCode}`
        : `Đã cập nhật thanh toán cho đơn ${order.orderCode}`
    );
  };

  return {
    orders,
    setOrders,
    orderSearch,
    setOrderSearch,
    orderStatusFilter,
    setOrderStatusFilter,
    filteredOrders,
    isInspectorOpen,
    setIsInspectorOpen,
    inspectedOrder,
    setInspectedOrder,
    selectedInspectorPlacementId,
    setSelectedInspectorPlacementId,
    checkedPlacementIds,
    togglePlacementCheck,
    openInspector,
    handleStepOrderStatus,
    handleTogglePayment,
  };
}
