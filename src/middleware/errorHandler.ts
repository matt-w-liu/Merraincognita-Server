import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';
import { isProduction } from '../config/env.js';
import mongoose from 'mongoose';

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction): void {
  next(new AppError('Route not found', 404, { code: 'NOT_FOUND' }));
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const key = issue.path.join('.') || 'form';
      errors[key] = errors[key] ?? [];
      errors[key].push(issue.message);
    }
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      ...(err.errors ? { errors: err.errors } : {}),
    });
    return;
  }

  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({
      success: false,
      message: 'Invalid identifier',
      code: 'BAD_REQUEST',
    });
    return;
  }

  if ((err as { code?: number })?.code === 11000) {
    res.status(409).json({
      success: false,
      message: 'A record with this value already exists',
      code: 'CONFLICT',
    });
    return;
  }

  console.error('[error]', err);
  res.status(500).json({
    success: false,
    message: isProduction ? 'An unexpected error occurred' : String(err),
    code: 'INTERNAL_ERROR',
  });
}
