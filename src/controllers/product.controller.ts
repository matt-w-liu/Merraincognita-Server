import type { Response } from 'express';
import { productCreateSchema, productListQuerySchema, productUpdateSchema } from '@merraincognita/shared';
import {
  createProduct,
  deleteProduct,
  getProductBySlug,
  getProductStats,
  getRelatedProducts,
  listProducts,
  updateProduct,
} from '../services/product.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { AuthRequest } from '../types/express.js';

export const getProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const query = productListQuerySchema.parse(req.query);
  const result = await listProducts(query);
  sendSuccess(res, result);
});

export const getProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const product = await getProductBySlug(req.params.slug);
  const related = await getRelatedProducts(product.id, product.category);
  sendSuccess(res, { product, related });
});

export const adminGetProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const query = productListQuerySchema.parse(req.query);
  const result = await listProducts({
    ...query,
    includeArchived: req.query.includeArchived === 'true',
    archived: req.query.archived === 'true' ? true : req.query.archived === 'false' ? false : undefined,
    published:
      req.query.published === 'true' ? true : req.query.published === 'false' ? false : undefined,
    admin: true,
  });
  sendSuccess(res, result);
});

export const adminGetProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const product = await getProductBySlug(req.params.slug, true);
  sendSuccess(res, { product });
});

export const adminCreateProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = productCreateSchema.parse(req.body);
  const product = await createProduct(body, req.user!._id.toString());
  sendSuccess(res, { product }, 'Product created', 201);
});

export const adminUpdateProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = productUpdateSchema.parse(req.body);
  const product = await updateProduct(req.params.id, body);
  sendSuccess(res, { product }, 'Product updated');
});

export const adminDeleteProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const hard = req.query.hard === 'true';
  const result = await deleteProduct(req.params.id, hard);
  sendSuccess(res, result, hard ? 'Product deleted' : 'Product archived');
});

export const adminProductStats = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const stats = await getProductStats();
  sendSuccess(res, stats);
});
