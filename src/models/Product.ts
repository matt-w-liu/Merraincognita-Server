import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';
import type { ProductCategory, StockStatus } from '@merraincognita/shared';

export interface IProductImage {
  url: string;
  alt: string;
  sortOrder: number;
}

export interface IProduct {
  name: string;
  slug: string;
  sku?: string;
  brand: string;
  category: ProductCategory;
  subcategory?: string;
  price: number;
  currency: string;
  size?: string;
  description: string;
  highlights: string[];
  images: IProductImage[];
  stockStatus: StockStatus;
  featured: boolean;
  published: boolean;
  archived: boolean;
  isSample: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// `model` is also a field on Mongoose's Document type (the compiled Model reference),
// so the document interface must omit it from Document before merging with IProduct.
export interface IProductDocument extends IProduct, Omit<Document, 'model'> {
  _id: Types.ObjectId;
}

const productSchema = new Schema<IProductDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 180 },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    sku: { type: String, trim: true, maxlength: 50 },
    brand: { type: String, required: true, trim: true, maxlength: 60, index: true },
    category: {
      type: String,
      required: true,
      enum: ['mens-apparel', 'womens-apparel', 'footwear', 'accessories'],
      index: true,
    },
    subcategory: { type: String, trim: true, maxlength: 80 },
    price: { type: Number, required: true, min: 0, index: true },
    currency: { type: String, default: 'USD', maxlength: 3 },
    size: { type: String, trim: true, maxlength: 60 },
    description: { type: String, required: true, maxlength: 10000 },
    highlights: { type: [String], default: [] },
    images: [
      {
        url: { type: String, required: true },
        alt: { type: String, required: true },
        sortOrder: { type: Number, default: 0 },
      },
    ],
    stockStatus: {
      type: String,
      enum: ['in-stock', 'low-stock', 'out-of-stock', 'discontinued'],
      default: 'in-stock',
      index: true,
    },
    featured: { type: Boolean, default: false, index: true },
    published: { type: Boolean, default: false, index: true },
    archived: { type: Boolean, default: false, index: true },
    isSample: { type: Boolean, default: false },
    seoTitle: { type: String, maxlength: 70 },
    seoDescription: { type: String, maxlength: 160 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

productSchema.index({ name: 'text', brand: 'text', category: 'text', description: 'text' });
productSchema.index({ published: 1, archived: 1, category: 1 });
productSchema.index({ published: 1, archived: 1, brand: 1 });

export const Product: Model<IProductDocument> =
  mongoose.models.Product || mongoose.model<IProductDocument>('Product', productSchema);
