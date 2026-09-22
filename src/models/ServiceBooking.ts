import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';
import type { EmailDeliveryStatus, PreferredTimeSlot, RequestStatus, ServiceCategory } from '@merraincognita/shared';

export interface IServiceBooking {
  user?: Types.ObjectId;
  serviceCategory: ServiceCategory;
  serviceName?: string;
  preferredDate: Date;
  preferredTimeSlot: PreferredTimeSlot;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  status: RequestStatus;
  internalNotes?: string;
  emailDeliveryStatus: EmailDeliveryStatus;
  emailDeliveryError?: string;
  confirmationEmailStatus: EmailDeliveryStatus;
  ipHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IServiceBookingDocument extends IServiceBooking, Document {
  _id: Types.ObjectId;
}

const serviceBookingSchema = new Schema<IServiceBookingDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    serviceCategory: {
      type: String,
      required: true,
      enum: ['wholesale-partnership', 'technology-consultation', 'security-consultation', 'other'],
      index: true,
    },
    serviceName: { type: String, maxlength: 120 },
    preferredDate: { type: Date, required: true },
    preferredTimeSlot: {
      type: String,
      enum: ['morning', 'afternoon', 'evening'],
      default: 'morning',
    },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, maxlength: 30 },
    notes: { type: String, maxlength: 2000 },
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

serviceBookingSchema.index({ createdAt: -1 });

export const ServiceBooking: Model<IServiceBookingDocument> =
  mongoose.models.ServiceBooking ||
  mongoose.model<IServiceBookingDocument>('ServiceBooking', serviceBookingSchema);
