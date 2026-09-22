import { Router } from 'express';
import * as productInquiryController from '../controllers/productInquiry.controller.js';
import { authenticate, optionalAuthenticate, requireRole } from '../middleware/auth.js';
import { contactRateLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.post('/', contactRateLimiter, optionalAuthenticate, productInquiryController.createProductInquiry);
router.get('/mine', authenticate, productInquiryController.getMyProductInquiries);

export const adminProductInquiryRoutes = Router();
adminProductInquiryRoutes.use(authenticate, requireRole('admin'));
adminProductInquiryRoutes.get('/', productInquiryController.adminListProductInquiries);
adminProductInquiryRoutes.get('/:id', productInquiryController.adminGetProductInquiry);
adminProductInquiryRoutes.patch('/:id', productInquiryController.adminUpdateProductInquiry);
adminProductInquiryRoutes.delete('/:id', productInquiryController.adminDeleteProductInquiry);

export default router;
