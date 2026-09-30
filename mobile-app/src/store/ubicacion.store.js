import { create } from 'zustand';
import api from '../services/api.service';

export const useUbicacionStore = create((set) => ({
  guardando: false,
  error: '',

  guardarUbicacion: async (asociadoId, latitud, longitud) => {
    set({ guardando: true, error: '' });
    try {
      await api.patch(`/asociados/${asociadoId}/gps-propio`, { latitud, longitud });
      return true;
    } catch (e) {
      set({ error: e.response?.data?.message || 'No se pudo guardar la ubicación.' });
      return false;
    } finally {
      set({ guardando: false });
    }
  },
}));
