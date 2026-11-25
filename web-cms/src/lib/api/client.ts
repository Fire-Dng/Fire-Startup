import { ENV } from '@/config/env';

export const API_BASE_URL = ENV.API_URL;

export const CMS_TOKEN_STORAGE_KEY = 'wavo_cms_auth_token_v1';
export const CMS_USER_STORAGE_KEY = 'wavo_cms_auth_user_v1';

export interface CmsAuthUser {
  _id: string;
  fullName: string;
  email: string;
  role: 'admin' | 'staff' | 'customer';
  phone?: string;
}

let cachedAdminToken: string | null = null;

export function setCmsSession(token: string, user: CmsAuthUser): void {
  cachedAdminToken = token;
  if (typeof window !== 'undefined') {
    localStorage.setItem(CMS_TOKEN_STORAGE_KEY, token);
    localStorage.setItem(CMS_USER_STORAGE_KEY, JSON.stringify(user));
  }
}

export function getStoredCmsSession(): { token: string | null; user: CmsAuthUser | null } {
  if (typeof window === 'undefined') {
    return { token: cachedAdminToken, user: null };
  }
  try {
    const token = localStorage.getItem(CMS_TOKEN_STORAGE_KEY);
    const rawUser = localStorage.getItem(CMS_USER_STORAGE_KEY);
    const user = rawUser ? (JSON.parse(rawUser) as CmsAuthUser) : null;
    if (token) cachedAdminToken = token;
    return { token, user };
  } catch {
    return { token: cachedAdminToken, user: null };
  }
}

export function clearCmsSession(): void {
  cachedAdminToken = null;
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(CMS_TOKEN_STORAGE_KEY);
      localStorage.removeItem(CMS_USER_STORAGE_KEY);
    } catch {
      // Ignore storage error
    }
  }
}

export async function getAdminAuthHeaders(): Promise<Record<string, string>> {
  const { token } = getStoredCmsSession();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  if (cachedAdminToken) {
    return { Authorization: `Bearer ${cachedAdminToken}` };
  }
  return {};
}

export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<{ success: boolean; data: T; message?: string; meta?: Record<string, unknown> }> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${cleanEndpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    cache: options?.cache || 'no-store',
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.message || `API Error (${res.status})`);
  }
  return json;
}
