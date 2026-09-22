import { getCompanyEmailFooter } from './email.service.js';
import {
  BUDGET_RANGE_LABELS,
  PROJECT_TIMELINE_LABELS,
  SERVICE_CATEGORY_LABELS,
  TECHNOLOGY_SERVICE_TYPE_LABELS,
  type BudgetRange,
  type ProjectTimeline,
  type ServiceCategory,
  type TechnologyServiceType,
} from '@merraincognita/shared';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function wrapLayout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f2faf8;font-family:Segoe UI,Arial,sans-serif;color:#073b3a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f2faf8;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #cfe4df;">
          <tr>
            <td style="background:#073b3a;padding:20px 28px;">
              <p style="margin:0;font-size:17px;font-weight:700;color:#ffffff;letter-spacing:0.04em;">MERRAINCOGNITA</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 24px;border-top:1px solid #cfe4df;font-size:12px;color:#4c6864;line-height:1.5;">
              ${escapeHtml(getCompanyEmailFooter())}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function detailRows(rows: [string, string][]): string {
  return rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 0;font-weight:600;width:140px;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:6px 0;">${escapeHtml(value)}</td></tr>`,
    )
    .join('');
}

// --- Contact ------------------------------------------------------------------

export function contactNotificationTemplate(msg: {
  name: string;
  email: string;
  phone?: string;
  reason: string;
  subject: string;
  message: string;
}): { html: string; text: string } {
  const rows = detailRows([
    ['Name', msg.name],
    ['Email', msg.email],
    ['Phone', msg.phone || '—'],
    ['Reason', msg.reason],
    ['Subject', msg.subject],
  ]);

  const html = wrapLayout(
    'New contact message',
    `<h1 style="margin:0 0 16px;font-size:22px;">New contact message</h1>
    <table role="presentation" width="100%" style="font-size:14px;border-collapse:collapse;">${rows}</table>
    <p style="margin:20px 0 8px;font-weight:600;">Message</p>
    <p style="margin:0;white-space:pre-wrap;line-height:1.6;background:#f2faf8;padding:14px;border-radius:8px;">${escapeHtml(msg.message)}</p>
    <p style="margin:20px 0 0;font-size:13px;color:#4c6864;">Reply directly to this email to respond to the visitor.</p>`,
  );

  const text = [
    'New contact message — MERRAINCOGNITA LLC',
    `Name: ${msg.name}`,
    `Email: ${msg.email}`,
    `Phone: ${msg.phone || '—'}`,
    `Reason: ${msg.reason}`,
    `Subject: ${msg.subject}`,
    '',
    'Message:',
    msg.message,
  ].join('\n');

  return { html, text };
}

export function contactConfirmationTemplate(msg: {
  name: string;
  email: string;
  subject: string;
}): { html: string; text: string } {
  const html = wrapLayout(
    'Message received',
    `<h1 style="margin:0 0 16px;font-size:22px;">Thank you, ${escapeHtml(msg.name)}</h1>
    <p style="margin:0 0 12px;line-height:1.6;">We received your message regarding <strong>${escapeHtml(msg.subject)}</strong>.</p>
    <p style="margin:0 0 12px;line-height:1.6;">A member of the MERRAINCOGNITA team will review your message and respond as soon as possible.</p>
    <p style="margin:0;line-height:1.6;">If you need to add details, simply reply to this email.</p>`,
  );

  const text = [
    `Thank you, ${msg.name}`,
    '',
    `We received your message regarding "${msg.subject}".`,
    'A member of the MERRAINCOGNITA team will review your message and respond as soon as possible.',
  ].join('\n');

  return { html, text };
}

// --- Product inquiry ------------------------------------------------------------

