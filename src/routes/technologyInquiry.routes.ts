import { Router } from 'express';
import * as technologyInquiryController from '../controllers/technologyInquiry.controller.js';
import { authenticate, optionalAuthenticate, requireRole } from '../middleware/auth.js';
import { contactRateLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.post(
  '/',
  contactRateLimiter,
  optionalAuthenticate,
  technologyInquiryController.createTechnologyInquiry,
);
router.get('/mine', authenticate, technologyInquiryController.getMyTechnologyInquiries);

export const adminTechnologyInquiryRoutes = Router();
adminTechnologyInquiryRoutes.use(authenticate, requireRole('admin'));
adminTechnologyInquiryRoutes.get('/', technologyInquiryController.adminListTechnologyInquiries);
adminTechnologyInquiryRoutes.get('/:id', technologyInquiryController.adminGetTechnologyInquiry);
adminTechnologyInquiryRoutes.patch('/:id', technologyInquiryController.adminUpdateTechnologyInquiry);
adminTechnologyInquiryRoutes.delete('/:id', technologyInquiryController.adminDeleteTechnologyInquiry);

export default router;
