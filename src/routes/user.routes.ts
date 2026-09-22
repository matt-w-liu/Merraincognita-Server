import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/me', authenticate, userController.getMe);
router.patch('/me', authenticate, userController.patchMe);
router.get('/me/favourites', authenticate, userController.getMyFavourites);
router.post('/me/favourites/:productId', authenticate, userController.addMyFavourite);
router.delete('/me/favourites/:productId', authenticate, userController.removeMyFavourite);

export const adminUserRoutes = Router();
adminUserRoutes.use(authenticate, requireRole('admin'));
adminUserRoutes.get('/', userController.adminListUsers);
adminUserRoutes.patch('/:id/status', userController.adminUpdateUserStatus);
adminUserRoutes.patch('/:id/role', userController.adminUpdateUserRole);

export default router;
