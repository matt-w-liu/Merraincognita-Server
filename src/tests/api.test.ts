import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { createApp } from '../app.js';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { ContactMessage } from '../models/ContactMessage.js';
import { ServiceBooking } from '../models/ServiceBooking.js';
import { ProductRequest } from '../models/ProductRequest.js';
import { TechnologyInquiry } from '../models/TechnologyInquiry.js';
import { hashPassword } from '../services/token.service.js';
import type { Express } from 'express';

let app: Express;
let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  app = createApp();
}, 60_000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

beforeEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    ContactMessage.deleteMany({}),
    ServiceBooking.deleteMany({}),
    ProductRequest.deleteMany({}),
    TechnologyInquiry.deleteMany({}),
  ]);
});

function sampleProduct(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    name: 'Sample Test Product',
    slug: 'sample-test-product',
    sku: 'TEST-MA-001',
    brand: 'Test Brand Co.',
    category: 'mens-apparel',
    subcategory: 'T-Shirts',
    price: 24.99,
    currency: 'USD',
    size: 'S–XL',
    description:
      'This is a SAMPLE PRODUCT used only in automated tests. It meets the minimum description length requirement.',
    highlights: ['Test highlight one', 'Test highlight two'],
    images: [{ url: '/images/products/test.jpg', alt: 'Test product', sortOrder: 0 }],
    stockStatus: 'in-stock',
    featured: true,
    published: true,
    archived: false,
    isSample: true,
    ...overrides,
  };
}

describe('Health', () => {
  it('returns health ok', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Auth', () => {
  it('registers a user', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password1',
      confirmPassword: 'Password1',
      acceptTerms: true,
    });
    expect(res.status).toBe(201);
    expect(res.body.data.user.email).toBe('test@example.com');
    expect(res.body.data.user.role).toBe('user');
    expect(res.body.data.accessToken).toBeTruthy();
    expect(res.body.data.refreshToken).toBeTruthy();
  });

  it('logs in with valid credentials', async () => {
    await User.create({
      name: 'Test User',
      email: 'login@example.com',
      passwordHash: await hashPassword('Password1'),
      role: 'user',
      status: 'active',
    });

    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'login@example.com',
      password: 'Password1',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('login@example.com');
  });

  it('rejects invalid login', async () => {
    await User.create({
      name: 'Test User',
      email: 'bad@example.com',
      passwordHash: await hashPassword('Password1'),
      role: 'user',
      status: 'active',
    });

    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'bad@example.com',
      password: 'WrongPass1',
    });
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid/i);
  });

  it('protects /auth/me', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('allows authenticated /auth/me', async () => {
    const register = await request(app).post('/api/v1/auth/register').send({
      name: 'Auth User',
      email: 'me@example.com',
      password: 'Password1',
      confirmPassword: 'Password1',
      acceptTerms: true,
    });
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${register.body.data.accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('me@example.com');
  });
});

