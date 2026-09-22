import { z } from 'zod';

export const userRoles = ['user', 'admin'] as const;
export type UserRole = (typeof userRoles)[number];

export const userStatuses = ['active', 'disabled'] as const;
export type UserStatus = (typeof userStatuses)[number];

// --- Product enums ---------------------------------------------------------

export const productCategories = ['mens-apparel', 'womens-apparel', 'footwear', 'accessories'] as const;
export type ProductCategory = (typeof productCategories)[number];

export const stockStatuses = ['in-stock', 'low-stock', 'out-of-stock', 'discontinued'] as const;
export type StockStatus = (typeof stockStatuses)[number];

// --- Enquiry / request enums ------------------------------------------------

export const requestStatuses = ['new', 'in-progress', 'resolved', 'archived'] as const;
export type RequestStatus = (typeof requestStatuses)[number];

export const contactReasons = [
  'wholesale',
  'consultation',
  'technology',
  'general',
  'support',
  'other',
] as const;
export type ContactReason = (typeof contactReasons)[number];

export const preferredContactMethods = ['email', 'phone', 'either'] as const;
export type PreferredContactMethod = (typeof preferredContactMethods)[number];

export const serviceCategories = [
  'wholesale-partnership',
  'technology-consultation',
  'security-consultation',
  'other',
] as const;
export type ServiceCategory = (typeof serviceCategories)[number];

export const preferredTimeSlots = ['morning', 'afternoon', 'evening'] as const;
export type PreferredTimeSlot = (typeof preferredTimeSlots)[number];

export const emailDeliveryStatuses = ['pending', 'sent', 'failed', 'skipped'] as const;
export type EmailDeliveryStatus = (typeof emailDeliveryStatuses)[number];

// --- Labels ------------------------------------------------------------------

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  'mens-apparel': "Men's Apparel",
  'womens-apparel': "Women's Apparel",
  footwear: 'Footwear',
  accessories: 'Accessories',
};

export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  'in-stock': 'In stock',
  'low-stock': 'Low stock',
  'out-of-stock': 'Out of stock',
  discontinued: 'Discontinued',
};

export const CONTACT_REASON_LABELS: Record<ContactReason, string> = {
  wholesale: 'Wholesale inquiry',
  consultation: 'Consultation booking',
  technology: 'Technology services inquiry',
  general: 'General inquiry',
  support: 'Customer support',
  other: 'Other',
};

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  'wholesale-partnership': 'Wholesale partnership consultation',
  'technology-consultation': 'Technology consultation',
  'security-consultation': 'Security consultation',
  other: 'Other',
};

export const PREFERRED_TIME_SLOT_LABELS: Record<PreferredTimeSlot, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
};

// --- Auth schemas ------------------------------------------------------------

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[A-Z]/, 'Password must include an uppercase letter')
  .regex(/[a-z]/, 'Password must include a lowercase letter')
  .regex(/[0-9]/, 'Password must include a number');

const phoneSchema = z
  .string()
  .trim()
  .max(30)
  .optional()
  .or(z.literal(''))
  .transform((v) => (v === '' ? undefined : v));

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().trim().email('Enter a valid email').max(254).toLowerCase(),
    phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the terms of use' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email').max(254).toLowerCase(),
  password: z.string().min(1, 'Password is required').max(128),
  rememberMe: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Enter a valid email').max(254).toLowerCase(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  phone: phoneSchema,
});

// --- Contact schema ------------------------------------------------------------

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Enter a valid email').max(254).toLowerCase(),
  phone: phoneSchema,
  reason: z.enum(contactReasons),
  subject: z.string().trim().min(3, 'Subject must be at least 3 characters').max(200),
  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must be at most 5000 characters'),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Consent is required to submit this form' }),
  }),
  // Honeypot — must be empty
  website: z.string().max(0).optional().or(z.literal('')),
});

export const contactAdminUpdateSchema = z.object({
  status: z.enum(requestStatuses).optional(),
  internalNotes: z.string().max(5000).optional(),
});

// --- Product schemas ------------------------------------------------------------

export const productImageSchema = z.object({
  url: z.string().min(1).max(500),
  alt: z.string().min(1).max(200),
  sortOrder: z.number().int().min(0).optional(),
});

export const productCreateSchema = z.object({
  name: z.string().trim().min(2).max(180),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase kebab-case')
    .optional(),
  sku: z.string().trim().max(50).optional(),
  brand: z.string().trim().min(1).max(60),
  category: z.enum(productCategories),
  subcategory: z.string().trim().max(80).optional(),
  price: z.number().positive(),
  currency: z.string().trim().length(3).default('USD'),
  size: z.string().trim().max(60).optional(),
  description: z.string().trim().min(20).max(10000),
  highlights: z.array(z.string().trim().min(1).max(120)).max(40).default([]),
  images: z.array(productImageSchema).max(30).default([]),
  stockStatus: z.enum(stockStatuses).default('in-stock'),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  archived: z.boolean().default(false),
  seoTitle: z.string().trim().max(70).optional(),
  seoDescription: z.string().trim().max(160).optional(),
});

export const productUpdateSchema = productCreateSchema.partial();

