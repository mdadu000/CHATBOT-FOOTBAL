import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL,
  timeout: 120000,
});

api.interceptors.request.use((config) => {
  const t = localStorage.getItem('sg_token');
  if (t) {
    config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const msg = err.response?.data?.error || err.message || 'Request failed';
    return Promise.reject(new Error(msg));
  }
);
