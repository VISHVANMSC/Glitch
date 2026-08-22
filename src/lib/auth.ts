import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'glitch-hackathon-super-secret-jwt-key-2026';
const TOKEN_NAME = 'glitch_session_token';

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'TEAM_LEADER' | 'SCANNER';
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function setAuthCookie(payload: TokenPayload) {
  const token = signToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_NAME);
}

export async function getSessionUser(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export interface ResetTokenPayload {
  userId: string;
  email: string;
  action: 'password_reset';
}

export function signPasswordResetToken(payload: { userId: string; email: string }): string {
  return jwt.sign(
    { ...payload, action: 'password_reset' },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
}

export function verifyPasswordResetToken(token: string): ResetTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as ResetTokenPayload;
    if (decoded.action !== 'password_reset') return null;
    return decoded;
  } catch {
    return null;
  }
}
