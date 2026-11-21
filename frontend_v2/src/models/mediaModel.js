import apiClient, { unwrap } from './apiClient.js';

export const mediaModel = {
  async status() { return unwrap(await apiClient.get('/media/status')); },
  async requestUpload(payload) { return unwrap(await apiClient.post('/media/presigned-url', payload)); },
  async upload(file, folder) {
    const body = new FormData();
    body.append('file', file);
    body.append('folder', folder);
    return unwrap(await apiClient.post('/media/upload', body, { headers: { 'Content-Type': 'multipart/form-data' } }));
  },
  async remove(payload) { return unwrap(await apiClient.delete('/media', { data: payload })); },
};
