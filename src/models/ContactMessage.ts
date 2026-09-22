import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';
import type { ContactReason, EmailDeliveryStatus, RequestStatus } from '@merraincognita/shared';

export interface IContactMessage {
  name: string;
  email: string;
  phone?: string;
  reason: ContactReason;
  subject: string;
  message: string;
  consent: boolean;
  status: RequestStatus;
  internalNotes?: string;
  emailDeliveryStatus: EmailDeliveryStatus;
  emailDeliveryError?: string;
  confirmationEmailStatus: EmailDeliveryStatus;
  userId?: Types.ObjectId;
  ipHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IContactMessageDocument extends IContactMessage, Document {
  _id: Types.ObjectId;
}

const contactMessageSchema = new Schema<IContactMessageDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, maxlength: 30 },
    reason: {
      type: String,
      required: true,
      enum: ['wholesale', 'consultation', 'technology', 'general', 'support', 'other'],
      index: true,
    },
    subject: { type: String, required: true, maxlength: 200 },
    message: { type: String, required: true, maxlength: 5000 },
    consent: { type: Boolean, required: true },
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
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    ipHash: { type: String },
  },
  { timestamps: true },
);

contactMessageSchema.index({ createdAt: -1 });
contactMessageSchema.index({ status: 1, reason: 1 });

export const ContactMessage: Model<IContactMessageDocument> =
  mongoose.models.ContactMessage ||
  mongoose.model<IContactMessageDocument>('ContactMessage', contactMessageSchema);
