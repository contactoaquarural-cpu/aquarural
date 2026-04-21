import { create } from 'zustand';
import api from '../services/api.service';
import { useAuthStore } from './auth.store';

export const usePagosStore = create((set) => ({
  aportes:         [],
  mesesPendientes: [],
  isLoading:       false,
  error:           null,

  // Cargar historial de aportes del asociado
  cargarHistorial: async () => {
    const userId = useAuthStore.getState().user?._id;
    if (!userId) return;

    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(`/asociados/${userId}/aportes`);
      const aportes = data.data ?? [];

      // Calcular meses pendientes (estado PENDIENTE)
      const pendientes = aportes.filter((a) => a.estado === 'PENDIENTE');

      set({ aportes, mesesPendientes: pendientes, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Error al cargar pagos', isLoading: false });
    }
  },

  // Iniciar pago en Wompi — retorna los parámetros del checkout widget
  iniciarPago: async (meses) => {
    const { data } = await api.post('/pagos/iniciar', { meses });
    return data.data;
  },
}));
