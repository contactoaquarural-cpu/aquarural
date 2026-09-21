import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Mismo puerto/backend que web-admin (backend/src/server.js escucha en :3000).
// En producción esto se reemplaza por la URL real del backend desplegado.
const BASE_URL = 'http://localhost:3000';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Si el access token expira, se reintenta una vez con el refresh token antes
// de forzar logout — evita que el suscriptor pierda sesión solo por haber
// dejado la app abierta más tiempo del que dura el access token.
let refrescando = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }
    original._retry = true;

    try {
      if (!refrescando) {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        if (!refreshToken) throw new Error('Sin refresh token');
        refrescando = axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
      }
      const { data } = await refrescando;
      refrescando = null;
      // El backend rota AMBOS tokens en cada refresh (el refresh token viejo
      // queda revocado de un solo uso) — hay que guardar los dos nuevos, no
      // solo el access token, o la siguiente renovación fallaría con un
      // refresh token ya revocado.
      await SecureStore.setItemAsync('accessToken', data.data.accessToken);
      await SecureStore.setItemAsync('refreshToken', data.data.refreshToken);
      original.headers.Authorization = `Bearer ${data.data.accessToken}`;
      return api(original);
    } catch (refreshError) {
      refrescando = null;
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      return Promise.reject(error);
    }
  }
);

export default api;
