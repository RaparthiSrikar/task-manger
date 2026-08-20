import axios from 'axios';
import { useAuthStore } from '@/store/auth-store';
import type { ApiErrorShape } from '@/types';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api',
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token missing/expired/invalid — drop local auth state so the UI
      // redirects to /login instead of showing broken authenticated screens.
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);

/** Pulls a human-readable message out of our backend's error shape (or a raw axios error). */
export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError<ApiErrorShape>(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string') return message;
  }
  return fallback;
}
