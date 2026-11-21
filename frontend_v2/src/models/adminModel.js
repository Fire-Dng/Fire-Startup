import apiClient, { unwrap } from './apiClient.js';

export const adminModel = {
  async dashboard() { return unwrap(await apiClient.get('/admin/dashboard')); },
};
