import { Router } from 'express';
import * as productRequestController from '../controllers/productRequest.controller.js';
import { authenticate, optionalAuthenticate, requireRole } from '../middleware/auth.js';
import { contactRateLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.post('/', contactRateLimiter, optionalAuthenticate, productRequestController.createProductRequest);
router.get('/mine', authenticate, productRequestController.getMyProductRequests);

export const adminProductRequestRoutes = Router();
adminProductRequestRoutes.use(authenticate, requireRole('admin'));
adminProductRequestRoutes.get('/', productRequestController.adminListProductRequests);
adminProductRequestRoutes.get('/:id', productRequestController.adminGetProductRequest);
adminProductRequestRoutes.patch('/:id', productRequestController.adminUpdateProductRequest);
adminProductRequestRoutes.delete('/:id', productRequestController.adminDeleteProductRequest);

export default router;
