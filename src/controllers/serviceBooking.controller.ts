import type { Response } from 'express';
import { requestAdminUpdateSchema, requestStatuses, serviceBookingSchema, type RequestStatus } from '@merraincognita/shared';
import {
  deleteAdminServiceBooking,
  getAdminServiceBooking,
  getServiceBookingStats,
  listAdminServiceBookings,
  listMyServiceBookings,
  submitServiceBooking,
  updateAdminServiceBooking,
} from '../services/serviceBooking.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { AuthRequest } from '../types/express.js';

export const createServiceBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = serviceBookingSchema.parse(req.body);
  const result = await submitServiceBooking(body, {
    userId: req.user?._id.toString(),
    ip: req.ip,
  });
  sendSuccess(res, result, result.message, 201);
});

export const getMyServiceBookings = asyncHandler(async (req: AuthRequest, res: Response) => {
  const items = await listMyServiceBookings(req.user!._id.toString(), req.user!.email);
  sendSuccess(res, { items });
});

export const adminListServiceBookings = asyncHandler(async (req: AuthRequest, res: Response) => {
  const status =
    typeof req.query.status === 'string' && (requestStatuses as readonly string[]).includes(req.query.status)
      ? (req.query.status as RequestStatus)
      : undefined;

  const result = await listAdminServiceBookings({
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
    search: typeof req.query.search === 'string' ? req.query.search : undefined,
    status,
  });
  sendSuccess(res, result);
});

export const adminGetServiceBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
  const booking = await getAdminServiceBooking(req.params.id);
  sendSuccess(res, { booking });
});

export const adminUpdateServiceBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = requestAdminUpdateSchema.parse(req.body);
  const booking = await updateAdminServiceBooking(req.params.id, body);
  sendSuccess(res, { booking }, 'Booking request updated');
});

export const adminDeleteServiceBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
  const booking = await deleteAdminServiceBooking(req.params.id);
  sendSuccess(res, { booking }, 'Booking request archived');
});

export const adminServiceBookingStats = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const stats = await getServiceBookingStats();
  sendSuccess(res, stats);
});
