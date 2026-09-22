import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import {
  authRateLimiter,
  passwordResetRateLimiter,
} from '../middleware/rateLimit.js';

const router = Router();

router.post('/register', authRateLimiter, authController.register);
router.post('/login', authRateLimiter, authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refresh);
router.get('/me', authenticate, authController.me);
router.post('/forgot-password', passwordResetRateLimiter, authController.forgotPassword);
router.post('/reset-password', passwordResetRateLimiter, authController.resetPasswordHandler);
router.patch('/update-password', authenticate, authController.updatePasswordHandler);

export default router;
