import { apiFetch } from './client';

export function register(email: string, password: string): Promise<{ userId: string }> {
  return apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function login(email: string, password: string): Promise<{ accessToken: string }> {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function logout(): Promise<void> {
  return apiFetch('/api/auth/logout', { method: 'POST' });
}

export function refreshToken(): Promise<{ accessToken: string }> {
  return apiFetch('/api/auth/refresh', { method: 'POST' });
}
