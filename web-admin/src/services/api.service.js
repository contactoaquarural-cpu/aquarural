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

// Maneja 401 — sesión expirada. Evita recargar si ya estamos en /login (ahí un
// 401 es normal, ej. login fallido o consultas sin sesión) para no entrar en
// un bucle de recargas cuando no hay token válido.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
