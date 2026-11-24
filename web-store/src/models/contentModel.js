import apiClient, { unwrap } from './apiClient.js';

export const contentModel = {
  async getLanding() { return unwrap(await apiClient.get('/content/landing')); },
  async getAdminLanding() { return unwrap(await apiClient.get('/admin/landing')); },
  async updateLanding(payload) { return unwrap(await apiClient.put('/admin/landing', payload)); },
};
