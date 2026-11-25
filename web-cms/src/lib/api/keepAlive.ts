import { API_BASE_URL } from './client';

export async function pingServerKeepAlive(): Promise<void> {
  if (!API_BASE_URL) return;
  try {
    await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      cache: 'no-store',
    });
  } catch {
    // Silent catch so keep-alive ping never interrupts user experience
  }
}
