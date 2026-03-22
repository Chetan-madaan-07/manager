import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, login } from '../api/auth.api';
import { setAccessToken } from '../api/client';
import { useAppContext } from '../store/AppContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';
import styles from './AuthPage.module.css';

// ─── SignUpForm ───────────────────────────────────────────────────────────────

interface SignUpFormProps {
  onSuccess: () => void;
}

function SignUpForm({ onSuccess }: SignUpFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await register(email, password);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h2 className={styles.formTitle}>Create account</h2>

      {error && <ErrorBanner message={error} />}
      {loading && <LoadingSpinner />}

      <div className={styles.field}>
        <label htmlFor="signup-email" className={styles.label}>Email</label>
        <input
          id="signup-email"
          type="email"
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          disabled={loading}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="signup-password" className={styles.label}>Password</label>
        <input
          id="signup-password"
          type="password"
          className={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          disabled={loading}
        />
        <span className={styles.hint}>Minimum 8 characters</span>
      </div>

      <button type="submit" className={styles.button} disabled={loading}>
        Sign up
      </button>
    </form>
  );
}

// ─── SignInForm ───────────────────────────────────────────────────────────────

function SignInForm() {
  const { dispatch } = useAppContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { accessToken } = await login(email, password);
      setAccessToken(accessToken);
      dispatch({
        type: 'SET_AUTH',
        payload: {
          user: { id: '', email, createdAt: new Date().toISOString() },
          accessToken,
        },
      });
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h2 className={styles.formTitle}>Sign in</h2>

      {error && <ErrorBanner message={error} />}
      {loading && <LoadingSpinner />}

      <div className={styles.field}>
        <label htmlFor="signin-email" className={styles.label}>Email</label>
        <input
          id="signin-email"
          type="email"
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          disabled={loading}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="signin-password" className={styles.label}>Password</label>
        <input
          id="signin-password"
          type="password"
          className={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          disabled={loading}
        />
      </div>

      <button type="submit" className={styles.button} disabled={loading}>
        Sign in
      </button>
    </form>
  );
}

// ─── AuthPage ─────────────────────────────────────────────────────────────────

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>✓</span>
          <span className={styles.logoText}>TodoApp</span>
        </div>

        {mode === 'signup' ? (
          <SignUpForm onSuccess={() => setMode('signin')} />
        ) : (
          <SignInForm />
        )}

        <p className={styles.toggle}>
          {mode === 'signin' ? (
            <>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                className={styles.toggleLink}
                onClick={() => setMode('signup')}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                className={styles.toggleLink}
                onClick={() => setMode('signin')}
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
