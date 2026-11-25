import type { CustomMaterial } from './material';
import type { Order } from './order';
import type { Product } from './product';

export interface AdminDashboardData {
  totalRevenue: number;
  totalOrders: number;
  craftingOrdersCount: number;
  totalNetsRecycledGrams: number;
  lowStockMaterials: CustomMaterial[];
  lowStockProducts: Product[];
  recentOrders: Order[];
}
