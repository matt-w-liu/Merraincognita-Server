import { productRequestSchema, type RequestStatus } from '@merraincognita/shared';
import { ProductRequest } from '../models/ProductRequest.js';
import { hashIp, normalizeEmail } from '../utils/crypto.js';
import { notFound } from '../utils/AppError.js';
import { sendProductRequestConfirmation, sendProductRequestNotification } from './email.service.js';
import type { FilterQuery } from 'mongoose';
import type { z } from 'zod';

function formatBudgetRange(min?: number, max?: number): string | undefined {
  if (min === undefined && max === undefined) return undefined;
  if (min !== undefined && max !== undefined) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  if (min !== undefined) return `From $${min.toLocaleString()}`;
  return `Up to $${max!.toLocaleString()}`;
}

export async function submitProductRequest(
  input: z.infer<typeof productRequestSchema>,
  meta?: { userId?: string; ip?: string },
) {
  const data = productRequestSchema.parse(input);

  if (data.website && data.website.length > 0) {
    return { id: 'ignored', message: 'Thank you. Your request has been received.' };
  }

  const request = await ProductRequest.create({
    user: meta?.userId,
    desiredBrand: data.desiredBrand.trim(),
    desiredProduct: data.desiredProduct,
    category: data.category,
    budgetMin: data.budgetMin,
    budgetMax: data.budgetMax,
    requirements: data.requirements,
    name: data.name.trim(),
    email: normalizeEmail(data.email),
    phone: data.phone,
    status: 'new',
    emailDeliveryStatus: 'pending',
    confirmationEmailStatus: 'pending',
    ipHash: hashIp(meta?.ip),
  });

  const notifyResult = await sendProductRequestNotification({
    desiredBrand: request.desiredBrand,
    desiredProduct: request.desiredProduct,
    name: request.name,
    email: request.email,
    phone: request.phone,
    budgetRange: formatBudgetRange(request.budgetMin, request.budgetMax),
    requirements: request.requirements,
  });
  request.emailDeliveryStatus = notifyResult.status;
  if (notifyResult.error) request.emailDeliveryError = notifyResult.error;

  const confirmResult = await sendProductRequestConfirmation({
    name: request.name,
    email: request.email,
  });
  request.confirmationEmailStatus = confirmResult.status;

  await request.save();

  return { id: request._id.toString(), message: 'Thank you. Your request has been received.' };
}

function serializeRequest(
  request: InstanceType<typeof ProductRequest>,
  options?: { includeInternal?: boolean },
) {
  return {
    id: request._id.toString(),
    desiredBrand: request.desiredBrand,
    desiredProduct: request.desiredProduct,
    category: request.category,
    budgetMin: request.budgetMin,
    budgetMax: request.budgetMax,
    requirements: request.requirements,
    name: request.name,
    email: request.email,
    phone: request.phone,
    status: request.status,
    ...(options?.includeInternal
      ? {
          internalNotes: request.internalNotes,
          emailDeliveryStatus: request.emailDeliveryStatus,
          emailDeliveryError: request.emailDeliveryError,
          confirmationEmailStatus: request.confirmationEmailStatus,
        }
      : {}),
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  };
}

export async function listMyProductRequests(userId: string, email: string) {
  const items = await ProductRequest.find({
    $or: [{ user: userId }, { email: normalizeEmail(email) }],
    status: { $ne: 'archived' },
  })
    .sort({ createdAt: -1 })
    .limit(50);
  return items.map((i) => serializeRequest(i));
}

export async function listAdminProductRequests(query: {
  page?: number;
  limit?: number;
  search?: string;
  status?: RequestStatus;
}) {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(50, Math.max(1, query.limit ?? 20));
  const filter: FilterQuery<InstanceType<typeof ProductRequest>> = {};

  if (query.status) filter.status = query.status;
  if (query.search?.trim()) {
    const q = query.search.trim();
    filter.$or = [
      { name: new RegExp(q, 'i') },
      { email: new RegExp(q, 'i') },
      { desiredBrand: new RegExp(q, 'i') },
      { desiredProduct: new RegExp(q, 'i') },
    ];
  }

  const [items, total] = await Promise.all([
    ProductRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    ProductRequest.countDocuments(filter),
  ]);

  return {
    items: items.map((i) => serializeRequest(i, { includeInternal: true })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
}

export async function getAdminProductRequest(id: string) {
  const request = await ProductRequest.findById(id);
  if (!request) throw notFound('Product request not found');
  return serializeRequest(request, { includeInternal: true });
}

export async function updateAdminProductRequest(
  id: string,
  input: { status?: RequestStatus; internalNotes?: string },
) {
  const request = await ProductRequest.findById(id);
  if (!request) throw notFound('Product request not found');

  if (input.status !== undefined) request.status = input.status;
  if (input.internalNotes !== undefined) request.internalNotes = input.internalNotes;
  await request.save();
  return serializeRequest(request, { includeInternal: true });
}

export async function deleteAdminProductRequest(id: string) {
  const request = await ProductRequest.findById(id);
  if (!request) throw notFound('Product request not found');
  request.status = 'archived';
  await request.save();
  return serializeRequest(request, { includeInternal: true });
}

export async function getProductRequestStats() {
  const [total, newCount, inProgress, resolved] = await Promise.all([
    ProductRequest.countDocuments({ status: { $ne: 'archived' } }),
    ProductRequest.countDocuments({ status: 'new' }),
    ProductRequest.countDocuments({ status: 'in-progress' }),
    ProductRequest.countDocuments({ status: 'resolved' }),
  ]);
  return { total, new: newCount, inProgress, resolved };
}
