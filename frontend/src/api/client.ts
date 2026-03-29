const isProduction = import.meta.env.PROD;
let accessToken: string | null = null;

// Use Render URL in production, empty string (relative path) for local Vite proxy
const BASE_URL = isProduction 
  ? 'https://taskify-i2wo.onrender.com' 
  : '';

export function setAccessToken(token: string): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function clearAccessToken(): void {
  accessToken = null;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  // 1. Combine the base URL with your path
  const url = `${BASE_URL}${path}`;
  
  const headers = new Headers(options.headers);

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  if (options.body) {
    headers.set('Content-Type', 'application/json');
  }

  // 2. Add credentials: 'include' so cookies (refresh token) are sent to Render
  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // <--- CRITICAL FOR AUTH TO WORK ON VERCEL
  };

  const response = await fetch(url, fetchOptions);

  if (response.status === 401) {
    // Try to refresh the token once (Make sure this uses BASE_URL too!)
    const refreshResponse = await fetch(`${BASE_URL}/api/auth/refresh`, { 
      method: 'POST',
      credentials: 'include', // <--- CRITICAL FOR AUTH
    });

    if (refreshResponse.ok) {
      const data = await refreshResponse.json() as { accessToken: string };
      setAccessToken(data.accessToken);
      headers.set('Authorization', `Bearer ${data.accessToken}`);
      
      // Retry the original request
      const retryResponse = await fetch(url, { ...fetchOptions, headers });
      
      if (!retryResponse.ok) {
        const err = await retryResponse.json().catch(() => ({ error: 'Request failed' })) as { error: string };
        throw new Error(err.error ?? 'Request failed');
      }
      
      // Handle empty responses on retry
      const text = await retryResponse.text();
      if (!text) return undefined as unknown as T;
      return JSON.parse(text) as T;

    } else {
      clearAccessToken();
      const err = await response.json().catch(() => ({ error: 'Unauthorized' })) as { error: string };
      throw new Error(err.error ?? 'Unauthorized');
    }
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Request failed' })) as { error: string };
    throw new Error(err.error ?? 'Request failed');
  }

  // Handle empty responses (e.g. 204 No Content)
  const text = await response.text();
  if (!text) return undefined as unknown as T;
  return JSON.parse(text) as T;
}
