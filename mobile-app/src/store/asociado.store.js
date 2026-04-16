import { create } from 'zustand';
import api from '../services/api.service';
import { useAuthStore } from './auth.store';

export const useAsociadoStore = create((set, get) => ({
  asociado:  null,
  finca:     null,
  isLoading: false,
  error:     null,

  // Cargar datos completos del asociado y su finca principal
  cargarDatos: async () => {
    const userId = useAuthStore.getState().user?._id;
    if (!userId) return;

    set({ isLoading: true, error: null });
    try {
      const [asociadoRes, fincasRes] = await Promise.all([
        api.get(`/asociados/${userId}`),
        api.get(`/asociados/${userId}/fincas`),
      ]);

      const fincas = fincasRes.data.data ?? [];
      set({
        asociado:  asociadoRes.data.data,
        finca:     fincas[0] ?? null,
        isLoading: false,
      });

      // Actualizar user en auth store con datos frescos
      await useAuthStore.getState().setUser(asociadoRes.data.data);
    } catch (err) {
      set({ error: err.response?.data?.message || 'Error al cargar datos', isLoading: false });
    }
  },

  // Actualizar perfil
  actualizarPerfil: async (datosActualizados) => {
    const userId = useAuthStore.getState().user?._id;
    const { data } = await api.put(`/asociados/${userId}`, datosActualizados);
    set({ asociado: data.data });
    await useAuthStore.getState().setUser(data.data);
    return data.data;
  },

  // Actualizar finca
  actualizarFinca: async (datosActualizados) => {
    const fincaId = get().finca?._id;
    const { data } = await api.put(`/fincas/${fincaId}`, datosActualizados);
    set({ finca: data.data });
    return data.data;
  },
}));
