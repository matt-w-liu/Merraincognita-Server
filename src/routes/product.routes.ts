import { Router } from 'express';
import * as productController from '../controllers/product.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', productController.getProducts);
router.get('/:slug', productController.getProduct);

export const adminProductRoutes = Router();
adminProductRoutes.use(authenticate, requireRole('admin'));
adminProductRoutes.get('/', productController.adminGetProducts);
adminProductRoutes.get('/by-slug/:slug', productController.adminGetProduct);
adminProductRoutes.post('/', productController.adminCreateProduct);
adminProductRoutes.patch('/:id', productController.adminUpdateProduct);
adminProductRoutes.delete('/:id', productController.adminDeleteProduct);

export default router;
