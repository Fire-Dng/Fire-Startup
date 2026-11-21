import apiClient, { unwrap } from './apiClient.js';

export const designModel = {
  async calculatePrice(payload) { return unwrap(await apiClient.post('/custom-designs/calculate-price', payload)); },
  async save(payload) { return unwrap(await apiClient.post('/custom-designs', payload)); },
  async getByIdOrCode(idOrShareCode) { return unwrap(await apiClient.get('/custom-designs/' + encodeURIComponent(idOrShareCode))); },
};
