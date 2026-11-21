import apiClient, { unwrap } from './apiClient.js';

export const productModel = {
  async list(params = {}) {
    const response = await apiClient.get('/products', { params });
    return { products: unwrap(response), meta: response.data?.meta || {} };
  },
  async getBySlug(slug) { return unwrap(await apiClient.get('/products/' + encodeURIComponent(slug))); },
  async create(payload) { return unwrap(await apiClient.post('/products', payload)); },
  async update(id, payload) { return unwrap(await apiClient.put('/products/' + id, payload)); },
  async remove(id) { return unwrap(await apiClient.delete('/products/' + id)); },
};
