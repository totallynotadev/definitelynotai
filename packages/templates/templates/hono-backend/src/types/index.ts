// Environment bindings for Cloudflare Workers
export interface Env {
  DATABASE_URL: string;
  CLERK_SECRET_KEY: string;
  ENVIRONMENT: 'development' | 'staging' | 'production';
  ALLOWED_ORIGINS?: string;

  // @agent:inject:env-types

  // Uncomment if using D1
  // DB: D1Database;

  // Uncomment if using KV
  // KV: KVNamespace;

  // Uncomment if using R2
  // BUCKET: R2Bucket;
}

// Variables set during request lifecycle
export interface Variables {
  userId: string;
  sessionId: string | null;
  requestId: string;

  // @agent:inject:variables
}

// @agent:inject:types

// Common API response types
export interface ApiError {
  error: {
    message: string;
    code: string;
  };
  success: false;
}

export interface ApiSuccess<T> {
  data: T;
  success: true;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// Pagination types
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
  success: true;
}
