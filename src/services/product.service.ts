import slugify from 'slugify';
import {
  productCreateSchema,
  productUpdateSchema,
  type ProductCategory,
  type StockStatus,
} from '@merraincognita/shared';
import { Product, type IProductDocument } from '../models/Product.js';
import { notFound } from '../utils/AppError.js';
import type { FilterQuery, SortOrder } from 'mongoose';
import type { z } from 'zod';

export interface ProductListQuery {
  page?: number;
  limit?: number;
  search?: string;
  brand?: string;
  category?: ProductCategory;
  minPrice?: number;
  maxPrice?: number;
  stockStatus?: StockStatus;
  featured?: boolean;
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'name-asc';
  published?: boolean;
  archived?: boolean;
  includeArchived?: boolean;
  admin?: boolean;
}

async function ensureUniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = slugify(base, { lower: true, strict: true });
  if (!slug) slug = 'product';
  let candidate = slug;
  let i = 1;
  while (true) {
    const existing = await Product.findOne({
      slug: candidate,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    });
    if (!existing) return candidate;
    candidate = `${slug}-${i++}`;
  }
}

function serializeProduct(product: IProductDocument) {
  return {
    id: product._id.toString(),
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    brand: product.brand,
    category: product.category,
    subcategory: product.subcategory,
    price: product.price,
    currency: product.currency,
    size: product.size,
    description: product.description,
    highlights: product.highlights,
    images: product.images,
    stockStatus: product.stockStatus,
    featured: product.featured,
    published: product.published,
    archived: product.archived,
    isSample: product.isSample,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    createdBy: product.createdBy?.toString(),
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

function buildSort(sort?: ProductListQuery['sort'], hasSearch?: boolean): Record<string, SortOrder | { $meta: 'textScore' }> {
  if (hasSearch) return { score: { $meta: 'textScore' } };
  switch (sort) {
    case 'price-asc':
      return { price: 1 };
    case 'price-desc':
      return { price: -1 };
    case 'name-asc':
      return { name: 1 };
    case 'newest':
    default:
      return { featured: -1, createdAt: -1 };
  }
}

export async function listProducts(query: ProductListQuery) {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(50, Math.max(1, query.limit ?? 12));
  const filter: FilterQuery<IProductDocument> = {};

  if (query.admin) {
    if (query.archived !== undefined) filter.archived = query.archived;
    else if (!query.includeArchived) filter.archived = false;
    if (query.published !== undefined) filter.published = query.published;
  } else {
    filter.published = true;
    filter.archived = false;
  }

  if (query.brand) filter.brand = new RegExp(`^${query.brand}$`, 'i');
  if (query.category) filter.category = query.category;
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    filter.price = {};
    if (query.minPrice !== undefined) filter.price.$gte = query.minPrice;
    if (query.maxPrice !== undefined) filter.price.$lte = query.maxPrice;
  }
  if (query.stockStatus) filter.stockStatus = query.stockStatus;
  if (query.featured !== undefined) filter.featured = query.featured;
  if (query.search?.trim()) {
    filter.$text = { $search: query.search.trim() };
  }

  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort(buildSort(query.sort, Boolean(query.search?.trim())))
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  return {
    items: items.map(serializeProduct),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getProductBySlug(slug: string, admin = false) {
  const filter: FilterQuery<IProductDocument> = { slug };
  if (!admin) {
    filter.published = true;
    filter.archived = false;
  }
  const product = await Product.findOne(filter);
  if (!product) throw notFound('Product not found');
  return serializeProduct(product);
}

export async function getProductById(id: string) {
  const product = await Product.findById(id);
  if (!product) throw notFound('Product not found');
  return serializeProduct(product);
}

export async function getRelatedProducts(productId: string, category: ProductCategory, limit = 4) {
  const items = await Product.find({
    _id: { $ne: productId },
    category,
    published: true,
    archived: false,
  })
    .sort({ featured: -1, createdAt: -1 })
    .limit(limit);
  return items.map(serializeProduct);
}

export async function createProduct(
  input: z.infer<typeof productCreateSchema>,
  createdBy?: string,
) {
  const data = productCreateSchema.parse(input);
  const slug = await ensureUniqueSlug(data.slug || data.name);
  const product = await Product.create({
    ...data,
    slug,
    createdBy,
    isSample: false,
  });
  return serializeProduct(product);
}

export async function updateProduct(id: string, input: z.infer<typeof productUpdateSchema>) {
  const data = productUpdateSchema.parse(input);
  const product = await Product.findById(id);
  if (!product) throw notFound('Product not found');

  if (data.slug && data.slug !== product.slug) {
    data.slug = await ensureUniqueSlug(data.slug, id);
  }

  Object.assign(product, data);
  await product.save();
  return serializeProduct(product);
}

export async function deleteProduct(id: string, hard = false) {
  const product = await Product.findById(id);
  if (!product) throw notFound('Product not found');

  if (hard) {
    await product.deleteOne();
    return { deleted: true };
  }

  product.archived = true;
  product.published = false;
  await product.save();
  return serializeProduct(product);
}

export async function getProductStats() {
  const [total, published, featured, inStock, outOfStock, sample] = await Promise.all([
    Product.countDocuments({ archived: false }),
    Product.countDocuments({ published: true, archived: false }),
    Product.countDocuments({ featured: true, archived: false }),
    Product.countDocuments({ stockStatus: 'in-stock', archived: false }),
    Product.countDocuments({ stockStatus: 'out-of-stock', archived: false }),
    Product.countDocuments({ isSample: true, archived: false }),
  ]);
  return { total, published, featured, inStock, outOfStock, sample };
}

export { serializeProduct };
