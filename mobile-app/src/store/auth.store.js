import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api.service';
import { inicializarNotificaciones } from '../services/notifications.service';

export const useAuthStore = create((set, get) => ({
  user:          null,
  token:         null,
  refreshToken:  null,
  isLoading:     true,  // true mientras se revisa el SecureStore al iniciar

  // Cargar sesión guardada al iniciar la app
  hydrate: async () => {
    try {
      const token        = await SecureStore.getItemAsync('asoga_token');
      const refreshToken = await SecureStore.getItemAsync('asoga_refresh_token');
      const userJson     = await SecureStore.getItemAsync('asoga_user');

      if (token && userJson) {
        set({
          token,
          refreshToken,
          user:      JSON.parse(userJson),
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  // Login con cédula y contraseña
  login: async (cedula, password) => {
    const { data } = await api.post('/auth/login', { cedula, password });
    const { asociado, accessToken, refreshToken } = data.data;

    await SecureStore.setItemAsync('asoga_token',         accessToken);
    await SecureStore.setItemAsync('asoga_refresh_token', refreshToken);
    await SecureStore.setItemAsync('asoga_user',          JSON.stringify(asociado));

    set({ user: asociado, token: accessToken, refreshToken });

    // Registrar token FCM en segundo plano — no bloquea el login
    inicializarNotificaciones(asociado._id).catch(() => {});
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignorar errores de red en logout
    }
    await SecureStore.deleteItemAsync('asoga_token');
    await SecureStore.deleteItemAsync('asoga_refresh_token');
    await SecureStore.deleteItemAsync('asoga_user');
    set({ user: null, token: null, refreshToken: null });
  },

  // Actualizar datos del usuario en store y SecureStore
  setUser: async (user) => {
    await SecureStore.setItemAsync('asoga_user', JSON.stringify(user));
    set({ user });
  },
}));
