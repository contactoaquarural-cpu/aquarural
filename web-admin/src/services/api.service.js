import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
});

// Agrega el token y x-acueducto-id en cada request
api.interceptors.request.use((config) => {
  const { token, user } = useAuthStore.getState();
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const acueductoIdUser = user?.acueductoId || user?.acueducto?._id || user?.acueducto;
  if (acueductoIdUser) {
    config.headers['x-acueducto-id'] = String(acueductoIdUser);
  }

  return config;
});

// Maneja 401 — sesión expirada
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
