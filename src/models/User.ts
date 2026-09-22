import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';
import type { UserRole, UserStatus } from '@merraincognita/shared';

export interface IRefreshToken {
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  userAgent?: string;
}

export interface IUser {
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  savedProducts: Types.ObjectId[];
  lastLoginAt?: Date;
  failedLoginAttempts: number;
  lockedUntil?: Date;
  passwordChangedAt?: Date;
  refreshTokens: IRefreshToken[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
    userAgent: { type: String },
  },
  { _id: false },
);

const userSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      index: true,
    },
    phone: { type: String, maxlength: 30 },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
    status: { type: String, enum: ['active', 'disabled'], default: 'active', index: true },
    emailVerified: { type: Boolean, default: false },
    savedProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    lastLoginAt: { type: Date },
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date },
    passwordChangedAt: { type: Date },
    refreshTokens: { type: [refreshTokenSchema], default: [], select: false },
  },
  { timestamps: true },
);

userSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.refreshTokens;
  delete obj.__v;
  return obj;
};

export const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', userSchema);
