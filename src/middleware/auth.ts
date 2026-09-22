import type { NextFunction, Response } from 'express';
import { User } from '../models/User.js';
import { verifyAccessToken } from '../services/token.service.js';
import { forbidden, unauthorized } from '../utils/AppError.js';
import type { AuthRequest } from '../types/express.js';
import type { UserRole } from '@merraincognita/shared';

function bearerToken(req: AuthRequest): string | undefined {
  const header = req.get('authorization');
  if (!header?.startsWith('Bearer ')) return undefined;
  return header.slice('Bearer '.length).trim() || undefined;
}

export async function authenticate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = bearerToken(req);
    if (!token) {
      next(unauthorized());
      return;
    }

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub);
    if (!user || user.status !== 'active') {
      next(unauthorized());
      return;
    }

    req.user = user;
    next();
  } catch {
    next(unauthorized('Session expired. Please sign in again.'));
  }
}

export async function optionalAuthenticate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = bearerToken(req);
    if (!token) {
      next();
      return;
    }
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub);
    if (user && user.status === 'active') {
      req.user = user;
    }
  } catch {
    // Ignore optional auth failures
  }
  next();
}

export function requireRole(...roles: UserRole[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(unauthorized());
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(forbidden());
      return;
    }
    next();
  };
}
