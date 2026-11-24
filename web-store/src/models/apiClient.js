import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
export const TOKEN_KEY = 'dtu_wavo_token';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json', 'Accept-Language': 'vi' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

export const unwrap = (response) => {
  const payload = response?.data;
  if (payload?.success === false) {
    const error = new Error(payload.message || 'Yêu cầu chưa thể hoàn tất.');
    error.code = payload.error?.code;
    error.details = payload.error?.details;
    throw error;
  }
  return payload?.data ?? payload;
};

export const getApiError = (error, fallback = 'Có lỗi kết nối. Vui lòng thử lại.') =>
  error?.response?.data?.message || error?.message || fallback;

export default apiClient;
