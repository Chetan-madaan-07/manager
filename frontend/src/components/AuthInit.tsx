import { useEffect, useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { setAccessToken } from '../api/client';

export default function AuthInit({ children }: { children: React.ReactNode }) {
  const { dispatch } = useAppContext();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function restoreSession() {
      try {
        const res = await fetch('/api/auth/refresh', { method: 'POST' });
        if (res.ok) {
          const data = await res.json() as { accessToken: string };
          setAccessToken(data.accessToken);
          dispatch({
            type: 'SET_AUTH',
            payload: {
              user: { id: '', email: '', createdAt: '' },
              accessToken: data.accessToken,
            },
          });
        }
      } catch {
        // no valid session — stay logged out
      } finally {
        setReady(true);
      }
    }
    restoreSession();
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}
