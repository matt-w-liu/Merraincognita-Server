export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;
  public readonly errors?: Record<string, string[]>;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode = 500,
    options?: { code?: string; errors?: Record<string, string[]>; isOperational?: boolean },
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = options?.code;
    this.errors = options?.errors;
    this.isOperational = options?.isOperational ?? true;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export function notFound(message = 'Resource not found'): AppError {
  return new AppError(message, 404, { code: 'NOT_FOUND' });
}

export function unauthorized(message = 'Authentication required'): AppError {
  return new AppError(message, 401, { code: 'UNAUTHORIZED' });
}

export function forbidden(message = 'You do not have permission to perform this action'): AppError {
  return new AppError(message, 403, { code: 'FORBIDDEN' });
}

export function badRequest(
  message: string,
  errors?: Record<string, string[]>,
): AppError {
  return new AppError(message, 400, { code: 'BAD_REQUEST', errors });
}

export function conflict(message: string): AppError {
  return new AppError(message, 409, { code: 'CONFLICT' });
}

export function tooManyRequests(message = 'Too many requests. Please try again later.'): AppError {
  return new AppError(message, 429, { code: 'RATE_LIMITED' });
}
