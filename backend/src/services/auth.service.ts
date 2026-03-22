import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../db';

const BCRYPT_COST = 12;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return secret;
}

function isValidEmail(email: string): boolean {
  // RFC 5322-ish basic check
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const AuthService = {
  async register(email: string, password: string): Promise<{ userId: string }> {
    if (!isValidEmail(email)) {
      throw new Error('Invalid email format');
    }
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

    try {
      const result = await pool.query<{ id: string }>(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
        [email, passwordHash]
      );
      return { userId: result.rows[0].id };
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as { code: string }).code === '23505'
      ) {
        throw new Error('Email already in use');
      }
      throw err;
    }
  },

  async login(
    email: string,
    password: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const result = await pool.query<{ id: string; password_hash: string }>(
      'SELECT id, password_hash FROM users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      throw new Error('Invalid credentials');
    }

    const accessToken = jwt.sign({ userId: user.id }, getJwtSecret(), {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });

    // Generate a random refresh token, store its hash
    const rawRefreshToken = crypto.randomBytes(40).toString('hex');
    const refreshTokenHash = await bcrypt.hash(rawRefreshToken, BCRYPT_COST);

    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_SECONDS * 1000);
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshTokenHash, expiresAt]
    );

    return { accessToken, refreshToken: rawRefreshToken };
  },

  async logout(refreshToken: string): Promise<void> {
    // We need to find the matching row by comparing against all stored hashes
    const result = await pool.query<{ id: string; token_hash: string }>(
      'SELECT id, token_hash FROM refresh_tokens WHERE expires_at > now()'
    );

    for (const row of result.rows) {
      const match = await bcrypt.compare(refreshToken, row.token_hash);
      if (match) {
        await pool.query('DELETE FROM refresh_tokens WHERE id = $1', [row.id]);
        return;
      }
    }
    // If no match found, silently succeed (idempotent logout)
  },

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    const result = await pool.query<{ id: string; token_hash: string; user_id: string }>(
      'SELECT id, token_hash, user_id FROM refresh_tokens WHERE expires_at > now()'
    );

    for (const row of result.rows) {
      const match = await bcrypt.compare(refreshToken, row.token_hash);
      if (match) {
        const accessToken = jwt.sign({ userId: row.user_id }, getJwtSecret(), {
          expiresIn: ACCESS_TOKEN_EXPIRY,
        });
        return { accessToken };
      }
    }

    throw new Error('Invalid or expired refresh token');
  },
};
