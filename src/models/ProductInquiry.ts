import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';
import type { EmailDeliveryStatus, PreferredContactMethod, RequestStatus } from '@merraincognita/shared';

export interface IProductInquiry {
  product: Types.ObjectId;
  user?: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  message: string;
  preferredContactMethod: PreferredContactMethod;
  status: RequestStatus;
  internalNotes?: string;
  emailDeliveryStatus: EmailDeliveryStatus;
  emailDeliveryError?: string;
  confirmationEmailStatus: EmailDeliveryStatus;
  ipHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductInquiryDocument extends IProductInquiry, Document {
  _id: Types.ObjectId;
}

const productInquirySchema = new Schema<IProductInquiryDocument>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, maxlength: 30 },
    message: { type: String, required: true, maxlength: 3000 },
    preferredContactMethod: {
      type: String,
      enum: ['email', 'phone', 'either'],
      default: 'email',
    },
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

productInquirySchema.index({ createdAt: -1 });

export const ProductInquiry: Model<IProductInquiryDocument> =
  mongoose.models.ProductInquiry ||
  mongoose.model<IProductInquiryDocument>('ProductInquiry', productInquirySchema);
