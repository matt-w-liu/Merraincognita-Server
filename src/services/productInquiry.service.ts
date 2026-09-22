import { productInquirySchema, type RequestStatus } from '@merraincognita/shared';
import { ProductInquiry } from '../models/ProductInquiry.js';
import { Product } from '../models/Product.js';
import { hashIp, normalizeEmail } from '../utils/crypto.js';
import { notFound } from '../utils/AppError.js';
import { sendProductInquiryConfirmation, sendProductInquiryNotification } from './email.service.js';
import type { FilterQuery } from 'mongoose';
import type { z } from 'zod';

export async function submitProductInquiry(
  input: z.infer<typeof productInquirySchema>,
  meta?: { userId?: string; ip?: string },
) {
  const data = productInquirySchema.parse(input);

  if (data.website && data.website.length > 0) {
    return { id: 'ignored', message: 'Thank you. Your enquiry has been received.' };
  }

  const product = await Product.findById(data.productId);
  if (!product) throw notFound('Product not found');

  const inquiry = await ProductInquiry.create({
    product: product._id,
    user: meta?.userId,
    name: data.name.trim(),
    email: normalizeEmail(data.email),
    phone: data.phone,
    message: data.message.trim(),
    preferredContactMethod: data.preferredContactMethod,
    status: 'new',
    emailDeliveryStatus: 'pending',
    confirmationEmailStatus: 'pending',
    ipHash: hashIp(meta?.ip),
  });

  const notifyResult = await sendProductInquiryNotification({
    productName: product.name,
    name: inquiry.name,
    email: inquiry.email,
    phone: inquiry.phone,
    preferredContactMethod: inquiry.preferredContactMethod,
    message: inquiry.message,
  });
  inquiry.emailDeliveryStatus = notifyResult.status;
  if (notifyResult.error) inquiry.emailDeliveryError = notifyResult.error;

  const confirmResult = await sendProductInquiryConfirmation({
    productName: product.name,
    name: inquiry.name,
    email: inquiry.email,
  });
  inquiry.confirmationEmailStatus = confirmResult.status;

  await inquiry.save();

  return { id: inquiry._id.toString(), message: 'Thank you. Your enquiry has been received.' };
}

function serializeInquiry(
  inquiry: InstanceType<typeof ProductInquiry>,
  options?: { includeInternal?: boolean },
) {
  return {
    id: inquiry._id.toString(),
    product: inquiry.product.toString(),
    name: inquiry.name,
    email: inquiry.email,
    phone: inquiry.phone,
    message: inquiry.message,
    preferredContactMethod: inquiry.preferredContactMethod,
    status: inquiry.status,
    ...(options?.includeInternal
      ? {
          internalNotes: inquiry.internalNotes,
          emailDeliveryStatus: inquiry.emailDeliveryStatus,
          emailDeliveryError: inquiry.emailDeliveryError,
          confirmationEmailStatus: inquiry.confirmationEmailStatus,
        }
      : {}),
    createdAt: inquiry.createdAt,
    updatedAt: inquiry.updatedAt,
  };
}

export async function listMyProductInquiries(userId: string, email: string) {
  const items = await ProductInquiry.find({
    $or: [{ user: userId }, { email: normalizeEmail(email) }],
    status: { $ne: 'archived' },
  })
    .populate('product', 'name slug images')
    .sort({ createdAt: -1 })
    .limit(50);
  return items.map((i) => ({ ...serializeInquiry(i), product: i.product }));
}

export async function listAdminProductInquiries(query: {
  page?: number;
  limit?: number;
  search?: string;
  status?: RequestStatus;
}) {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(50, Math.max(1, query.limit ?? 20));
  const filter: FilterQuery<InstanceType<typeof ProductInquiry>> = {};

  if (query.status) filter.status = query.status;
  if (query.search?.trim()) {
    const q = query.search.trim();
    filter.$or = [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }];
  }

  const [items, total] = await Promise.all([
    ProductInquiry.find(filter)
      .populate('product', 'name slug')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    ProductInquiry.countDocuments(filter),
  ]);

  return {
    items: items.map((i) => ({ ...serializeInquiry(i, { includeInternal: true }), product: i.product })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
}

export async function getAdminProductInquiry(id: string) {
  const inquiry = await ProductInquiry.findById(id).populate('product', 'name slug');
  if (!inquiry) throw notFound('Inquiry not found');
  return { ...serializeInquiry(inquiry, { includeInternal: true }), product: inquiry.product };
}

export async function updateAdminProductInquiry(
  id: string,
  input: { status?: RequestStatus; internalNotes?: string },
) {
  const inquiry = await ProductInquiry.findById(id);
  if (!inquiry) throw notFound('Inquiry not found');

  if (input.status !== undefined) inquiry.status = input.status;
  if (input.internalNotes !== undefined) inquiry.internalNotes = input.internalNotes;
  await inquiry.save();
  return serializeInquiry(inquiry, { includeInternal: true });
}

export async function deleteAdminProductInquiry(id: string) {
  const inquiry = await ProductInquiry.findById(id);
  if (!inquiry) throw notFound('Inquiry not found');
  inquiry.status = 'archived';
  await inquiry.save();
  return serializeInquiry(inquiry, { includeInternal: true });
}

export async function getProductInquiryStats() {
  const [total, newCount, inProgress, resolved] = await Promise.all([
    ProductInquiry.countDocuments({ status: { $ne: 'archived' } }),
    ProductInquiry.countDocuments({ status: 'new' }),
    ProductInquiry.countDocuments({ status: 'in-progress' }),
    ProductInquiry.countDocuments({ status: 'resolved' }),
  ]);
  return { total, new: newCount, inProgress, resolved };
}
