import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || '/api';
const api = axios.create({ baseURL: BASE });

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export const errMsg = (e) => e?.response?.data?.message || e?.message || 'Kuch galat ho gaya';

// "/uploads/x.jpg" ko full URL banata hai (deploy ke time VITE_API_URL ke saath)
export const imgUrl = (p) => {
  if (!p) return '';
  if (p.startsWith('http')) return p;
  const origin = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : '';
  return origin + p;
};

export default api;
