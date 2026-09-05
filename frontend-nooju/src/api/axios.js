import axios from 'axios';

export const TOKEN_STORAGE_KEY = 'nooju_token';

const api = axios.create({
  baseURL: 'http://backend-nooju.test/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});

// Sisipkan token login (kalau ada) ke setiap request yang keluar.
api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Kalau backend bilang token sudah tidak valid/expired (401), hapus sesi
// lokal dan lempar balik ke halaman login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
