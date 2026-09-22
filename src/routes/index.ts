import { Router } from 'express';
import * as systemController from '../controllers/system.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { adminContactRoutes } from './contact.routes.js';
import { adminProductRoutes } from './product.routes.js';
import { adminProductInquiryRoutes } from './productInquiry.routes.js';
import { adminServiceBookingRoutes } from './serviceBooking.routes.js';
import { adminProductRequestRoutes } from './productRequest.routes.js';
import { adminTechnologyInquiryRoutes } from './technologyInquiry.routes.js';
import { adminUserRoutes } from './user.routes.js';
import * as contactController from '../controllers/contact.controller.js';
import * as productController from '../controllers/product.controller.js';
import * as productInquiryController from '../controllers/productInquiry.controller.js';
import * as serviceBookingController from '../controllers/serviceBooking.controller.js';
import * as productRequestController from '../controllers/productRequest.controller.js';
import * as technologyInquiryController from '../controllers/technologyInquiry.controller.js';

const router = Router();

router.get('/health', systemController.health);
router.get('/ready', systemController.ready);

const adminRouter = Router();
adminRouter.use(authenticate, requireRole('admin'));
adminRouter.get('/dashboard', systemController.adminDashboard);
adminRouter.get('/stats/products', productController.adminProductStats);
adminRouter.get('/stats/product-inquiries', productInquiryController.adminProductInquiryStats);
adminRouter.get('/stats/service-bookings', serviceBookingController.adminServiceBookingStats);
adminRouter.get('/stats/product-requests', productRequestController.adminProductRequestStats);
adminRouter.get('/stats/technology-inquiries', technologyInquiryController.adminTechnologyInquiryStats);
adminRouter.get('/stats/contact', contactController.adminContactStats);
adminRouter.use('/users', adminUserRoutes);
adminRouter.use('/products', adminProductRoutes);
adminRouter.use('/product-inquiries', adminProductInquiryRoutes);
adminRouter.use('/service-bookings', adminServiceBookingRoutes);
adminRouter.use('/product-requests', adminProductRequestRoutes);
adminRouter.use('/technology-inquiries', adminTechnologyInquiryRoutes);
adminRouter.use('/contact', adminContactRoutes);

export { adminRouter };
export default router;
