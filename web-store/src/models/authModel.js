import apiClient, { TOKEN_KEY, unwrap } from './apiClient.js';

export const authModel = {
  async login(credentials) {
    const data = unwrap(await apiClient.post('/auth/login', credentials));
    localStorage.setItem(TOKEN_KEY, data.token);
    return data.user;
  },
  async register(payload) {
    const data = unwrap(await apiClient.post('/auth/register', payload));
    localStorage.setItem(TOKEN_KEY, data.token);
    return data.user;
  },
  async me() {
    return unwrap(await apiClient.get('/auth/me'));
  },
  logout() {
    localStorage.removeItem(TOKEN_KEY);
  },
};
