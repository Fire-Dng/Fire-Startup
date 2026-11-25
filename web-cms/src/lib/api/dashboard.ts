import { AdminDashboardData } from '@/types';
import { FALLBACK_MATERIALS, FALLBACK_PRODUCTS } from '@/data/fallback';
import { fetchApi, getAdminAuthHeaders } from './client';

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  try {
    const authHeaders = await getAdminAuthHeaders();
    const res = await fetchApi<AdminDashboardData>('/admin/dashboard', {
      headers: authHeaders,
    });
    if (res?.data) return res.data;
  } catch {
    // Fallback
  }
  return {
    totalRevenue: 18450000,
    totalOrders: 42,
    craftingOrdersCount: 9,
    totalNetsRecycledGrams: 16850,
    lowStockMaterials: FALLBACK_MATERIALS.filter((m) => m.stockQuantity <= 10),
    lowStockProducts: FALLBACK_PRODUCTS.filter((p) => p.stock <= 10),
    recentOrders: [],
  };
}