export function productInquiryNotificationTemplate(inquiry: {
  productName: string;
  name: string;
  email: string;
  phone?: string;
  preferredContactMethod: string;
  message: string;
}): { html: string; text: string } {
  const rows = detailRows([
    ['Product', inquiry.productName],
    ['Name', inquiry.name],
    ['Email', inquiry.email],
    ['Phone', inquiry.phone || '—'],
    ['Preferred contact', inquiry.preferredContactMethod],
  ]);

  const html = wrapLayout(
    'New product enquiry',
    `<h1 style="margin:0 0 16px;font-size:22px;">New product enquiry</h1>
    <table role="presentation" width="100%" style="font-size:14px;border-collapse:collapse;">${rows}</table>
    <p style="margin:20px 0 8px;font-weight:600;">Message</p>
    <p style="margin:0;white-space:pre-wrap;line-height:1.6;background:#f2faf8;padding:14px;border-radius:8px;">${escapeHtml(inquiry.message)}</p>`,
  );

  const text = [
    'New product enquiry — MERRAINCOGNITA LLC',
    `Product: ${inquiry.productName}`,
    `Name: ${inquiry.name}`,
    `Email: ${inquiry.email}`,
    `Phone: ${inquiry.phone || '—'}`,
    `Preferred contact: ${inquiry.preferredContactMethod}`,
    '',
    'Message:',
    inquiry.message,
  ].join('\n');

  return { html, text };
}

export function productInquiryConfirmationTemplate(inquiry: {
  productName: string;
  name: string;
}): { html: string; text: string } {
  const html = wrapLayout(
    'Enquiry received',
    `<h1 style="margin:0 0 16px;font-size:22px;">Thank you, ${escapeHtml(inquiry.name)}</h1>
    <p style="margin:0 0 12px;line-height:1.6;">We received your enquiry about <strong>${escapeHtml(inquiry.productName)}</strong>. This confirms your enquiry was received — it is not an order confirmation.</p>
    <p style="margin:0;line-height:1.6;">A member of the MERRAINCOGNITA team will be in touch soon.</p>`,
  );

  const text = [
    `Thank you, ${inquiry.name}`,
    '',
    `We received your enquiry about "${inquiry.productName}". This confirms your enquiry was received — it is not an order confirmation.`,
    'A member of the MERRAINCOGNITA team will be in touch soon.',
  ].join('\n');

  return { html, text };
}

// --- Consultation booking ---------------------------------------------------------

export function serviceBookingNotificationTemplate(req: {
  serviceCategory: ServiceCategory;
  serviceName?: string;
  name: string;
  email: string;
  phone?: string;
  preferredDate: string;
  preferredTimeSlot: string;
  notes?: string;
}): { html: string; text: string } {
  const rows = detailRows([
    ['Service', req.serviceName || SERVICE_CATEGORY_LABELS[req.serviceCategory]],
    ['Name', req.name],
    ['Email', req.email],
    ['Phone', req.phone || '—'],
    ['Preferred date', req.preferredDate],
    ['Preferred time', req.preferredTimeSlot],
  ]);

  const html = wrapLayout(
    'New service booking request',
    `<h1 style="margin:0 0 16px;font-size:22px;">New service booking request</h1>
    <table role="presentation" width="100%" style="font-size:14px;border-collapse:collapse;">${rows}</table>
    ${req.notes ? `<p style="margin:20px 0 8px;font-weight:600;">Notes</p><p style="margin:0;white-space:pre-wrap;line-height:1.6;background:#f2faf8;padding:14px;border-radius:8px;">${escapeHtml(req.notes)}</p>` : ''}`,
  );

  const text = [
    'New service booking request — MERRAINCOGNITA LLC',
    `Service: ${req.serviceName || SERVICE_CATEGORY_LABELS[req.serviceCategory]}`,
    `Name: ${req.name}`,
    `Email: ${req.email}`,
    `Phone: ${req.phone || '—'}`,
    `Preferred date: ${req.preferredDate}`,
    `Preferred time: ${req.preferredTimeSlot}`,
    req.notes ? `\nNotes:\n${req.notes}` : '',
  ].join('\n');

  return { html, text };
}

