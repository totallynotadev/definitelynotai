import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';

import type { CloudflareBindings } from '../lib/env';
import type { Context, Next } from 'hono';

export interface ApiError {
  error: string;
  message: string;
  details?: unknown;
  requestId?: string;
}

/**
 * Global error handling middleware
 */
export async function errorHandler(
  c: Context<{ Bindings: CloudflareBindings }>,
  next: Next
): Promise<Response | void> {
  try {
    await next();
  } catch (err) {
    const requestId = c.req.header('x-request-id') ?? crypto.randomUUID();

    // Handle Zod validation errors
    if (err instanceof ZodError) {
      const response: ApiError = {
        error: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: err.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
        requestId,
      };
      return c.json(response, 400);
    }

    // Handle HTTP exceptions from Hono
    if (err instanceof HTTPException) {
      const response: ApiError = {
        error: 'HTTP_ERROR',
        message: err.message,
        requestId,
      };
      return c.json(response, err.status);
    }

    // Handle generic errors
    if (err instanceof Error) {
      console.error(`[${requestId}] Unhandled error:`, err);

      const isDev = c.env?.ENVIRONMENT === 'development';
      const response: ApiError = {
        error: 'INTERNAL_ERROR',
        message: isDev ? err.message : 'An unexpected error occurred',
        details: isDev ? err.stack : undefined,
        requestId,
      };
      return c.json(response, 500);
    }

    // Unknown error type
    console.error(`[${requestId}] Unknown error:`, err);
    const response: ApiError = {
      error: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
      requestId,
    };
    return c.json(response, 500);
  }
}
