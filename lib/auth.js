import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'zerotoskill-dev-secret-change-in-prod';

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token) {
  try { return jwt.verify(token, JWT_SECRET); } catch { return null; }
}

export async function hashPassword(pw) {
  return bcrypt.hash(pw, 10);
}

export async function verifyPassword(pw, hash) {
  return bcrypt.compare(pw, hash);
}

export function getUserFromRequest(request) {
  const auth = request.headers.get('authorization') || '';
  const token = auth.replace('Bearer ', '').trim();
  if (!token) return null;
  return verifyToken(token);
}