export function serviceBookingConfirmationTemplate(req: {
  name: string;
  serviceCategory: ServiceCategory;
}): { html: string; text: string } {
  const html = wrapLayout(
    'Booking request received',
    `<h1 style="margin:0 0 16px;font-size:22px;">Thank you, ${escapeHtml(req.name)}</h1>
    <p style="margin:0 0 12px;line-height:1.6;">We received your request for a <strong>${escapeHtml(SERVICE_CATEGORY_LABELS[req.serviceCategory])}</strong>. This confirms your request was submitted — it does not confirm a booked appointment.</p>
    <p style="margin:0;line-height:1.6;">A member of the MERRAINCOGNITA team will contact you to confirm availability and next steps.</p>`,
  );

  const text = [
    `Thank you, ${req.name}`,
    '',
    `We received your request for a ${SERVICE_CATEGORY_LABELS[req.serviceCategory]}. This confirms your request was submitted — it does not confirm a booked appointment.`,
    'A member of the MERRAINCOGNITA team will contact you to confirm availability and next steps.',
  ].join('\n');

  return { html, text };
}

// --- Product request ---------------------------------------------------------------

export function productRequestNotificationTemplate(req: {
  desiredBrand: string;
  desiredProduct?: string;
  name: string;
  email: string;
  phone?: string;
  budgetRange?: string;
  requirements?: string;
}): { html: string; text: string } {
  const rows = detailRows([
    ['Desired brand', req.desiredBrand],
    ['Desired product', req.desiredProduct || '—'],
    ['Name', req.name],
    ['Email', req.email],
    ['Phone', req.phone || '—'],
    ['Budget', req.budgetRange || '—'],
  ]);

  const html = wrapLayout(
    'New product request',
    `<h1 style="margin:0 0 16px;font-size:22px;">New product request</h1>
    <table role="presentation" width="100%" style="font-size:14px;border-collapse:collapse;">${rows}</table>
    ${req.requirements ? `<p style="margin:20px 0 8px;font-weight:600;">Additional requirements</p><p style="margin:0;white-space:pre-wrap;line-height:1.6;background:#f2faf8;padding:14px;border-radius:8px;">${escapeHtml(req.requirements)}</p>` : ''}`,
  );

  const text = [
    'New product request — MERRAINCOGNITA LLC',
    `Desired brand: ${req.desiredBrand}`,
    `Desired product: ${req.desiredProduct || '—'}`,
    `Name: ${req.name}`,
    `Email: ${req.email}`,
    `Phone: ${req.phone || '—'}`,
    `Budget: ${req.budgetRange || '—'}`,
    req.requirements ? `\nAdditional requirements:\n${req.requirements}` : '',
  ].join('\n');

  return { html, text };
}

export function productRequestConfirmationTemplate(req: {
  name: string;
}): { html: string; text: string } {
  const html = wrapLayout(
    'Product request received',
    `<h1 style="margin:0 0 16px;font-size:22px;">Thank you, ${escapeHtml(req.name)}</h1>
    <p style="margin:0 0 12px;line-height:1.6;">We received your product request. This confirms your request was submitted — it does not guarantee that a matching product will be found.</p>
    <p style="margin:0;line-height:1.6;">A member of the MERRAINCOGNITA team will be in touch as suitable products become available.</p>`,
  );

  const text = [
    `Thank you, ${req.name}`,
    '',
    'We received your product request. This confirms your request was submitted — it does not guarantee that a matching product will be found.',
    'A member of the MERRAINCOGNITA team will be in touch as suitable products become available.',
  ].join('\n');

  return { html, text };
}

// --- Technology services enquiry -----------------------------------------------

