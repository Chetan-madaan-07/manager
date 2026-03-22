import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

const router = Router();

const REFRESH_TOKEN_COOKIE = 'refreshToken';
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  try {
    const result = await AuthService.register(email, password);
    res.status(201).json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    if (message === 'Email already in use') {
      res.status(409).json({ error: message });
    } else if (
      message === 'Invalid email format' ||
      message === 'Password must be at least 8 characters'
    ) {
      res.status(400).json({ error: message });
    } else {
      console.error('Register error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  try {
    const { accessToken, refreshToken } = await AuthService.login(email, password);
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });
    res.status(200).json({ accessToken });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    if (message === 'Invalid credentials') {
      res.status(401).json({ error: message });
    } else {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// POST /api/auth/logout
router.post('/logout', async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];

  try {
    if (refreshToken) {
      await AuthService.logout(refreshToken);
    }
    res.clearCookie(REFRESH_TOKEN_COOKIE);
    res.status(204).send();
  } catch (err: unknown) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];

  if (!refreshToken) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const result = await AuthService.refreshAccessToken(refreshToken);
    res.status(200).json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    if (message === 'Invalid or expired refresh token') {
      res.status(401).json({ error: 'Unauthorized' });
    } else {
      console.error('Refresh error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

export default router;
