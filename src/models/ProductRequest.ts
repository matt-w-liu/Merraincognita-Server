import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';
import type { EmailDeliveryStatus, ProductCategory, RequestStatus } from '@merraincognita/shared';

export interface IProductRequest {
  user?: Types.ObjectId;
  desiredBrand: string;
  desiredProduct?: string;
  category?: ProductCategory;
  budgetMin?: number;
  budgetMax?: number;
  requirements?: string;
  name: string;
  email: string;
  phone?: string;
  status: RequestStatus;
  internalNotes?: string;
  emailDeliveryStatus: EmailDeliveryStatus;
  emailDeliveryError?: string;
  confirmationEmailStatus: EmailDeliveryStatus;
  ipHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductRequestDocument extends IProductRequest, Document {
  _id: Types.ObjectId;
}

const productRequestSchema = new Schema<IProductRequestDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    desiredBrand: { type: String, required: true, trim: true, maxlength: 60 },
    desiredProduct: { type: String, trim: true, maxlength: 120 },
    category: {
      type: String,
      enum: ['mens-apparel', 'womens-apparel', 'footwear', 'accessories'],
    },
    budgetMin: { type: Number, min: 0 },
    budgetMax: { type: Number, min: 0 },
    requirements: { type: String, maxlength: 3000 },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, maxlength: 30 },
    status: {
      type: String,
      enum: ['new', 'in-progress', 'resolved', 'archived'],
      default: 'new',
      index: true,
    },
    internalNotes: { type: String, maxlength: 5000 },
    emailDeliveryStatus: {
      type: String,
      enum: ['pending', 'sent', 'failed', 'skipped'],
      default: 'pending',
    },
    emailDeliveryError: { type: String },
    confirmationEmailStatus: {
      type: String,
      enum: ['pending', 'sent', 'failed', 'skipped'],
      default: 'pending',
    },
    ipHash: { type: String },
  },
  { timestamps: true },
);

productRequestSchema.index({ createdAt: -1 });

export const ProductRequest: Model<IProductRequestDocument> =
  mongoose.models.ProductRequest ||
  mongoose.model<IProductRequestDocument>('ProductRequest', productRequestSchema);
