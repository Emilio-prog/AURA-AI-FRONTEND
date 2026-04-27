import axios, { type AxiosInstance } from 'axios';

/**
 * Cliente HTTP centralizado. Toda llamada a `aura-ai-backend` (Spring Boot)
 * debe pasar por aquí — nada de baseURL hardcodeado en componentes.
 *
 * Fase 1 (mocks): puede no usarse. Pero el módulo está listo para que las
 * implementaciones reales en `services/*.ts` lo importen sin refactor.
 */
const baseURL = import.meta.env.VITE_API_BASE_URL ?? '';

export const httpClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
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
  (error) => {
    // TODO Hito 4+: redirección a login en 401, normalización de errores, etc.
    return Promise.reject(error);
  },
);
