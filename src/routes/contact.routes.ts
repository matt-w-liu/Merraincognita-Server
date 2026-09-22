import { Router } from 'express';
import * as contactController from '../controllers/contact.controller.js';
import { authenticate, optionalAuthenticate, requireRole } from '../middleware/auth.js';
import { contactRateLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.post('/', contactRateLimiter, optionalAuthenticate, contactController.createContact);
router.get('/mine', authenticate, contactController.getMyContact);

export const adminContactRoutes = Router();
adminContactRoutes.use(authenticate, requireRole('admin'));
adminContactRoutes.get('/', contactController.adminListContact);
adminContactRoutes.get('/:id', contactController.adminGetContact);
adminContactRoutes.patch('/:id', contactController.adminUpdateContact);
adminContactRoutes.delete('/:id', contactController.adminDeleteContact);

export default router;
