import { CustomMaterial } from '@/types';
import { FALLBACK_MATERIALS } from '@/data/fallback';
import { fetchApi, getAdminAuthHeaders } from './client';

export async function getCustomMaterials(materialType?: string): Promise<CustomMaterial[]> {
  try {
    const query = materialType && materialType !== 'all' ? `?materialType=${materialType}` : '';
    const res = await fetchApi<
      CustomMaterial[] | { items: CustomMaterial[]; materials: CustomMaterial[] }
    >(`/materials${query}`);
    const list = Array.isArray(res.data)
      ? res.data
      : res.data?.items || res.data?.materials || [];
    if (list.length > 0) return list;
  } catch {
    // Fallback
  }
  if (materialType && materialType !== 'all') {
    return FALLBACK_MATERIALS.filter((m) => m.materialType === materialType);
  }
  return FALLBACK_MATERIALS;
}

export async function createMaterialAdmin(
  payload: Partial<CustomMaterial>
): Promise<CustomMaterial> {
  const authHeaders = await getAdminAuthHeaders();
  const res = await fetchApi<CustomMaterial>('/materials', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function updateMaterialAdmin(
  id: string,
  payload: Partial<CustomMaterial>
): Promise<CustomMaterial> {
  const authHeaders = await getAdminAuthHeaders();
  const res = await fetchApi<CustomMaterial>(`/materials/${id}`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function deleteMaterialAdmin(id: string): Promise<void> {
  const authHeaders = await getAdminAuthHeaders();
  await fetchApi(`/materials/${id}`, {
    method: 'DELETE',
    headers: authHeaders,
  });
}
