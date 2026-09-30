import { create } from 'zustand';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as SecureStore from 'expo-secure-store';
import api, { BASE_URL } from '../services/api.service';

export const useFacturasStore = create((set, get) => ({
  facturas: [],
  isLoading: false,
  error: '',
  descargandoId: null,
  historialConsumo: [],
  // Si es true, la lista de "Pagar" avisa en cada tarjeta que el pago por
  // Wompi suma la comisión de la pasarela — evita que el monto en el
  // checkout tome al suscriptor por sorpresa.
  trasladaComisionWompi: false,

  cargarFacturas: async () => {
    set({ isLoading: true, error: '' });
    try {
      const { data } = await api.get('/facturas', { params: { limit: 100 } });
      set({ facturas: Array.isArray(data?.data?.facturas) ? data.data.facturas : [] });
    } catch (e) {
      set({ error: e.response?.data?.message || 'No se pudieron cargar las facturas.' });
    } finally {
      set({ isLoading: false });
    }
  },

  // Mismo endpoint que ya usa web-admin en el expediente del asociado
  // (GET /asociados/:id/historial-consumo), ya restringido a "solo mi propio
  // historial" para rol ASOCIADO. Falla en silencio: sin esto solo se pierde
  // el gráfico de consumo de Inicio, no es un dato crítico para el suscriptor.
  cargarHistorialConsumo: async (asociadoId) => {
    if (!asociadoId) return;
    try {
      const { data } = await api.get(`/asociados/${asociadoId}/historial-consumo`);
      set({ historialConsumo: Array.isArray(data?.data) ? data.data : [] });
    } catch {
      // silencioso
    }
  },

  // GET /configuracion/publica: subconjunto seguro para cualquier rol (a
  // diferencia de GET /configuracion, que trae datos administrativos/de
  // licencia SaaS que no le corresponden a un suscriptor). Falla en
  // silencio: sin esto solo se pierde el aviso, no bloquea el pago.
  cargarConfigPublica: async () => {
    try {
      const { data } = await api.get('/configuracion/publica');
      set({ trasladaComisionWompi: Boolean(data?.data?.trasladarComisionWompiAsociados) });
    } catch {
      // silencioso
    }
  },

  iniciarPago: async (facturaId) => {
    const { data } = await api.post('/pagos/iniciar', { facturaId });
    return data.data; // { wompiUrl, reference, montoFactura, montoComision, montoTotal }
  },

  // Descarga el PDF de una factura (GET /facturas/:id/pdf, autenticado con
  // el mismo access token que usa `api`, ya que expo-file-system no pasa
  // por el interceptor de axios) y lo abre con el selector nativo de
  // compartir/guardar del dispositivo. API nueva de expo-file-system
  // (File/Directory) — la vieja downloadAsync quedó deprecada en SDK 54+.
  descargarPdf: async (factura) => {
    set({ error: '', descargandoId: factura._id });
    try {
      const token = await SecureStore.getItemAsync('accessToken');

      // idempotent: true — sin esto, descargar la misma factura una segunda
      // vez falla porque el archivo ya existe en caché de la vez anterior.
      const archivo = await File.downloadFileAsync(
        `${BASE_URL}/facturas/${factura._id}/pdf`,
        Paths.cache,
        { headers: { Authorization: `Bearer ${token}` }, idempotent: true }
      );

      const disponible = await Sharing.isAvailableAsync();
      if (disponible) {
        await Sharing.shareAsync(archivo.uri, { mimeType: 'application/pdf', dialogTitle: factura.codigoFactura });
      }
      return true;
    } catch (e) {
      set({ error: 'No se pudo descargar la factura. Intenta de nuevo.' });
      return false;
    } finally {
      set({ descargandoId: null });
    }
  },
}));
