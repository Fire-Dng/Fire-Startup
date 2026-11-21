import apiClient, { unwrap } from './apiClient.js';

export const orderModel = {
  async create(payload) { return unwrap(await apiClient.post('/orders', payload)); },
  async lookup(orderCode, phone) {
    const params = phone ? { phone } : {};
    return unwrap(await apiClient.get('/orders/lookup/' + encodeURIComponent(orderCode), { params }));
  },
  async getById(id) { return unwrap(await apiClient.get('/orders/' + encodeURIComponent(id))); },
  async cancel(orderCode, payload) { return unwrap(await apiClient.post('/orders/' + encodeURIComponent(orderCode) + '/cancel', payload)); },
  async list(params = {}) {
    const response = await apiClient.get('/orders', { params });
    return { orders: unwrap(response), meta: response.data?.meta || {} };
  },
  async updateStatus(id, payload) { return unwrap(await apiClient.patch('/orders/' + encodeURIComponent(id) + '/status', payload)); },
  async updatePayment(id, payload) { return unwrap(await apiClient.patch('/orders/' + encodeURIComponent(id) + '/payment', payload)); },
};