export function technologyInquiryNotificationTemplate(req: {
  serviceType: TechnologyServiceType;
  companyName?: string;
  projectDescription: string;
  budgetRange?: BudgetRange;
  timeline?: ProjectTimeline;
  name: string;
  email: string;
  phone?: string;
}): { html: string; text: string } {
  const rows = detailRows([
    ['Service', TECHNOLOGY_SERVICE_TYPE_LABELS[req.serviceType]],
    ['Company', req.companyName || '—'],
    ['Name', req.name],
    ['Email', req.email],
    ['Phone', req.phone || '—'],
    ['Budget', req.budgetRange ? BUDGET_RANGE_LABELS[req.budgetRange] : '—'],
    ['Timeline', req.timeline ? PROJECT_TIMELINE_LABELS[req.timeline] : '—'],
  ]);

  const html = wrapLayout(
    'New technology enquiry',
    `<h1 style="margin:0 0 16px;font-size:22px;">New technology services enquiry</h1>
    <table role="presentation" width="100%" style="font-size:14px;border-collapse:collapse;">${rows}</table>
    <p style="margin:20px 0 8px;font-weight:600;">Project description</p><p style="margin:0;white-space:pre-wrap;line-height:1.6;background:#f2faf8;padding:14px;border-radius:8px;">${escapeHtml(req.projectDescription)}</p>`,
  );

  const text = [
    'New technology services enquiry — MERRAINCOGNITA LLC',
    `Service: ${TECHNOLOGY_SERVICE_TYPE_LABELS[req.serviceType]}`,
    `Company: ${req.companyName || '—'}`,
    `Name: ${req.name}`,
    `Email: ${req.email}`,
    `Phone: ${req.phone || '—'}`,
    `Budget: ${req.budgetRange ? BUDGET_RANGE_LABELS[req.budgetRange] : '—'}`,
    `Timeline: ${req.timeline ? PROJECT_TIMELINE_LABELS[req.timeline] : '—'}`,
    '',
    'Project description:',
    req.projectDescription,
  ].join('\n');

  return { html, text };
}

export function technologyInquiryConfirmationTemplate(req: {
  name: string;
  serviceType: TechnologyServiceType;
}): { html: string; text: string } {
  const html = wrapLayout(
    'Enquiry received',
    `<h1 style="margin:0 0 16px;font-size:22px;">Thank you, ${escapeHtml(req.name)}</h1>
    <p style="margin:0 0 12px;line-height:1.6;">We received your enquiry about ${escapeHtml(TECHNOLOGY_SERVICE_TYPE_LABELS[req.serviceType])}. This confirms your enquiry was submitted.</p>
    <p style="margin:0;line-height:1.6;">A member of the MERRAINCOGNITA technology team will be in touch to discuss your project.</p>`,
  );

  const text = [
    `Thank you, ${req.name}`,
    '',
    `We received your enquiry about ${TECHNOLOGY_SERVICE_TYPE_LABELS[req.serviceType]}. This confirms your enquiry was submitted.`,
    'A member of the MERRAINCOGNITA technology team will be in touch to discuss your project.',
  ].join('\n');

  return { html, text };
}

// --- Auth ---------------------------------------------------------------------------

export function passwordResetTemplate(params: {
  name: string;
  email: string;
  resetUrl: string;
}): { html: string; text: string } {
  const html = wrapLayout(
    'Password reset',
    `<h1 style="margin:0 0 16px;font-size:22px;">Reset your password</h1>
    <p style="margin:0 0 12px;line-height:1.6;">Hello ${escapeHtml(params.name)},</p>
    <p style="margin:0 0 20px;line-height:1.6;">We received a request to reset the password for your MERRAINCOGNITA account. This link expires in one hour and can be used only once.</p>
    <p style="margin:0 0 24px;"><a href="${escapeHtml(params.resetUrl)}" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;">Reset password</a></p>
    <p style="margin:0;font-size:13px;color:#4c6864;line-height:1.5;">If you did not request this change, you can ignore this email. Your password will remain unchanged.</p>`,
  );

  const text = [
    `Hello ${params.name},`,
    '',
    'We received a request to reset the password for your MERRAINCOGNITA account.',
    `Reset link (expires in one hour): ${params.resetUrl}`,
    '',
    'If you did not request this change, ignore this email.',
  ].join('\n');

  return { html, text };
}
