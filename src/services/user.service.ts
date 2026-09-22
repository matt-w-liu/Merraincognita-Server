import { adminUserRoleSchema, adminUserStatusSchema } from '@merraincognita/shared';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { badRequest, forbidden, notFound } from '../utils/AppError.js';
import { sanitizeUser } from './token.service.js';
import { serializeProduct } from './product.service.js';
import type { FilterQuery } from 'mongoose';
import type { z } from 'zod';

export async function listSavedProducts(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw notFound('User not found');
  const products = await Product.find({
    _id: { $in: user.savedProducts },
    archived: false,
  }).sort({ createdAt: -1 });
  return products.map(serializeProduct);
}

export async function saveProduct(userId: string, productId: string) {
  const product = await Product.findOne({ _id: productId, published: true, archived: false });
  if (!product) throw notFound('Product not found');

  await User.updateOne({ _id: userId }, { $addToSet: { savedProducts: product._id } });
  return { saved: true };
}

export async function unsaveProduct(userId: string, productId: string) {
  await User.updateOne({ _id: userId }, { $pull: { savedProducts: productId } });
  return { saved: false };
}

export async function listUsers(query: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}) {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(50, Math.max(1, query.limit ?? 20));
  const filter: FilterQuery<InstanceType<typeof User>> = {};

  if (query.role) filter.role = query.role;
  if (query.status) filter.status = query.status;
  if (query.search?.trim()) {
    const q = query.search.trim();
    filter.$or = [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }];
  }

  const [items, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  return {
    items: items.map(sanitizeUser),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function updateUserStatus(
  id: string,
  input: z.infer<typeof adminUserStatusSchema>,
  actorId: string,
) {
  const data = adminUserStatusSchema.parse(input);
  const user = await User.findById(id);
  if (!user) throw notFound('User not found');

  if (user._id.toString() === actorId && data.status === 'disabled') {
    throw badRequest('You cannot disable your own account');
  }

  if (user.role === 'admin' && data.status === 'disabled') {
    const activeAdmins = await User.countDocuments({
      role: 'admin',
      status: 'active',
      _id: { $ne: user._id },
    });
    if (activeAdmins < 1) {
      throw forbidden('Cannot disable the last active administrator');
    }
  }

  user.status = data.status;
  if (data.status === 'disabled') {
    user.refreshTokens = [];
  }
  await user.save();
  return sanitizeUser(user);
}

export async function updateUserRole(
  id: string,
  input: z.infer<typeof adminUserRoleSchema>,
  actorId: string,
) {
  const data = adminUserRoleSchema.parse(input);
  const user = await User.findById(id);
  if (!user) throw notFound('User not found');

  if (user._id.toString() === actorId && data.role !== 'admin') {
    throw badRequest('You cannot demote your own administrator role');
  }

  if (user.role === 'admin' && data.role !== 'admin') {
    const activeAdmins = await User.countDocuments({
      role: 'admin',
      status: 'active',
      _id: { $ne: user._id },
    });
    if (activeAdmins < 1) {
      throw forbidden('Cannot demote the last active administrator');
    }
  }

  user.role = data.role;
  await user.save();
  return sanitizeUser(user);
}

export async function getUserStats() {
  const [total, active, admins] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ status: 'active' }),
    User.countDocuments({ role: 'admin', status: 'active' }),
  ]);
  return { total, active, admins };
}