export const productListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
  search: z.string().trim().max(200).optional(),
  brand: z.string().trim().max(60).optional(),
  category: z.enum(productCategories).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  stockStatus: z.enum(stockStatuses).optional(),
  featured: z.coerce.boolean().optional(),
  sort: z.enum(['newest', 'price-asc', 'price-desc', 'name-asc']).optional(),
});

// --- Product inquiry (question about a specific product) -----------------------

export const productInquirySchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email('Enter a valid email').max(254).toLowerCase(),
  phone: phoneSchema,
  message: z.string().trim().min(10).max(3000),
  preferredContactMethod: z.enum(preferredContactMethods).default('email'),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Consent is required to submit this form' }),
  }),
  website: z.string().max(0).optional().or(z.literal('')),
});

// --- Consultation booking request -------------------------------------------------

export const serviceBookingSchema = z.object({
  serviceCategory: z.enum(serviceCategories),
  serviceName: z.string().trim().max(120).optional(),
  preferredDate: z.coerce.date(),
  preferredTimeSlot: z.enum(preferredTimeSlots).default('morning'),
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email('Enter a valid email').max(254).toLowerCase(),
  phone: phoneSchema,
  notes: z.string().trim().max(2000).optional(),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Consent is required to submit this form' }),
  }),
  website: z.string().max(0).optional().or(z.literal('')),
});

// --- Wholesale sourcing request (can't find what you're looking for) -----------------

export const productRequestSchema = z.object({
  desiredBrand: z.string().trim().min(1).max(60),
  desiredProduct: z.string().trim().max(120).optional(),
  category: z.enum(productCategories).optional(),
  budgetMin: z.number().nonnegative().optional(),
  budgetMax: z.number().nonnegative().optional(),
  requirements: z.string().trim().max(3000).optional(),
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email('Enter a valid email').max(254).toLowerCase(),
  phone: phoneSchema,
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Consent is required to submit this form' }),
  }),
  website: z.string().max(0).optional().or(z.literal('')),
});

// --- Technology services enquiry -------------------------------------------------

export const technologyServiceTypes = [
  'software-engineering',
  'application-development',
  'systems-engineering',
  'cybersecurity',
  'security-engineering',
  'technical-consulting',
  'other',
] as const;
export type TechnologyServiceType = (typeof technologyServiceTypes)[number];

export const budgetRanges = ['under-10k', '10k-50k', '50k-150k', '150k-plus', 'not-sure'] as const;
export type BudgetRange = (typeof budgetRanges)[number];

export const projectTimelines = [
  'immediately',
  '1-3-months',
  '3-6-months',
  '6-plus-months',
  'not-sure',
] as const;
export type ProjectTimeline = (typeof projectTimelines)[number];

export const technologyInquirySchema = z.object({
  serviceType: z.enum(technologyServiceTypes),
  companyName: z.string().trim().max(120).optional(),
  projectDescription: z.string().trim().min(10).max(3000),
  budgetRange: z.enum(budgetRanges).optional(),
  timeline: z.enum(projectTimelines).optional(),
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email('Enter a valid email').max(254).toLowerCase(),
  phone: phoneSchema,
  preferredContactMethod: z.enum(preferredContactMethods).default('email'),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Consent is required to submit this form' }),
  }),
  website: z.string().max(0).optional().or(z.literal('')),
});

export const TECHNOLOGY_SERVICE_TYPE_LABELS: Record<TechnologyServiceType, string> = {
  'software-engineering': 'Software Engineering',
  'application-development': 'Application Development',
  'systems-engineering': 'Systems Engineering',
  cybersecurity: 'Cybersecurity',
  'security-engineering': 'Security Engineering',
  'technical-consulting': 'Technical Consulting',
  other: 'Other',
};

export const BUDGET_RANGE_LABELS: Record<BudgetRange, string> = {
  'under-10k': 'Under $10k',
  '10k-50k': '$10k – $50k',
  '50k-150k': '$50k – $150k',
  '150k-plus': '$150k+',
  'not-sure': 'Not sure yet',
};

export const PROJECT_TIMELINE_LABELS: Record<ProjectTimeline, string> = {
  immediately: 'Immediately',
  '1-3-months': '1–3 months',
  '3-6-months': '3–6 months',
  '6-plus-months': '6+ months',
  'not-sure': 'Not sure yet',
};

// --- Shared admin update schema for request-style collections -------------------

export const requestAdminUpdateSchema = z.object({
  status: z.enum(requestStatuses).optional(),
  internalNotes: z.string().max(5000).optional(),
});

export const adminUserStatusSchema = z.object({
  status: z.enum(userStatuses),
});

export const adminUserRoleSchema = z.object({
  role: z.enum(userRoles),
});

// --- Inferred types --------------------------------------------------------------

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
export type ProductListQuery = z.infer<typeof productListQuerySchema>;
export type ProductInquiryInput = z.infer<typeof productInquirySchema>;
export type ServiceBookingInput = z.infer<typeof serviceBookingSchema>;
export type ProductRequestInput = z.infer<typeof productRequestSchema>;
export type TechnologyInquiryInput = z.infer<typeof technologyInquirySchema>;

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  code?: string;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;
