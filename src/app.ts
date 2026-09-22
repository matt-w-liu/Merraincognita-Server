import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { env, isProduction } from './config/env.js';
import { globalRateLimiter } from './middleware/rateLimit.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import productRoutes from './routes/product.routes.js';
import productInquiryRoutes from './routes/productInquiry.routes.js';
import serviceBookingRoutes from './routes/serviceBooking.routes.js';
import productRequestRoutes from './routes/productRequest.routes.js';
import technologyInquiryRoutes from './routes/technologyInquiry.routes.js';
import contactRoutes from './routes/contact.routes.js';
import systemRoutes, { adminRouter } from './routes/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();

  // Railway (and most PaaS hosts) always sit the app behind one reverse-proxy hop,
  // which sets X-Forwarded-For — Express must be told to trust it or
  // express-rate-limit throws ERR_ERL_UNEXPECTED_X_FORWARDED_FOR. Detect Railway via
  // its always-present RAILWAY_ENVIRONMENT_NAME var so this doesn't depend on
  // NODE_ENV/TRUST_PROXY being configured correctly in the Railway dashboard.
  const isRailway = Boolean(process.env.RAILWAY_ENVIRONMENT_NAME || process.env.RAILWAY_ENVIRONMENT);
  if (env.TRUST_PROXY || isProduction || isRailway) {
    app.set('trust proxy', 1);
  }

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false,
    }),
  );
  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(morgan(isProduction ? 'combined' : 'dev'));
  app.use(globalRateLimiter);

  const uploadsPath = path.resolve(process.cwd(), env.UPLOAD_DIR);
  app.use(
    '/uploads',
    express.static(uploadsPath, {
      maxAge: isProduction ? '7d' : 0,
      fallthrough: true,
    }),
  );

  app.get('/', (_req, res) => {
    res.json({
      success: true,
      data: { name: 'MERRAINCOGNITA LLC API', version: 'v1' },
      message: 'API is running',
    });
  });

  const api = express.Router();
  api.use(systemRoutes);
  api.use('/auth', authRoutes);
  api.use('/users', userRoutes);
  api.use('/products', productRoutes);
  api.use('/product-inquiries', productInquiryRoutes);
  api.use('/service-bookings', serviceBookingRoutes);
  api.use('/product-requests', productRequestRoutes);
  api.use('/technology-inquiries', technologyInquiryRoutes);
  api.use('/contact', contactRoutes);
  api.use('/admin', adminRouter);

  app.use('/api/v1', api);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
