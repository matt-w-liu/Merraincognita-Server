import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';
import type {
  BudgetRange,
  EmailDeliveryStatus,
  PreferredContactMethod,
  ProjectTimeline,
  RequestStatus,
  TechnologyServiceType,
} from '@merraincognita/shared';

export interface ITechnologyInquiry {
  user?: Types.ObjectId;
  serviceType: TechnologyServiceType;
  companyName?: string;
  projectDescription: string;
  budgetRange?: BudgetRange;
  timeline?: ProjectTimeline;
  name: string;
  email: string;
  phone?: string;
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

export interface ITechnologyInquiryDocument extends ITechnologyInquiry, Document {
  _id: Types.ObjectId;
}

const technologyInquirySchema = new Schema<ITechnologyInquiryDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    serviceType: {
      type: String,
      required: true,
      enum: [
        'software-engineering',
        'application-development',
        'systems-engineering',
        'cybersecurity',
        'security-engineering',
        'technical-consulting',
        'other',
      ],
      index: true,
    },
    companyName: { type: String, trim: true, maxlength: 120 },
    projectDescription: { type: String, required: true, trim: true, maxlength: 3000 },
    budgetRange: {
      type: String,
      enum: ['under-10k', '10k-50k', '50k-150k', '150k-plus', 'not-sure'],
    },
    timeline: {
      type: String,
      enum: ['immediately', '1-3-months', '3-6-months', '6-plus-months', 'not-sure'],
    },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, maxlength: 30 },
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

technologyInquirySchema.index({ createdAt: -1 });

export const TechnologyInquiry: Model<ITechnologyInquiryDocument> =
  mongoose.models.TechnologyInquiry ||
  mongoose.model<ITechnologyInquiryDocument>('TechnologyInquiry', technologyInquirySchema);
