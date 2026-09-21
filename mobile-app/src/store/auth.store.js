import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api.service';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // true mientras se revisa si ya había una sesión guardada
  error: '',

  // Se llama una vez al montar la app, para saber si ya hay sesión guardada
  // y no obligar al suscriptor a loguearse cada vez que abre la app.
  cargarSesion: async () => {
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      const userJson = await SecureStore.getItemAsync('user');
      if (accessToken && userJson) {
        set({ user: JSON.parse(userJson), isAuthenticated: true });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (acueductoId, cedula) => {
    set({ error: '' });
    try {
      const { data } = await api.post('/auth/login-asociado', { acueductoId, cedula: cedula.trim() });
      const { accessToken, refreshToken, user } = data.data;

      await SecureStore.setItemAsync('accessToken', accessToken);
      await SecureStore.setItemAsync('refreshToken', refreshToken);
      await SecureStore.setItemAsync('user', JSON.stringify(user));

      set({ user, isAuthenticated: true });
      return true;
    } catch (e) {
      set({ error: e.response?.data?.message || 'No se pudo iniciar sesión. Intenta de nuevo.' });
      return false;
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('user');
    set({ user: null, isAuthenticated: false });
  },
}));
