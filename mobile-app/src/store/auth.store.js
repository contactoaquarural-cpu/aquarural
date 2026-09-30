import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api.service';
import { registrarTokenNotificaciones } from '../services/notifications.service';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // true mientras se revisa si ya había una sesión guardada
  error: '',

  // Se llama una vez al montar la app, para saber si ya hay sesión guardada
  // y no obligar al suscriptor a loguearse cada vez que abre la app.
  cargarSesion: async () => {
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      const userJson = await SecureStore.getItemAsync('user');
      if (accessToken && userJson) {
        const user = JSON.parse(userJson);
        set({ user, isAuthenticated: true });
        registrarTokenNotificaciones(user._id).catch(() => {});
      }
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (acueductoId, cedula) => {
    set({ error: '' });
    try {
      const { data } = await api.post('/auth/login-asociado', { acueductoId, cedula: cedula.trim() });
      const { accessToken, refreshToken, user } = data.data;

      await SecureStore.setItemAsync('accessToken', accessToken);
      await SecureStore.setItemAsync('refreshToken', refreshToken);
      await SecureStore.setItemAsync('user', JSON.stringify(user));

      set({ user, isAuthenticated: true });
      registrarTokenNotificaciones(user._id).catch(() => {});
      return true;
    } catch (e) {
      set({ error: e.response?.data?.message || 'No se pudo iniciar sesión. Intenta de nuevo.' });
      return false;
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('user');
    set({ user: null, isAuthenticated: false });
  },

  // Actualiza campos puntuales del usuario en memoria y en SecureStore (ej.
  // tras guardar el GPS del predio) sin necesitar un nuevo login.
  actualizarUsuario: async (cambios) => {
    set((state) => {
      const user = { ...state.user, ...cambios };
      SecureStore.setItemAsync('user', JSON.stringify(user));
      return { user };
    });
  },

  // Guarda teléfono/correo/dirección en el backend (PATCH /:id/perfil-propio,
  // solo acepta esos 3 campos — ver validator) y refleja el resultado real
  // devuelto por el servidor en el store local.
  actualizarPerfil: async (cambios) => {
    const state = useAuthStore.getState();
    const { data } = await api.patch(`/asociados/${state.user._id}/perfil-propio`, cambios);
    await state.actualizarUsuario(data.data);
    return true;
  },

  // Trae el registro completo del asociado desde el backend (GET /:id, ya
  // restringido a "solo mi propio registro" para rol ASOCIADO) y lo refleja
  // en el store — para campos que el admin puede cambiar del lado del panel
  // (ej. estadoServicio) sin que el suscriptor tenga que volver a loguearse.
  // Falla en silencio (sin conexión, etc.): el dato guardado en sesión sigue
  // siendo válido como último valor conocido.
  refrescarUsuario: async () => {
    try {
      const state = useAuthStore.getState();
      if (!state.user?._id) return;
      const { data } = await api.get(`/asociados/${state.user._id}`);
      await state.actualizarUsuario(data.data);
    } catch {
      // silencioso — se mantiene el último estado conocido
    }
  },
}));
