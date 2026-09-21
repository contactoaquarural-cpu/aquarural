import { create } from 'zustand';
import api from '../services/api.service';

export const useAcueductosStore = create((set) => ({
  acueductos: [],
  isLoading: false,
  error: '',

  cargarAcueductos: async () => {
    set({ isLoading: true, error: '' });
    try {
      const { data } = await api.get('/acueductos/publico');
      set({ acueductos: Array.isArray(data?.data) ? data.data : [] });
    } catch (e) {
      set({ error: 'No se pudo cargar la lista de acueductos.' });
    } finally {
      set({ isLoading: false });
    }
  },
}));
