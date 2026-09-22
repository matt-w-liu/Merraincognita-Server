import { technologyInquirySchema, type RequestStatus } from '@merraincognita/shared';
import { TechnologyInquiry } from '../models/TechnologyInquiry.js';
import { hashIp, normalizeEmail } from '../utils/crypto.js';
import { notFound } from '../utils/AppError.js';
import { sendTechnologyInquiryConfirmation, sendTechnologyInquiryNotification } from './email.service.js';
import type { FilterQuery } from 'mongoose';
import type { z } from 'zod';

export async function submitTechnologyInquiry(
  input: z.infer<typeof technologyInquirySchema>,
  meta?: { userId?: string; ip?: string },
) {
  const data = technologyInquirySchema.parse(input);

  if (data.website && data.website.length > 0) {
    return { id: 'ignored', message: 'Thank you. Your enquiry has been received.' };
  }

  const inquiry = await TechnologyInquiry.create({
    user: meta?.userId,
    serviceType: data.serviceType,
    companyName: data.companyName,
    projectDescription: data.projectDescription.trim(),
    budgetRange: data.budgetRange,
    timeline: data.timeline,
    name: data.name.trim(),
    email: normalizeEmail(data.email),
    phone: data.phone,
    preferredContactMethod: data.preferredContactMethod,
    status: 'new',
    emailDeliveryStatus: 'pending',
    confirmationEmailStatus: 'pending',
    ipHash: hashIp(meta?.ip),
  });

  const notifyResult = await sendTechnologyInquiryNotification({
    serviceType: inquiry.serviceType,
    companyName: inquiry.companyName,
    projectDescription: inquiry.projectDescription,
    budgetRange: inquiry.budgetRange,
    timeline: inquiry.timeline,
    name: inquiry.name,
    email: inquiry.email,
    phone: inquiry.phone,
  });
  inquiry.emailDeliveryStatus = notifyResult.status;
  if (notifyResult.error) inquiry.emailDeliveryError = notifyResult.error;

  const confirmResult = await sendTechnologyInquiryConfirmation({
    name: inquiry.name,
    email: inquiry.email,
    serviceType: inquiry.serviceType,
  });
  inquiry.confirmationEmailStatus = confirmResult.status;

  await inquiry.save();

  return { id: inquiry._id.toString(), message: 'Thank you. Your enquiry has been received.' };
}

function serializeInquiry(
  inquiry: InstanceType<typeof TechnologyInquiry>,
  options?: { includeInternal?: boolean },
) {
  return {
    id: inquiry._id.toString(),
    serviceType: inquiry.serviceType,
    companyName: inquiry.companyName,
    projectDescription: inquiry.projectDescription,
    budgetRange: inquiry.budgetRange,
    timeline: inquiry.timeline,
    name: inquiry.name,
    email: inquiry.email,
    phone: inquiry.phone,
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

export async function listMyTechnologyInquiries(userId: string, email: string) {
  const items = await TechnologyInquiry.find({
    $or: [{ user: userId }, { email: normalizeEmail(email) }],
    status: { $ne: 'archived' },
  })
    .sort({ createdAt: -1 })
    .limit(50);
  return items.map((i) => serializeInquiry(i));
}

export async function listAdminTechnologyInquiries(query: {
  page?: number;
  limit?: number;
  search?: string;
  status?: RequestStatus;
}) {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(50, Math.max(1, query.limit ?? 20));
  const filter: FilterQuery<InstanceType<typeof TechnologyInquiry>> = {};

  if (query.status) filter.status = query.status;
  if (query.search?.trim()) {
    const q = query.search.trim();
    filter.$or = [
      { name: new RegExp(q, 'i') },
      { email: new RegExp(q, 'i') },
      { companyName: new RegExp(q, 'i') },
    ];
  }

  const [items, total] = await Promise.all([
    TechnologyInquiry.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    TechnologyInquiry.countDocuments(filter),
  ]);

  return {
    items: items.map((i) => serializeInquiry(i, { includeInternal: true })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
}

export async function getAdminTechnologyInquiry(id: string) {
  const inquiry = await TechnologyInquiry.findById(id);
  if (!inquiry) throw notFound('Technology inquiry not found');
  return serializeInquiry(inquiry, { includeInternal: true });
}

export async function updateAdminTechnologyInquiry(
  id: string,
  input: { status?: RequestStatus; internalNotes?: string },
) {
  const inquiry = await TechnologyInquiry.findById(id);
  if (!inquiry) throw notFound('Technology inquiry not found');

  if (input.status !== undefined) inquiry.status = input.status;
  if (input.internalNotes !== undefined) inquiry.internalNotes = input.internalNotes;
  await inquiry.save();
  return serializeInquiry(inquiry, { includeInternal: true });
}

export async function deleteAdminTechnologyInquiry(id: string) {
  const inquiry = await TechnologyInquiry.findById(id);
  if (!inquiry) throw notFound('Technology inquiry not found');
  inquiry.status = 'archived';
  await inquiry.save();
  return serializeInquiry(inquiry, { includeInternal: true });
}

export async function getTechnologyInquiryStats() {
  const [total, newCount, inProgress, resolved] = await Promise.all([
    TechnologyInquiry.countDocuments({ status: { $ne: 'archived' } }),
    TechnologyInquiry.countDocuments({ status: 'new' }),
    TechnologyInquiry.countDocuments({ status: 'in-progress' }),
    TechnologyInquiry.countDocuments({ status: 'resolved' }),
  ]);
  return { total, new: newCount, inProgress, resolved };
}
