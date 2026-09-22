import { Router } from 'express';
import * as serviceBookingController from '../controllers/serviceBooking.controller.js';
import { authenticate, optionalAuthenticate, requireRole } from '../middleware/auth.js';
import { contactRateLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.post('/', contactRateLimiter, optionalAuthenticate, serviceBookingController.createServiceBooking);
router.get('/mine', authenticate, serviceBookingController.getMyServiceBookings);

export const adminServiceBookingRoutes = Router();
adminServiceBookingRoutes.use(authenticate, requireRole('admin'));
adminServiceBookingRoutes.get('/', serviceBookingController.adminListServiceBookings);
adminServiceBookingRoutes.get('/:id', serviceBookingController.adminGetServiceBooking);
adminServiceBookingRoutes.patch('/:id', serviceBookingController.adminUpdateServiceBooking);
adminServiceBookingRoutes.delete('/:id', serviceBookingController.adminDeleteServiceBooking);

export default router;
