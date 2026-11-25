import { Product } from '@/types';
import { FALLBACK_PRODUCTS } from '@/data/fallback';
import { fetchApi, getAdminAuthHeaders } from './client';

export interface ProductQueryFilters {
  category?: string;
  isCustomizable?: boolean | string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  includeInactive?: boolean;
}

export async function getProducts(filters?: ProductQueryFilters): Promise<Product[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.category && filters.category !== 'all') params.set('category', filters.category);
    if (filters?.isCustomizable !== undefined && filters.isCustomizable !== '') {
      params.set('isCustomizable', String(filters.isCustomizable));
    }
    if (filters?.search) params.set('search', filters.search);
    if (filters?.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
    if (filters?.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
    if (filters?.sort) params.set('sort', filters.sort);
    if (filters?.includeInactive) params.set('includeInactive', 'true');

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await fetchApi<Product[] | { items: Product[]; products: Product[] }>(
      `/products${queryString}`
    );
    const list = Array.isArray(res.data)
      ? res.data
      : res.data?.items || res.data?.products || [];
    if (list.length > 0) return list;
  } catch {
    // Fallback filter locally when backend is offline or empty
  }

  let list = [...FALLBACK_PRODUCTS];
  if (filters?.category && filters.category !== 'all') {
    list = list.filter((p) => p.category === filters.category);
  }
  if (filters?.isCustomizable === true || filters?.isCustomizable === 'true') {
    list = list.filter((p) => p.isCustomizable);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (p) => p.name.toLowerCase().includes(q) || p.shortDescription.toLowerCase().includes(q)
    );
  }
  if (filters?.sort === 'price_asc') {
    list.sort((a, b) => a.basePrice - b.basePrice);
  } else if (filters?.sort === 'price_desc') {
    list.sort((a, b) => b.basePrice - a.basePrice);
  }
  return list;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const res = await fetchApi<Product>(`/products/${slug}`);
    if (res?.data) return res.data;
  } catch {
    // Fallback
  }
  return (
    FALLBACK_PRODUCTS.find((p) => p.slug === slug || p._id === slug) ||
    FALLBACK_PRODUCTS[0] ||
    null
  );
}

export async function createProductAdmin(payload: Partial<Product>): Promise<Product> {
  const authHeaders = await getAdminAuthHeaders();
  const res = await fetchApi<Product>('/products', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function updateProductAdmin(id: string, payload: Partial<Product>): Promise<Product> {
  const authHeaders = await getAdminAuthHeaders();
  const res = await fetchApi<Product>(`/products/${id}`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function deleteProductAdmin(id: string): Promise<void> {
  const authHeaders = await getAdminAuthHeaders();
  await fetchApi(`/products/${id}`, {
    method: 'DELETE',
    headers: authHeaders,
  });
}
