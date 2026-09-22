import { contactAdminUpdateSchema, contactSchema, type ContactReason, type RequestStatus } from '@merraincognita/shared';
import { ContactMessage } from '../models/ContactMessage.js';
import { User } from '../models/User.js';
import { hashIp, normalizeEmail } from '../utils/crypto.js';
import { notFound } from '../utils/AppError.js';
import { sendContactConfirmation, sendContactNotification } from './email.service.js';
import type { FilterQuery } from 'mongoose';
import type { z } from 'zod';

export async function submitContact(
  input: z.infer<typeof contactSchema>,
  meta?: { userId?: string; ip?: string },
) {
  const data = contactSchema.parse(input);

  if (data.website && data.website.length > 0) {
    return {
      id: 'ignored',
      message: 'Thank you. Your message has been received.',
    };
  }

  const email = normalizeEmail(data.email);
  let userId = meta?.userId;
  if (!userId) {
    const matched = await User.findOne({ email });
    if (matched) userId = matched._id.toString();
  }

  const message = await ContactMessage.create({
    name: data.name.trim(),
    email,
    phone: data.phone,
    reason: data.reason,
    subject: data.subject.trim(),
    message: data.message.trim(),
    consent: data.consent,
    status: 'new',
    emailDeliveryStatus: 'pending',
    confirmationEmailStatus: 'pending',
    userId,
    ipHash: hashIp(meta?.ip),
  });

  const notifyResult = await sendContactNotification({
    name: message.name,
    email: message.email,
    phone: message.phone,
    reason: message.reason,
    subject: message.subject,
    message: message.message,
  });

  message.emailDeliveryStatus = notifyResult.status;
  if (notifyResult.error) message.emailDeliveryError = notifyResult.error;

  const confirmResult = await sendContactConfirmation({
    name: message.name,
    email: message.email,
    subject: message.subject,
  });
  message.confirmationEmailStatus = confirmResult.status;

  await message.save();

  console.info('[contact] Message saved', {
    id: message._id.toString(),
    reason: message.reason,
    notify: message.emailDeliveryStatus,
    confirm: message.confirmationEmailStatus,
  });

  return {
    id: message._id.toString(),
    message: 'Thank you. Your message has been received.',
  };
}

function serializeMessage(
  message: InstanceType<typeof ContactMessage>,
  options?: { includeInternal?: boolean },
) {
  return {
    id: message._id.toString(),
    name: message.name,
    email: message.email,
    phone: message.phone,
    reason: message.reason,
    subject: message.subject,
    message: message.message,
    consent: message.consent,
    status: message.status,
    ...(options?.includeInternal
      ? {
          internalNotes: message.internalNotes,
          emailDeliveryStatus: message.emailDeliveryStatus,
          emailDeliveryError: message.emailDeliveryError,
          confirmationEmailStatus: message.confirmationEmailStatus,
        }
      : {}),
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  };
}

export async function listMyMessages(userId: string, email: string) {
  const items = await ContactMessage.find({
    $or: [{ userId }, { email: normalizeEmail(email) }],
    status: { $ne: 'archived' },
  })
    .sort({ createdAt: -1 })
    .limit(50);
  return items.map((i) => serializeMessage(i));
}

export async function listAdminMessages(query: {
  page?: number;
  limit?: number;
  search?: string;
  status?: RequestStatus;
  reason?: ContactReason;
}) {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(50, Math.max(1, query.limit ?? 20));
  const filter: FilterQuery<InstanceType<typeof ContactMessage>> = {};

  if (query.status) filter.status = query.status;
  if (query.reason) filter.reason = query.reason;
  if (query.search?.trim()) {
    const q = query.search.trim();
    filter.$or = [
      { name: new RegExp(q, 'i') },
      { email: new RegExp(q, 'i') },
      { subject: new RegExp(q, 'i') },
    ];
  }

  const [items, total] = await Promise.all([
    ContactMessage.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    ContactMessage.countDocuments(filter),
  ]);

  return {
    items: items.map((i) => serializeMessage(i, { includeInternal: true })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getAdminMessage(id: string) {
  const message = await ContactMessage.findById(id);
  if (!message) throw notFound('Message not found');
  return serializeMessage(message, { includeInternal: true });
}

export async function updateAdminMessage(
  id: string,
  input: z.infer<typeof contactAdminUpdateSchema>,
) {
  const data = contactAdminUpdateSchema.parse(input);
  const message = await ContactMessage.findById(id);
  if (!message) throw notFound('Message not found');

  if (data.status !== undefined) message.status = data.status;
  if (data.internalNotes !== undefined) message.internalNotes = data.internalNotes;
  await message.save();
  return serializeMessage(message, { includeInternal: true });
}

export async function deleteAdminMessage(id: string) {
  const message = await ContactMessage.findById(id);
  if (!message) throw notFound('Message not found');
  message.status = 'archived';
  await message.save();
  return serializeMessage(message, { includeInternal: true });
}

export async function getContactStats() {
  const [total, newCount, inProgress, resolved] = await Promise.all([
    ContactMessage.countDocuments({ status: { $ne: 'archived' } }),
    ContactMessage.countDocuments({ status: 'new' }),
    ContactMessage.countDocuments({ status: 'in-progress' }),
    ContactMessage.countDocuments({ status: 'resolved' }),
  ]);
  const recent = await ContactMessage.find({ status: { $ne: 'archived' } })
    .sort({ createdAt: -1 })
    .limit(5);
  return {
    total,
    new: newCount,
    inProgress,
    resolved,
    recent: recent.map((i) => serializeMessage(i, { includeInternal: true })),
  };
}
