import type { Response } from 'express';
import { productRequestSchema, requestAdminUpdateSchema, requestStatuses, type RequestStatus } from '@merraincognita/shared';
import {
  deleteAdminProductRequest,
  getAdminProductRequest,
  getProductRequestStats,
  listAdminProductRequests,
  listMyProductRequests,
  submitProductRequest,
  updateAdminProductRequest,
} from '../services/productRequest.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { AuthRequest } from '../types/express.js';

export const createProductRequest = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = productRequestSchema.parse(req.body);
  const result = await submitProductRequest(body, {
    userId: req.user?._id.toString(),
    ip: req.ip,
  });
  sendSuccess(res, result, result.message, 201);
});

export const getMyProductRequests = asyncHandler(async (req: AuthRequest, res: Response) => {
  const items = await listMyProductRequests(req.user!._id.toString(), req.user!.email);
  sendSuccess(res, { items });
});

export const adminListProductRequests = asyncHandler(async (req: AuthRequest, res: Response) => {
  const status =
    typeof req.query.status === 'string' && (requestStatuses as readonly string[]).includes(req.query.status)
      ? (req.query.status as RequestStatus)
      : undefined;

  const result = await listAdminProductRequests({
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
    search: typeof req.query.search === 'string' ? req.query.search : undefined,
    status,
  });
  sendSuccess(res, result);
});

export const adminGetProductRequest = asyncHandler(async (req: AuthRequest, res: Response) => {
  const request = await getAdminProductRequest(req.params.id);
  sendSuccess(res, { request });
});

export const adminUpdateProductRequest = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = requestAdminUpdateSchema.parse(req.body);
  const request = await updateAdminProductRequest(req.params.id, body);
  sendSuccess(res, { request }, 'Request updated');
});

export const adminDeleteProductRequest = asyncHandler(async (req: AuthRequest, res: Response) => {
  const request = await deleteAdminProductRequest(req.params.id);
  sendSuccess(res, { request }, 'Request archived');
});

export const adminProductRequestStats = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const stats = await getProductRequestStats();
  sendSuccess(res, stats);
});
