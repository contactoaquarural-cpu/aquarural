import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
});

export const getConfiguracion  = () => api.get('/configuracion');
export const getNoticias        = () => api.get('/noticias?limit=3&publicado=true');
export const getConvenios       = () => api.get('/convenios?activo=true');
export const getPrecios         = () => api.get('/precios');
export const getVideos          = () => api.get('/videos?limit=3&publicado=true');
export const getEstadisticas    = () => api.get('/admin/estadisticas');
