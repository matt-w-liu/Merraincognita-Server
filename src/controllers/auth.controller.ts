import type { Response } from 'express';
import {
  forgotPasswordSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  resetPasswordSchema,
  updatePasswordSchema,
} from '@merraincognita/shared';
import {
  getUserById,
  loginUser,
  logoutUser,
  refreshSession,
  registerUser,
  requestPasswordReset,
  resetPassword,
  updatePassword,
} from '../services/auth.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { AuthRequest } from '../types/express.js';

export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = registerSchema.parse(req.body);
  const { user, accessToken, refreshToken } = await registerUser(
    body,
    req.get('user-agent') ?? undefined,
  );
  sendSuccess(res, { user, accessToken, refreshToken }, 'Account created successfully', 201);
});

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = loginSchema.parse(req.body);
  const { user, accessToken, refreshToken } = await loginUser(
    body,
    req.get('user-agent') ?? undefined,
  );
  sendSuccess(res, { user, accessToken, refreshToken }, 'Signed in successfully');
});

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { refreshToken } = refreshTokenSchema.partial().parse(req.body ?? {});
  await logoutUser(refreshToken);
  sendSuccess(res, null, 'Signed out successfully');
});

export const refresh = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { refreshToken } = refreshTokenSchema.parse(req.body);
  const { user, accessToken, refreshToken: newRefreshToken } = await refreshSession(refreshToken);
  sendSuccess(res, { user, accessToken, refreshToken: newRefreshToken }, 'Session refreshed');
});

export const me = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await getUserById(req.user!._id.toString());
  sendSuccess(res, { user });
});

export const forgotPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = forgotPasswordSchema.parse(req.body);
  const result = await requestPasswordReset(body);
  sendSuccess(res, null, result.message);
});

export const resetPasswordHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = resetPasswordSchema.parse(req.body);
  const result = await resetPassword(body);
  sendSuccess(res, null, result.message);
});

export const updatePasswordHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = updatePasswordSchema.parse(req.body);
  const result = await updatePassword(req.user!._id.toString(), body);
  sendSuccess(res, null, result.message);
});
