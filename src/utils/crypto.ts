import crypto from 'node:crypto';

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

export function hashIp(ip: string | undefined, salt = 'merraincognita'): string | undefined {
  if (!ip) return undefined;
  return crypto.createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 32);
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
