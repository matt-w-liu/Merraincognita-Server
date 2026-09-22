import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getContactStats } from '../services/contact.service.js';
import { getProductStats } from '../services/product.service.js';
import { getProductInquiryStats } from '../services/productInquiry.service.js';
import { getServiceBookingStats } from '../services/serviceBooking.service.js';
import { getProductRequestStats } from '../services/productRequest.service.js';
import { getTechnologyInquiryStats } from '../services/technologyInquiry.service.js';
import { getUserStats } from '../services/user.service.js';

export const health = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

export const ready = asyncHandler(async (_req: Request, res: Response) => {
  const dbReady = mongoose.connection.readyState === 1;
  if (!dbReady) {
    res.status(503).json({
      success: false,
      message: 'Database not ready',
      code: 'NOT_READY',
    });
    return;
  }
  sendSuccess(res, { status: 'ready', database: 'connected' });
});

export const adminDashboard = asyncHandler(async (_req: Request, res: Response) => {
  const [products, users, contact, productInquiries, serviceBookings, productRequests, technologyInquiries] =
    await Promise.all([
      getProductStats(),
      getUserStats(),
      getContactStats(),
      getProductInquiryStats(),
      getServiceBookingStats(),
      getProductRequestStats(),
      getTechnologyInquiryStats(),
    ]);
  sendSuccess(res, {
    products,
    users,
    contact,
    productInquiries,
    serviceBookings,
    productRequests,
    technologyInquiries,
  });
});
