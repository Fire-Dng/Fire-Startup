import { CategoryItem } from '@/types';
import { FALLBACK_CATEGORIES } from '@/data/fallback';
import { fetchApi, getAdminAuthHeaders } from './client';

export async function getCategoriesAdmin(): Promise<CategoryItem[]> {
  try {
    const res = await fetchApi<CategoryItem[]>('/categories?includeInactive=true');
    if (Array.isArray(res?.data) && res.data.length > 0) {
      return res.data;
    }
  } catch {
    // Fallback
  }
  return FALLBACK_CATEGORIES;
}

export async function createCategoryAdmin(payload: Partial<CategoryItem>): Promise<CategoryItem> {
  const authHeaders = await getAdminAuthHeaders();
  const res = await fetchApi<CategoryItem>('/categories', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function updateCategoryAdmin(
  id: string,
  payload: Partial<CategoryItem>
): Promise<CategoryItem> {
  const authHeaders = await getAdminAuthHeaders();
  const res = await fetchApi<CategoryItem>(`/categories/${id}`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function deleteCategoryAdmin(id: string): Promise<void> {
  const authHeaders = await getAdminAuthHeaders();
  await fetchApi(`/categories/${id}`, {
    method: 'DELETE',
    headers: authHeaders,
  });
}
