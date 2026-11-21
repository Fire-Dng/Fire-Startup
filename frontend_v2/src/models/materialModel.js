import apiClient, { unwrap } from './apiClient.js';

export const materialModel = {
  async list(params = {}) { return unwrap(await apiClient.get('/materials', { params })); },
  async create(payload) { return unwrap(await apiClient.post('/materials', payload)); },
  async update(id, payload) { return unwrap(await apiClient.put('/materials/' + id, payload)); },
  async remove(id) { return unwrap(await apiClient.delete('/materials/' + id)); },
};
