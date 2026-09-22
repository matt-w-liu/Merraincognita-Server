import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  updateProfileSchema,
} from '@merraincognita/shared';
import { User, type IUserDocument } from '../models/User.js';
import { PasswordResetToken } from '../models/PasswordResetToken.js';
import {
  hashPassword,
  sanitizeUser,
  signAccessToken,
  signRefreshToken,
  verifyPassword,
  verifyRefreshToken,
} from './token.service.js';
import { generateSecureToken, hashToken, normalizeEmail } from '../utils/crypto.js';
import {
  BCRYPT_ROUNDS,
  LOCKOUT_DURATION_MS,
  MAX_FAILED_LOGINS,
  PASSWORD_RESET_EXPIRES_MS,
} from '../config/constants.js';
import { env } from '../config/env.js';
import { badRequest, conflict, forbidden, unauthorized } from '../utils/AppError.js';
import { sendPasswordResetEmail } from './email.service.js';
import type { z } from 'zod';

function parseExpiresMs(duration: string): number {
  const match = /^(\d+)([smhd])$/.exec(duration);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const value = Number(match[1]);
  const unit = match[2];
  const map: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return value * (map[unit] ?? 86_400_000);
}

async function issueTokens(user: IUserDocument, options?: { userAgent?: string }) {
  const jti = generateSecureToken(16);
  const refreshToken = signRefreshToken(user, jti);
  const accessToken = signAccessToken(user);
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + parseExpiresMs(env.REFRESH_TOKEN_EXPIRES_IN));

  // Keep last 5 refresh sessions
  user.refreshTokens = [
    ...user.refreshTokens.filter((t) => t.expiresAt > new Date()).slice(-4),
    {
      tokenHash,
      expiresAt,
      createdAt: new Date(),
      userAgent: options?.userAgent,
    },
  ];
  await user.save();

  return { accessToken, refreshToken };
}

export async function registerUser(input: z.infer<typeof registerSchema>, userAgent?: string) {
  const data = registerSchema.parse(input);
  const email = normalizeEmail(data.email);

  const existing = await User.findOne({ email });
  if (existing) {
    throw conflict('An account with this email already exists');
  }

  const passwordHash = await hashPassword(data.password);
  const user = await User.create({
    name: data.name.trim(),
    email,
    phone: data.phone,
    passwordHash,
    role: 'user',
    status: 'active',
    emailVerified: false,
  });

  const tokens = await issueTokens(user, { userAgent });
  return { user: sanitizeUser(user), ...tokens };
}

export async function loginUser(input: z.infer<typeof loginSchema>, userAgent?: string) {
  const data = loginSchema.parse(input);
  const email = normalizeEmail(data.email);

  const user = await User.findOne({ email }).select('+passwordHash +refreshTokens');
  if (!user) {
    throw unauthorized('Invalid email or password');
  }

  if (user.status === 'disabled') {
    throw forbidden('This account has been disabled. Contact support for assistance.');
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw tooManyAuthAttempts();
  }

  const valid = await verifyPassword(data.password, user.passwordHash);
  if (!valid) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= MAX_FAILED_LOGINS) {
      user.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
      user.failedLoginAttempts = 0;
    }
    await user.save();
    throw unauthorized('Invalid email or password');
  }

  user.failedLoginAttempts = 0;
  user.lockedUntil = undefined;
  user.lastLoginAt = new Date();
  await user.save();

  const tokens = await issueTokens(user, { userAgent });
  return { user: sanitizeUser(user), ...tokens };
}

function tooManyAuthAttempts() {
  return unauthorized(
    'Account temporarily locked due to too many failed attempts. Try again later.',
  );
}

export async function logoutUser(refreshToken: string | undefined) {
  if (refreshToken) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      const user = await User.findById(payload.sub).select('+refreshTokens');
      if (user) {
        const tokenHash = hashToken(refreshToken);
        user.refreshTokens = user.refreshTokens.filter((t) => t.tokenHash !== tokenHash);
        await user.save();
      }
    } catch {
      // Ignore invalid refresh tokens on logout
    }
  }
}

