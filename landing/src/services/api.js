import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
});

export const getConfiguracion  = () => api.get('/configuracion');
export const getNoticias        = () => api.get('/noticias?page=1&limit=3');
export const getConvenios       = () => api.get('/convenios');
export const getPrecios         = () => api.get('/precios');
export const getVideos          = () => api.get('/videos?page=1&limit=3');
export const getEstadisticas    = () => api.get('/admin/estadisticas');
