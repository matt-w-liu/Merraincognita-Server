/**
 * Lightweight API smoke checks used as an end-to-end path without a browser.
 * Full UI coverage is in Vitest component tests; this verifies the live stack path:
 * health → products → contact persistence.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { createApp } from '../app.js';
import { Product } from '../models/Product.js';
import { ContactMessage } from '../models/ContactMessage.js';
import { User } from '../models/User.js';
import { hashPassword } from '../services/token.service.js';
import type { Express } from 'express';

let app: Express;
let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  app = createApp();

  await Product.create({
    name: 'Sample Smoke Test Product',
    slug: 'sample-smoke-test-product',
    sku: 'SMOKE-MA-001',
    brand: 'Test Brand Co.',
    category: 'mens-apparel',
    subcategory: 'T-Shirts',
    price: 24.99,
    currency: 'USD',
    size: 'S–XL',
    description:
      'This is a SAMPLE PRODUCT for automated smoke tests. Replace before production launch.',
    highlights: ['Sample highlight'],
    images: [{ url: '/images/products/test.jpg', alt: 'Sample product', sortOrder: 0 }],
    stockStatus: 'in-stock',
    featured: true,
    published: true,
    archived: false,
    isSample: true,
  });
}, 60_000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe('E2E smoke path', () => {
  it('visits health, lists products, submits contact, registers, and opens account', async () => {
    const health = await request(app).get('/api/v1/health');
    expect(health.status).toBe(200);

    const products = await request(app).get('/api/v1/products');
    expect(products.status).toBe(200);
    expect(products.body.data.items.length).toBeGreaterThan(0);

    const productSlug = products.body.data.items[0].slug;
    const detail = await request(app).get(`/api/v1/products/${productSlug}`);
    expect(detail.status).toBe(200);

    const contact = await request(app).post('/api/v1/contact').send({
      name: 'Smoke Visitor',
      email: 'smoke.visitor@example.com',
      reason: 'wholesale',
      subject: 'Smoke test wholesale question',
      message: 'Automated smoke test message for contact flow.',
      consent: true,
      website: '',
    });
    expect(contact.status).toBe(201);
    const saved = await ContactMessage.findOne({ email: 'smoke.visitor@example.com' });
    expect(saved).toBeTruthy();

    const register = await request(app).post('/api/v1/auth/register').send({
      name: 'Smoke User',
      email: 'smoke.user@example.com',
      password: 'Password1',
      confirmPassword: 'Password1',
      acceptTerms: true,
    });
    expect(register.status).toBe(201);
    const accessToken = register.body.data.accessToken;
    const authHeader = `Bearer ${accessToken}`;

    const me = await request(app).get('/api/v1/auth/me').set('Authorization', authHeader);
    expect(me.status).toBe(200);
    expect(me.body.data.user.email).toBe('smoke.user@example.com');

    const accountProfile = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', authHeader);
    expect(accountProfile.status).toBe(200);

    const inquiry = await request(app)
      .post('/api/v1/product-inquiries')
      .set('Authorization', authHeader)
      .send({
        productId: detail.body.data.product.id,
        name: 'Smoke User',
        email: 'smoke.user@example.com',
        message: 'Automated smoke test inquiry message.',
        preferredContactMethod: 'email',
        consent: true,
        website: '',
      });
    expect(inquiry.status).toBe(201);

    await User.create({
      name: 'Smoke Admin',
      email: 'smoke.admin@example.com',
      passwordHash: await hashPassword('Password1'),
      role: 'admin',
      status: 'active',
    });
    const adminLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'smoke.admin@example.com',
      password: 'Password1',
    });
    const dashboard = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${adminLogin.body.data.accessToken}`);
    expect(dashboard.status).toBe(200);
  });
});