export async function refreshSession(refreshToken: string | undefined) {
  if (!refreshToken) {
    throw unauthorized('Authentication required');
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw unauthorized('Session expired. Please sign in again.');
  }

  const user = await User.findById(payload.sub).select('+refreshTokens');
  if (!user || user.status !== 'active') {
    throw unauthorized('Session expired. Please sign in again.');
  }

  const tokenHash = hashToken(refreshToken);
  const stored = user.refreshTokens.find((t) => t.tokenHash === tokenHash);
  if (!stored || stored.expiresAt < new Date()) {
    throw unauthorized('Session expired. Please sign in again.');
  }

  // Rotate refresh token
  user.refreshTokens = user.refreshTokens.filter((t) => t.tokenHash !== tokenHash);
  await user.save();

  const tokens = await issueTokens(user);
  return { user: sanitizeUser(user), ...tokens };
}

export async function requestPasswordReset(input: z.infer<typeof forgotPasswordSchema>) {
  const data = forgotPasswordSchema.parse(input);
  const email = normalizeEmail(data.email);
  const genericMessage =
    'If an account exists for that email, password reset instructions have been sent.';

  const user = await User.findOne({ email });
  if (!user || user.status !== 'active') {
    return { message: genericMessage };
  }

  const rawToken = generateSecureToken(32);
  const tokenHash = hashToken(rawToken);

  await PasswordResetToken.deleteMany({ userId: user._id, used: false });
  await PasswordResetToken.create({
    userId: user._id,
    tokenHash,
    expiresAt: new Date(Date.now() + PASSWORD_RESET_EXPIRES_MS),
    used: false,
  });

  const resetUrl = `${env.PASSWORD_RESET_URL}/${rawToken}`;
  await sendPasswordResetEmail({
    name: user.name,
    email: user.email,
    resetUrl,
  });

  return { message: genericMessage };
}

export async function resetPassword(input: z.infer<typeof resetPasswordSchema>) {
  const data = resetPasswordSchema.parse(input);
  const tokenHash = hashToken(data.token);

  const record = await PasswordResetToken.findOne({ tokenHash, used: false });
  if (!record || record.expiresAt < new Date()) {
    throw badRequest('This password reset link is invalid or has expired.');
  }

  const user = await User.findById(record.userId).select('+passwordHash +refreshTokens');
  if (!user || user.status !== 'active') {
    throw badRequest('This password reset link is invalid or has expired.');
  }

  user.passwordHash = await hashPassword(data.password);
  user.passwordChangedAt = new Date();
  user.refreshTokens = [];
  user.failedLoginAttempts = 0;
  user.lockedUntil = undefined;
  await user.save();

  record.used = true;
  await record.save();

  return { message: 'Password updated successfully. You can now sign in.' };
}

export async function updatePassword(
  userId: string,
  input: z.infer<typeof updatePasswordSchema>,
) {
  const data = updatePasswordSchema.parse(input);
  const user = await User.findById(userId).select('+passwordHash +refreshTokens');
  if (!user) throw unauthorized();

  const valid = await verifyPassword(data.currentPassword, user.passwordHash);
  if (!valid) {
    throw badRequest('Current password is incorrect');
  }

  user.passwordHash = await hashPassword(data.newPassword);
  user.passwordChangedAt = new Date();
  user.refreshTokens = [];
  await user.save();

  return { message: 'Password updated successfully' };
}

export async function updateProfile(userId: string, input: z.infer<typeof updateProfileSchema>) {
  const data = updateProfileSchema.parse(input);
  const user = await User.findByIdAndUpdate(
    userId,
    { name: data.name.trim(), phone: data.phone },
    { new: true, runValidators: true },
  );
  if (!user) throw unauthorized();
  return sanitizeUser(user);
}

export async function getUserById(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw unauthorized();
  return sanitizeUser(user);
}

export { BCRYPT_ROUNDS };
