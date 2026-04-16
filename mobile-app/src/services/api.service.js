import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15s — conexiones rurales del Huila
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor de request: agrega Bearer token
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('asoga_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de response: maneja 401 (token expirado)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Limpiar tokens almacenados
      await SecureStore.deleteItemAsync('asoga_token');
      await SecureStore.deleteItemAsync('asoga_refresh_token');
      await SecureStore.deleteItemAsync('asoga_user');
      // El navigator en index.js detecta el token nulo y redirige a Auth
    }
    return Promise.reject(error);
  }
);

export default api;
