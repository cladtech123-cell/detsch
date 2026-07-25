import axios from 'axios';

/**
 * Pre-configured Axios instance for the backend API.
 *
 * `baseURL` points at `/api/v1`; in development the Vite proxy forwards
 * `/api` → http://127.0.0.1:8000 (see vite.config.ts).
 */
const api = axios.create({
  baseURL: '/api/v1',
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// --- Request interceptor (hook for auth tokens in a later phase) ----------
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
);

// --- Response interceptor: surface a clean error shape --------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const clean = {
      status: error.response?.status ?? 0,
      message:
        error.response?.data?.detail ??
        error.response?.data?.message ??
        error.message ??
        'Unknown error',
    };
    return Promise.reject(clean);
  },
);

export default api;
