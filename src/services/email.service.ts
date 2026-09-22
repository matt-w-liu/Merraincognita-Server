import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { env, isDevelopment, isTest } from '../config/env.js';
import { COMPANY } from '../config/constants.js';
import {
  contactConfirmationTemplate,
  contactNotificationTemplate,
  passwordResetTemplate,
  productInquiryConfirmationTemplate,
  productInquiryNotificationTemplate,
  productRequestConfirmationTemplate,
  productRequestNotificationTemplate,
  serviceBookingConfirmationTemplate,
  serviceBookingNotificationTemplate,
  technologyInquiryConfirmationTemplate,
  technologyInquiryNotificationTemplate,
} from './email.templates.js';
import {
  SERVICE_CATEGORY_LABELS,
  TECHNOLOGY_SERVICE_TYPE_LABELS,
  type BudgetRange,
  type ProjectTimeline,
  type ServiceCategory,
  type TechnologyServiceType,
} from '@merraincognita/shared';

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;

  if (env.SMTP_HOST && env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  } else {
    // Dev/test fallback — logs to console without sending
    transporter = nodemailer.createTransport({
      jsonTransport: true,
    });
  }

  return transporter;
}

function fromAddress(): string {
  const email = env.SMTP_FROM_EMAIL || env.CONTACT_TO_EMAIL;
  return `"${env.SMTP_FROM_NAME}" <${email}>`;
}

export interface SendResult {
  status: 'sent' | 'failed' | 'skipped';
  error?: string;
  messageId?: string;
}

async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}): Promise<SendResult> {
  if (isTest && !env.SMTP_HOST) {
    return { status: 'skipped' };
  }

  try {
    const info = await getTransporter().sendMail({
      from: fromAddress(),
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
    });

    if (isDevelopment && !env.SMTP_HOST) {
      console.info('[email:dev]', {
        to: options.to,
        subject: options.subject,
        preview: typeof info.message === 'string' ? info.message.slice(0, 200) : 'sent',
      });
    }

    return { status: 'sent', messageId: info.messageId };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Email delivery failed';
    console.error('[email] Delivery failed:', message);
    return { status: 'failed', error: message };
  }
}

// --- Contact ------------------------------------------------------------------

export async function sendContactNotification(msg: {
  name: string;
  email: string;
  phone?: string;
  reason: string;
  subject: string;
  message: string;
}): Promise<SendResult> {
  const { html, text } = contactNotificationTemplate(msg);
  return sendMail({
    to: env.CONTACT_TO_EMAIL,
    subject: `[MERRAINCOGNITA] New contact message: ${msg.subject}`,
    html,
    text,
    replyTo: msg.email,
  });
}

export async function sendContactConfirmation(msg: {
  name: string;
  email: string;
  subject: string;
}): Promise<SendResult> {
  const { html, text } = contactConfirmationTemplate(msg);
  return sendMail({
    to: msg.email,
    subject: 'We received your message — MERRAINCOGNITA LLC',
    html,
    text,
  });
}

// --- Product inquiry ------------------------------------------------------------

export async function sendProductInquiryNotification(inquiry: {
  productName: string;
  name: string;
  email: string;
  phone?: string;
  preferredContactMethod: string;
  message: string;
}): Promise<SendResult> {
  const { html, text } = productInquiryNotificationTemplate(inquiry);
  return sendMail({
    to: env.CONTACT_TO_EMAIL,
    subject: `[MERRAINCOGNITA] New product enquiry: ${inquiry.productName}`,
    html,
    text,
    replyTo: inquiry.email,
  });
}

export async function sendProductInquiryConfirmation(inquiry: {
  productName: string;
  name: string;
  email: string;
}): Promise<SendResult> {
  const { html, text } = productInquiryConfirmationTemplate(inquiry);
  return sendMail({
    to: inquiry.email,
    subject: 'We received your product enquiry — MERRAINCOGNITA LLC',
    html,
    text,
  });
}

// --- Consultation booking ---------------------------------------------------------

export async function sendServiceBookingNotification(req: {
  serviceCategory: ServiceCategory;
  serviceName?: string;
  name: string;
  email: string;
  phone?: string;
  preferredDate: string;
  preferredTimeSlot: string;
  notes?: string;
}): Promise<SendResult> {
  const { html, text } = serviceBookingNotificationTemplate(req);
  return sendMail({
    to: env.CONTACT_TO_EMAIL,
    subject: `[MERRAINCOGNITA] New service booking request: ${req.serviceName || SERVICE_CATEGORY_LABELS[req.serviceCategory]}`,
    html,
    text,
    replyTo: req.email,
  });
}

export async function sendServiceBookingConfirmation(req: {
  name: string;
  email: string;
  serviceCategory: ServiceCategory;
}): Promise<SendResult> {
  const { html, text } = serviceBookingConfirmationTemplate(req);
  return sendMail({
    to: req.email,
    subject: 'We received your booking request — MERRAINCOGNITA LLC',
    html,
    text,
  });
}

// --- Product request ---------------------------------------------------------------

export async function sendProductRequestNotification(req: {
  desiredBrand: string;
  desiredProduct?: string;
  name: string;
  email: string;
  phone?: string;
  budgetRange?: string;
  requirements?: string;
}): Promise<SendResult> {
  const { html, text } = productRequestNotificationTemplate(req);
  return sendMail({
    to: env.CONTACT_TO_EMAIL,
    subject: `[MERRAINCOGNITA] New product request: ${req.desiredBrand} ${req.desiredProduct ?? ''}`.trim(),
    html,
    text,
    replyTo: req.email,
  });
}

export async function sendProductRequestConfirmation(req: {
  name: string;
  email: string;
}): Promise<SendResult> {
  const { html, text } = productRequestConfirmationTemplate(req);
  return sendMail({
    to: req.email,
    subject: 'We received your product request — MERRAINCOGNITA LLC',
    html,
    text,
  });
}

// --- Technology services enquiry -----------------------------------------------

export async function sendTechnologyInquiryNotification(req: {
  serviceType: TechnologyServiceType;
  companyName?: string;
  projectDescription: string;
  budgetRange?: BudgetRange;
  timeline?: ProjectTimeline;
  name: string;
  email: string;
  phone?: string;
}): Promise<SendResult> {
  const { html, text } = technologyInquiryNotificationTemplate(req);
  return sendMail({
    to: env.CONTACT_TO_EMAIL,
    subject: `[MERRAINCOGNITA] New technology enquiry: ${TECHNOLOGY_SERVICE_TYPE_LABELS[req.serviceType]}`,
    html,
    text,
    replyTo: req.email,
  });
}

export async function sendTechnologyInquiryConfirmation(req: {
  name: string;
  email: string;
  serviceType: TechnologyServiceType;
}): Promise<SendResult> {
  const { html, text } = technologyInquiryConfirmationTemplate(req);
  return sendMail({
    to: req.email,
    subject: 'We received your enquiry — MERRAINCOGNITA LLC',
    html,
    text,
  });
}

// --- Auth ---------------------------------------------------------------------------

export async function sendPasswordResetEmail(params: {
  name: string;
  email: string;
  resetUrl: string;
}): Promise<SendResult> {
  const { html, text } = passwordResetTemplate(params);
  return sendMail({
    to: params.email,
    subject: 'Reset your MERRAINCOGNITA account password',
    html,
    text,
  });
}

export function getCompanyEmailFooter(): string {
  const { street, city, region, postalCode, country } = COMPANY.address;
  return `${COMPANY.name} · ${street}, ${city}, ${region} ${postalCode}, ${country}`;
}
