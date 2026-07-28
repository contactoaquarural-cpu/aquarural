import { create } from 'zustand';
import api from '../services/api.service';

const CONFIG_KEY = 'ganadero-config';

const cargarCache = () => {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const cache = cargarCache();

export const useConfigStore = create((set) => ({
  nombreAsociacion: cache?.nombreAsociacion || 'GanaderoPro',
  municipio:        cache?.municipio        || 'Colombia',
  telefonoContacto: cache?.telefonoContacto || '3166160377',

  cargarConfig: async () => {
    try {
      const r = await api.get('/configuracion');
      const d = r.data.data;
      if (d) {
        const vals = {
          nombreAsociacion: d.nombreAsociacion || 'GanaderoPro',
          municipio:        d.municipio        || 'Colombia',
          telefonoContacto: d.telefonoContacto || '3166160377',
        };
        localStorage.setItem(CONFIG_KEY, JSON.stringify(vals));
        set(vals);
      }
    } catch {
      // usa valores cacheados o por defecto
    }
  },
}));
