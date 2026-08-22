import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      login: (user, token, refreshToken) =>
        set({ user, token, refreshToken, isAuthenticated: true }),

      logout: () => {
        try {
          localStorage.removeItem('asoga-auth');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('aquarural-config');
          localStorage.removeItem('aquarural-config-form-v1');
          localStorage.removeItem('aquarural-acueductos-saas-v1');
        } catch (e) {}
        try {
          const { useConfigStore } = require('./config.store');
          useConfigStore.getState().resetConfig();
        } catch (e) {}
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
      },

      setUser: (user) => set({ user }),
    }),
    { name: 'asoga-auth' }
  )
);
