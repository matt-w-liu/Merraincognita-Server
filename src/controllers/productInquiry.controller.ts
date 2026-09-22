import type { Response } from 'express';
import { productInquirySchema, requestAdminUpdateSchema, requestStatuses, type RequestStatus } from '@merraincognita/shared';
import {
  deleteAdminProductInquiry,
  getAdminProductInquiry,
  getProductInquiryStats,
  listAdminProductInquiries,
  listMyProductInquiries,
  submitProductInquiry,
  updateAdminProductInquiry,
} from '../services/productInquiry.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { AuthRequest } from '../types/express.js';

export const createProductInquiry = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = productInquirySchema.parse(req.body);
  const result = await submitProductInquiry(body, {
    userId: req.user?._id.toString(),
    ip: req.ip,
  });
  sendSuccess(res, result, result.message, 201);
});

export const getMyProductInquiries = asyncHandler(async (req: AuthRequest, res: Response) => {
  const items = await listMyProductInquiries(req.user!._id.toString(), req.user!.email);
  sendSuccess(res, { items });
});

export const adminListProductInquiries = asyncHandler(async (req: AuthRequest, res: Response) => {
  const status =
    typeof req.query.status === 'string' && (requestStatuses as readonly string[]).includes(req.query.status)
      ? (req.query.status as RequestStatus)
      : undefined;

  const result = await listAdminProductInquiries({
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
    search: typeof req.query.search === 'string' ? req.query.search : undefined,
    status,
  });
  sendSuccess(res, result);
});

export const adminGetProductInquiry = asyncHandler(async (req: AuthRequest, res: Response) => {
  const inquiry = await getAdminProductInquiry(req.params.id);
  sendSuccess(res, { inquiry });
});

export const adminUpdateProductInquiry = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = requestAdminUpdateSchema.parse(req.body);
  const inquiry = await updateAdminProductInquiry(req.params.id, body);
  sendSuccess(res, { inquiry }, 'Inquiry updated');
});

export const adminDeleteProductInquiry = asyncHandler(async (req: AuthRequest, res: Response) => {
  const inquiry = await deleteAdminProductInquiry(req.params.id);
  sendSuccess(res, { inquiry }, 'Inquiry archived');
});

export const adminProductInquiryStats = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const stats = await getProductInquiryStats();
  sendSuccess(res, stats);
});
