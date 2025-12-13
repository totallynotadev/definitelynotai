import { nanoid } from 'nanoid';
import { Context } from 'hono';
import type { Env, Variables } from '../types/index.js';

// Generate unique IDs
export function generateId(length = 12): string {
  return nanoid(length);
}

// Standard API response helpers
export function success<T>(c: Context, data: T, status: 200 | 201 = 200) {
  return c.json({ success: true, data }, status);
}

export function created<T>(c: Context, data: T) {
  return success(c, data, 201);
}

export function error(
  c: Context,
  message: string,
  code: string,
  status: 400 | 401 | 403 | 404 | 409 | 422 | 500 = 400
) {
  return c.json({ success: false, error: { message, code } }, status);
}

export function notFound(c: Context, resource = 'Resource') {
  return error(c, `${resource} not found`, 'NOT_FOUND', 404);
}

export function unauthorized(c: Context, message = 'Unauthorized') {
  return error(c, message, 'UNAUTHORIZED', 401);
}

export function forbidden(c: Context, message = 'Forbidden') {
  return error(c, message, 'FORBIDDEN', 403);
}

export function badRequest(c: Context, message: string) {
  return error(c, message, 'BAD_REQUEST', 400);
}

export function conflict(c: Context, message: string) {
  return error(c, message, 'CONFLICT', 409);
}

// Pagination helpers
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function paginate<T>(
  items: T[],
  total: number,
  { page = 1, limit = 20 }: PaginationParams
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    data: items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

// Get pagination params from query string
export function getPaginationParams(c: Context): PaginationParams {
  const page = Math.max(1, parseInt(c.req.query('page') ?? '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(c.req.query('limit') ?? '20', 10)));
  return { page, limit };
}
