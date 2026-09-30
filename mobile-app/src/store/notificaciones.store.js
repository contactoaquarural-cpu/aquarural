import { create } from 'zustand';
import api from '../services/api.service';

export const useNotificacionesStore = create((set, get) => ({
  notificaciones: [],
  isLoading: false,
  error: '',

  cargarNotificaciones: async () => {
    set({ isLoading: true, error: '' });
    try {
      const { data } = await api.get('/notificaciones');
      set({ notificaciones: Array.isArray(data?.data) ? data.data : [] });
    } catch (e) {
      set({ error: e.response?.data?.message || 'No se pudieron cargar las notificaciones.' });
    } finally {
      set({ isLoading: false });
    }
  },

  marcarLeida: async (id) => {
    set((state) => ({
      notificaciones: state.notificaciones.map((n) => (n._id === id ? { ...n, leida: true } : n)),
    }));
    try {
      await api.patch(`/notificaciones/${id}/leer`);
    } catch (e) {
      // silencioso — la UI ya reflejó el cambio, no vale la pena revertir por un fallo de red puntual
    }
  },

  marcarTodasLeidas: async () => {
    set((state) => ({ notificaciones: state.notificaciones.map((n) => ({ ...n, leida: true })) }));
    try {
      await api.patch('/notificaciones/leer-todas');
    } catch (e) {}
  },
}));
