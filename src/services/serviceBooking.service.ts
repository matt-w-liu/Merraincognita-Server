import { serviceBookingSchema, type RequestStatus } from '@merraincognita/shared';
import { ServiceBooking } from '../models/ServiceBooking.js';
import { hashIp, normalizeEmail } from '../utils/crypto.js';
import { notFound } from '../utils/AppError.js';
import { sendServiceBookingConfirmation, sendServiceBookingNotification } from './email.service.js';
import type { FilterQuery } from 'mongoose';
import type { z } from 'zod';

export async function submitServiceBooking(
  input: z.infer<typeof serviceBookingSchema>,
  meta?: { userId?: string; ip?: string },
) {
  const data = serviceBookingSchema.parse(input);

  if (data.website && data.website.length > 0) {
    return { id: 'ignored', message: 'Thank you. Your booking request has been received.' };
  }

  const booking = await ServiceBooking.create({
    user: meta?.userId,
    serviceCategory: data.serviceCategory,
    serviceName: data.serviceName,
    preferredDate: data.preferredDate,
    preferredTimeSlot: data.preferredTimeSlot,
    name: data.name.trim(),
    email: normalizeEmail(data.email),
    phone: data.phone,
    notes: data.notes,
    status: 'new',
    emailDeliveryStatus: 'pending',
    confirmationEmailStatus: 'pending',
    ipHash: hashIp(meta?.ip),
  });

  const notifyResult = await sendServiceBookingNotification({
    serviceCategory: booking.serviceCategory,
    serviceName: booking.serviceName,
    name: booking.name,
    email: booking.email,
    phone: booking.phone,
    preferredDate: booking.preferredDate.toISOString().slice(0, 10),
    preferredTimeSlot: booking.preferredTimeSlot,
    notes: booking.notes,
  });
  booking.emailDeliveryStatus = notifyResult.status;
  if (notifyResult.error) booking.emailDeliveryError = notifyResult.error;

  const confirmResult = await sendServiceBookingConfirmation({
    name: booking.name,
    email: booking.email,
    serviceCategory: booking.serviceCategory,
  });
  booking.confirmationEmailStatus = confirmResult.status;

  await booking.save();

  return { id: booking._id.toString(), message: 'Thank you. Your booking request has been received.' };
}

function serializeBooking(
  booking: InstanceType<typeof ServiceBooking>,
  options?: { includeInternal?: boolean },
) {
  return {
    id: booking._id.toString(),
    serviceCategory: booking.serviceCategory,
    serviceName: booking.serviceName,
    preferredDate: booking.preferredDate,
    preferredTimeSlot: booking.preferredTimeSlot,
    name: booking.name,
    email: booking.email,
    phone: booking.phone,
    notes: booking.notes,
    status: booking.status,
    ...(options?.includeInternal
      ? {
          internalNotes: booking.internalNotes,
          emailDeliveryStatus: booking.emailDeliveryStatus,
          emailDeliveryError: booking.emailDeliveryError,
          confirmationEmailStatus: booking.confirmationEmailStatus,
        }
      : {}),
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
  };
}

export async function listMyServiceBookings(userId: string, email: string) {
  const items = await ServiceBooking.find({
    $or: [{ user: userId }, { email: normalizeEmail(email) }],
    status: { $ne: 'archived' },
  })
    .sort({ createdAt: -1 })
    .limit(50);
  return items.map((i) => serializeBooking(i));
}

export async function listAdminServiceBookings(query: {
  page?: number;
  limit?: number;
  search?: string;
  status?: RequestStatus;
}) {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(50, Math.max(1, query.limit ?? 20));
  const filter: FilterQuery<InstanceType<typeof ServiceBooking>> = {};

  if (query.status) filter.status = query.status;
  if (query.search?.trim()) {
    const q = query.search.trim();
    filter.$or = [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }];
  }

  const [items, total] = await Promise.all([
    ServiceBooking.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    ServiceBooking.countDocuments(filter),
  ]);

  return {
    items: items.map((i) => serializeBooking(i, { includeInternal: true })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
}

export async function getAdminServiceBooking(id: string) {
  const booking = await ServiceBooking.findById(id);
  if (!booking) throw notFound('Booking request not found');
  return serializeBooking(booking, { includeInternal: true });
}

export async function updateAdminServiceBooking(
  id: string,
  input: { status?: RequestStatus; internalNotes?: string },
) {
  const booking = await ServiceBooking.findById(id);
  if (!booking) throw notFound('Booking request not found');

  if (input.status !== undefined) booking.status = input.status;
  if (input.internalNotes !== undefined) booking.internalNotes = input.internalNotes;
  await booking.save();
  return serializeBooking(booking, { includeInternal: true });
}

export async function deleteAdminServiceBooking(id: string) {
  const booking = await ServiceBooking.findById(id);
  if (!booking) throw notFound('Booking request not found');
  booking.status = 'archived';
  await booking.save();
  return serializeBooking(booking, { includeInternal: true });
}

export async function getServiceBookingStats() {
  const [total, newCount, inProgress, resolved] = await Promise.all([
    ServiceBooking.countDocuments({ status: { $ne: 'archived' } }),
    ServiceBooking.countDocuments({ status: 'new' }),
    ServiceBooking.countDocuments({ status: 'in-progress' }),
    ServiceBooking.countDocuments({ status: 'resolved' }),
  ]);
  return { total, new: newCount, inProgress, resolved };
}
