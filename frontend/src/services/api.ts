import axios from 'axios';

export const api = axios.create({
  baseURL: '/api', // Proxied by vite.config.ts
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dotai_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
