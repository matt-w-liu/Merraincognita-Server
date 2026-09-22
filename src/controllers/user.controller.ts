import type { Response } from 'express';
import { updateProfileSchema } from '@merraincognita/shared';
import { updateProfile } from '../services/auth.service.js';
import {
  getUserStats,
  listSavedProducts,
  listUsers,
  saveProduct,
  unsaveProduct,
  updateUserRole,
  updateUserStatus,
} from '../services/user.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { AuthRequest } from '../types/express.js';
import { adminUserRoleSchema, adminUserStatusSchema } from '@merraincognita/shared';

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { sanitizeUser } = await import('../services/token.service.js');
  sendSuccess(res, { user: sanitizeUser(req.user!) });
});

export const patchMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = updateProfileSchema.parse(req.body);
  const user = await updateProfile(req.user!._id.toString(), body);
  sendSuccess(res, { user }, 'Profile updated');
});

export const getMyFavourites = asyncHandler(async (req: AuthRequest, res: Response) => {
  const items = await listSavedProducts(req.user!._id.toString());
  sendSuccess(res, { items });
});

export const addMyFavourite = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await saveProduct(req.user!._id.toString(), req.params.productId);
  sendSuccess(res, result, 'Product saved to favourites');
});

export const removeMyFavourite = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await unsaveProduct(req.user!._id.toString(), req.params.productId);
  sendSuccess(res, result, 'Product removed from favourites');
});

export const adminListUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await listUsers({
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
    search: typeof req.query.search === 'string' ? req.query.search : undefined,
    role: typeof req.query.role === 'string' ? req.query.role : undefined,
    status: typeof req.query.status === 'string' ? req.query.status : undefined,
  });
  sendSuccess(res, result);
});

export const adminUpdateUserStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = adminUserStatusSchema.parse(req.body);
  const user = await updateUserStatus(req.params.id, body, req.user!._id.toString());
  sendSuccess(res, { user }, 'User status updated');
});

export const adminUpdateUserRole = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = adminUserRoleSchema.parse(req.body);
  const user = await updateUserRole(req.params.id, body, req.user!._id.toString());
  sendSuccess(res, { user }, 'User role updated');
});

export const adminUserStats = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const stats = await getUserStats();
  sendSuccess(res, stats);
});
