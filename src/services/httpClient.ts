import axios, { type AxiosInstance } from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const httpClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    'Accept-Language': 'es',
  },
});

httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('aura.token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);
