let accessToken: string | null = null;

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
  const headers = new Headers(options.headers);

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  if (options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(path, { ...options, headers });

  if (response.status === 401) {
    // Try to refresh the token once
    const refreshResponse = await fetch('/api/auth/refresh', { method: 'POST' });
    if (refreshResponse.ok) {
      const data = await refreshResponse.json() as { accessToken: string };
      setAccessToken(data.accessToken);
      headers.set('Authorization', `Bearer ${data.accessToken}`);
      const retryResponse = await fetch(path, { ...options, headers });
      if (!retryResponse.ok) {
        const err = await retryResponse.json().catch(() => ({ error: 'Request failed' })) as { error: string };
        throw new Error(err.error ?? 'Request failed');
      }
      return retryResponse.json() as Promise<T>;
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
