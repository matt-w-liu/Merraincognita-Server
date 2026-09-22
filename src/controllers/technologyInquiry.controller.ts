import type { Response } from 'express';
import { requestAdminUpdateSchema, requestStatuses, technologyInquirySchema, type RequestStatus } from '@merraincognita/shared';
import {
  deleteAdminTechnologyInquiry,
  getAdminTechnologyInquiry,
  getTechnologyInquiryStats,
  listAdminTechnologyInquiries,
  listMyTechnologyInquiries,
  submitTechnologyInquiry,
  updateAdminTechnologyInquiry,
} from '../services/technologyInquiry.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { AuthRequest } from '../types/express.js';

export const createTechnologyInquiry = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = technologyInquirySchema.parse(req.body);
  const result = await submitTechnologyInquiry(body, {
    userId: req.user?._id.toString(),
    ip: req.ip,
  });
  sendSuccess(res, result, result.message, 201);
});

export const getMyTechnologyInquiries = asyncHandler(async (req: AuthRequest, res: Response) => {
  const items = await listMyTechnologyInquiries(req.user!._id.toString(), req.user!.email);
  sendSuccess(res, { items });
});

export const adminListTechnologyInquiries = asyncHandler(async (req: AuthRequest, res: Response) => {
  const status =
    typeof req.query.status === 'string' && (requestStatuses as readonly string[]).includes(req.query.status)
      ? (req.query.status as RequestStatus)
      : undefined;

  const result = await listAdminTechnologyInquiries({
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
    search: typeof req.query.search === 'string' ? req.query.search : undefined,
    status,
  });
  sendSuccess(res, result);
});

export const adminGetTechnologyInquiry = asyncHandler(async (req: AuthRequest, res: Response) => {
  const inquiry = await getAdminTechnologyInquiry(req.params.id);
  sendSuccess(res, { inquiry });
});

export const adminUpdateTechnologyInquiry = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = requestAdminUpdateSchema.parse(req.body);
  const inquiry = await updateAdminTechnologyInquiry(req.params.id, body);
  sendSuccess(res, { inquiry }, 'Enquiry updated');
});

export const adminDeleteTechnologyInquiry = asyncHandler(async (req: AuthRequest, res: Response) => {
  const inquiry = await deleteAdminTechnologyInquiry(req.params.id);
  sendSuccess(res, { inquiry }, 'Enquiry archived');
});

export const adminTechnologyInquiryStats = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const stats = await getTechnologyInquiryStats();
  sendSuccess(res, stats);
});
