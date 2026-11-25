import { CustomDesignSnapshot, Order, OrderStatus, PaymentStatus } from '@/types';
import { fetchApi, getAdminAuthHeaders } from './client';

export interface CreateOrderPayload {
  customerInfo: {
    fullName: string;
    phone: string;
    email?: string;
    address: string;
    note?: string;
  };
  paymentMethod: 'cod' | 'vietqr';
  items: Array<{
    productId: string;
    productName?: string;
    quantity: number;
    selectedColor?: string;
    selectedSize?: string;
    isCustom: boolean;
    customDesignId?: string;
    customDesignSnapshot?: CustomDesignSnapshot;
  }>;
}

export async function saveCustomDesign(
  payload: Omit<CustomDesignSnapshot, '_id'>
): Promise<CustomDesignSnapshot> {
  try {
    const res = await fetchApi<CustomDesignSnapshot>('/custom-designs', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  } catch {
    return {
      ...payload,
      _id: `design-${Date.now()}`,
    };
  }
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const res = await fetchApi<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function lookupOrderByCode(orderCode: string, phone?: string): Promise<Order> {
  const query = phone ? `?phone=${encodeURIComponent(phone)}` : '';
  const res = await fetchApi<Order>(
    `/orders/lookup/${encodeURIComponent(orderCode.trim())}${query}`
  );
  return res.data;
}

export async function cancelOrderByCustomer(
  orderIdOrCode: string,
  phone?: string,
  reason?: string
): Promise<Order> {
  const res = await fetchApi<Order>(`/orders/${encodeURIComponent(orderIdOrCode)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({
      status: 'cancelled',
      phone,
      note: reason || 'Khách hàng yêu cầu hủy đơn',
    }),
  });
  return res.data;
}

export async function getAdminOrders(status?: string, search?: string): Promise<Order[]> {
  try {
    const authHeaders = await getAdminAuthHeaders();
    const params = new URLSearchParams();
    if (status && status !== 'all') params.set('status', status);
    if (search) params.set('search', search);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetchApi<Order[] | { orders: Order[]; items: Order[] }>(`/orders${query}`, {
      headers: authHeaders,
    });
    return Array.isArray(res.data) ? res.data : res.data?.orders || res.data?.items || [];
  } catch {
    return [];
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  note?: string
): Promise<Order> {
  const authHeaders = await getAdminAuthHeaders();
  const res = await fetchApi<Order>(`/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ status, note }),
  });
  return res.data;
}

export async function updateOrderPaymentStatus(
  orderId: string,
  paymentStatus: PaymentStatus
): Promise<Order> {
  const authHeaders = await getAdminAuthHeaders();
  const res = await fetchApi<Order>(`/orders/${orderId}/payment`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ paymentStatus }),
  });
  return res.data;
}
