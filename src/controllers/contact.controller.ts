import type { Response } from 'express';
import {
  contactAdminUpdateSchema,
  contactReasons,
  contactSchema,
  requestStatuses,
  type ContactReason,
  type RequestStatus,
} from '@merraincognita/shared';
import {
  deleteAdminMessage,
  getAdminMessage,
  getContactStats,
  listAdminMessages,
  listMyMessages,
  submitContact,
  updateAdminMessage,
} from '../services/contact.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { AuthRequest } from '../types/express.js';

export const createContact = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = contactSchema.parse(req.body);
  const result = await submitContact(body, {
    userId: req.user?._id.toString(),
    ip: req.ip,
  });
  sendSuccess(res, result, result.message, 201);
});

export const getMyContact = asyncHandler(async (req: AuthRequest, res: Response) => {
  const items = await listMyMessages(req.user!._id.toString(), req.user!.email);
  sendSuccess(res, { items });
});

export const adminListContact = asyncHandler(async (req: AuthRequest, res: Response) => {
  const status =
    typeof req.query.status === 'string' &&
    (requestStatuses as readonly string[]).includes(req.query.status)
      ? (req.query.status as RequestStatus)
      : undefined;
  const reason =
    typeof req.query.reason === 'string' &&
    (contactReasons as readonly string[]).includes(req.query.reason)
      ? (req.query.reason as ContactReason)
      : undefined;

  const result = await listAdminMessages({
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
    search: typeof req.query.search === 'string' ? req.query.search : undefined,
    status,
    reason,
  });
  sendSuccess(res, result);
});

export const adminGetContact = asyncHandler(async (req: AuthRequest, res: Response) => {
  const message = await getAdminMessage(req.params.id);
  sendSuccess(res, { message });
});

export const adminUpdateContact = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = contactAdminUpdateSchema.parse(req.body);
  const message = await updateAdminMessage(req.params.id, body);
  sendSuccess(res, { message }, 'Message updated');
});

export const adminDeleteContact = asyncHandler(async (req: AuthRequest, res: Response) => {
  const message = await deleteAdminMessage(req.params.id);
  sendSuccess(res, { message }, 'Message archived');
});

export const adminContactStats = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const stats = await getContactStats();
  sendSuccess(res, stats);
});
