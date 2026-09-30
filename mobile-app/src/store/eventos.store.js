import { create } from 'zustand';
import api from '../services/api.service';

export const useEventosStore = create((set, get) => ({
  eventos: [],
  isLoading: false,
  error: '',
  confirmandoId: null,

  cargarEventos: async () => {
    set({ isLoading: true, error: '' });
    try {
      const { data } = await api.get('/eventos/mis-eventos');
      set({ eventos: Array.isArray(data?.data) ? data.data : [] });
    } catch (e) {
      set({ error: e.response?.data?.message || 'No se pudieron cargar los eventos.' });
    } finally {
      set({ isLoading: false });
    }
  },

  confirmarAsistencia: async (eventoId, respuesta) => {
    set({ confirmandoId: eventoId });
    try {
      await api.post(`/eventos/${eventoId}/confirmar`, { respuesta });
      set((state) => ({
        eventos: state.eventos.map((e) => (e._id === eventoId ? { ...e, miRespuesta: respuesta } : e)),
      }));
      return true;
    } catch (e) {
      set({ error: 'No se pudo registrar tu respuesta. Intenta de nuevo.' });
      return false;
    } finally {
      set({ confirmandoId: null });
    }
  },
}));
