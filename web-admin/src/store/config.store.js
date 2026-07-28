import { create } from 'zustand';
import api from '../services/api.service';

export const useConfigStore = create((set) => ({
  nombreAsociacion: 'ASOGACENTRO',
  municipio:        'Garzón, Huila',
  telefonoContacto: '3166160377',

  cargarConfig: async () => {
    try {
      const r = await api.get('/configuracion');
      const d = r.data.data;
      if (d) set({
        nombreAsociacion: d.nombreAsociacion || 'ASOGACENTRO',
        municipio:        d.municipio        || 'Garzón, Huila',
        telefonoContacto: d.telefonoContacto || '3166160377',
      });
    } catch {
      // usa valores por defecto si falla
    }
  },
}));