describe('Admin authorization', () => {
  it('blocks non-admin from admin routes', async () => {
    const register = await request(app).post('/api/v1/auth/register').send({
      name: 'Regular',
      email: 'user@example.com',
      password: 'Password1',
      confirmPassword: 'Password1',
      acceptTerms: true,
    });
    const res = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${register.body.data.accessToken}`);
    expect(res.status).toBe(403);
  });

  it('allows admin access', async () => {
    await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      passwordHash: await hashPassword('Password1'),
      role: 'admin',
      status: 'active',
    });
    const login = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@example.com',
      password: 'Password1',
    });
    const res = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${login.body.data.accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.products).toBeDefined();
    expect(res.body.data.users).toBeDefined();
    expect(res.body.data.contact).toBeDefined();
    expect(res.body.data.productInquiries).toBeDefined();
    expect(res.body.data.serviceBookings).toBeDefined();
    expect(res.body.data.productRequests).toBeDefined();
    expect(res.body.data.technologyInquiries).toBeDefined();
  });
});

describe('Products', () => {
  it('lists published products', async () => {
    await Product.create(sampleProduct());

    const res = await request(app).get('/api/v1/products');
    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBe(1);
    expect(res.body.data.items[0].slug).toBe('sample-test-product');
  });

  it('filters by category', async () => {
    await Product.create(sampleProduct());
    await Product.create(
      sampleProduct({ slug: 'other-category-product', category: 'footwear', brand: 'Other Brand' }),
    );

    const res = await request(app).get('/api/v1/products?category=mens-apparel');
    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBe(1);
    expect(res.body.data.items[0].category).toBe('mens-apparel');
  });

  it('returns 404 for unknown slug', async () => {
    const res = await request(app).get('/api/v1/products/does-not-exist');
    expect(res.status).toBe(404);
  });

  it('blocks product creation for anonymous users', async () => {
    const res = await request(app).post('/api/v1/admin/products').send(sampleProduct());
    expect(res.status).toBe(401);
  });

  it('rejects invalid MongoDB IDs on admin update', async () => {
    await User.create({
      name: 'Admin',
      email: 'admin2@example.com',
      passwordHash: await hashPassword('Password1'),
      role: 'admin',
      status: 'active',
    });
    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin2@example.com', password: 'Password1' });
    const res = await request(app)
      .patch('/api/v1/admin/products/not-a-valid-id')
      .set('Authorization', `Bearer ${login.body.data.accessToken}`)
      .send({ name: 'Updated Product Name' });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});

describe('Contact', () => {
  it('accepts a valid contact submission', async () => {
    const res = await request(app).post('/api/v1/contact').send({
      name: 'Visitor Name',
      email: 'visitor@example.com',
      reason: 'general',
      subject: 'Hello from tests',
      message: 'This is a valid contact message for automated testing.',
      consent: true,
      website: '',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const saved = await ContactMessage.findOne({ email: 'visitor@example.com' });
    expect(saved).toBeTruthy();
    expect(saved?.subject).toBe('Hello from tests');
  });

  it('rejects invalid contact submission', async () => {
    const res = await request(app).post('/api/v1/contact').send({
      name: 'A',
      email: 'not-an-email',
      reason: 'general',
      subject: 'Hi',
      message: 'Short',
      consent: false,
    });
    expect(res.status).toBe(400);
  });
});

describe('Service bookings', () => {
  it('accepts a valid service booking request', async () => {
    const res = await request(app)
      .post('/api/v1/service-bookings')
      .send({
        serviceCategory: 'wholesale-partnership',
        serviceName: 'Wholesale partnership discussion',
        preferredDate: '2026-10-01',
        preferredTimeSlot: 'morning',
        name: 'Booking Visitor',
        email: 'booking.visitor@example.com',
        consent: true,
        website: '',
      });
    expect(res.status).toBe(201);
  });

  it('rejects a service booking without a preferred date', async () => {
    const res = await request(app)
      .post('/api/v1/service-bookings')
      .send({
        serviceCategory: 'technology-consultation',
        name: 'Booking Visitor',
        email: 'booking.visitor@example.com',
        consent: true,
        website: '',
      });
    expect(res.status).toBe(400);
  });
});

describe('Product requests', () => {
  it('accepts a valid product request', async () => {
    const res = await request(app).post('/api/v1/product-requests').send({
      desiredBrand: 'Meridian Denim Co.',
      desiredProduct: 'Straight-leg denim jeans',
      category: 'mens-apparel',
      budgetMin: 20,
      budgetMax: 50,
      requirements: 'Looking for a mid-weight wash suitable for retail resale.',
      name: 'Sourcing Visitor',
      email: 'sourcing.visitor@example.com',
      consent: true,
      website: '',
    });
    expect(res.status).toBe(201);
  });
});

describe('Technology inquiries', () => {
  it('accepts a valid technology inquiry', async () => {
    const res = await request(app).post('/api/v1/technology-inquiries').send({
      serviceType: 'software-engineering',
      projectDescription: 'We need help integrating an LLM into our support workflow.',
      name: 'Service Visitor',
      email: 'service.visitor@example.com',
      preferredContactMethod: 'email',
      consent: true,
      website: '',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeTruthy();
  });

  it('rejects honeypot-filled submissions and creates no record', async () => {
    const res = await request(app).post('/api/v1/technology-inquiries').send({
      serviceType: 'cybersecurity',
      projectDescription: 'Bot submission that should not create a record.',
      name: 'Bot',
      email: 'bot@example.com',
      preferredContactMethod: 'email',
      consent: true,
      website: 'http://spam.example.com',
    });
    expect(res.status).toBe(400);

    const stored = await TechnologyInquiry.findOne({ email: 'bot@example.com' });
    expect(stored).toBeNull();
  });

  it('blocks non-admin from admin technology inquiry list', async () => {
    const register = await request(app).post('/api/v1/auth/register').send({
      name: 'Regular',
      email: 'service-user@example.com',
      password: 'Password1',
      confirmPassword: 'Password1',
      acceptTerms: true,
    });
    const res = await request(app)
      .get('/api/v1/admin/technology-inquiries')
      .set('Authorization', `Bearer ${register.body.data.accessToken}`);
    expect(res.status).toBe(403);
  });

  it('allows admin to list and update technology inquiries', async () => {
    await request(app).post('/api/v1/technology-inquiries').send({
      serviceType: 'application-development',
      projectDescription: 'We need a bespoke internal tool built.',
      name: 'Admin Test Visitor',
      email: 'admin.test.visitor@example.com',
      preferredContactMethod: 'email',
      consent: true,
      website: '',
    });

    await User.create({
      name: 'Service Admin',
      email: 'service-admin@example.com',
      passwordHash: await hashPassword('Password1'),
      role: 'admin',
      status: 'active',
    });
    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'service-admin@example.com', password: 'Password1' });
    const authHeader = `Bearer ${login.body.data.accessToken}`;

    const list = await request(app)
      .get('/api/v1/admin/technology-inquiries')
      .set('Authorization', authHeader);
    expect(list.status).toBe(200);
    expect(list.body.data.items.length).toBeGreaterThan(0);

    const id = list.body.data.items[0].id;
    const update = await request(app)
      .patch(`/api/v1/admin/technology-inquiries/${id}`)
      .set('Authorization', authHeader)
      .send({ status: 'in-progress', internalNotes: 'Reviewing requirements' });
    expect(update.status).toBe(200);
    expect(update.body.data.inquiry.status).toBe('in-progress');
  });
});

describe('Password reset', () => {
  it('returns a generic forgot-password response', async () => {
    const res = await request(app).post('/api/v1/auth/forgot-password').send({
      email: 'unknown@example.com',
    });
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/if an account exists/i);
  });
});
