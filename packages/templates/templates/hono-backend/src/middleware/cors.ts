import { cors } from 'hono/cors';
import type { Env } from '../types/index.js';

// Configurable CORS middleware
export function createCorsMiddleware(allowedOrigins?: string[]) {
  const origins = allowedOrigins ?? [
    'http://localhost:5173',
    'http://localhost:3000',
  ];

  return cors({
    origin: origins,
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposeHeaders: ['X-Request-ID', 'X-Response-Time'],
    credentials: true,
    maxAge: 86400, // 24 hours
  });
}

// Production CORS that reads allowed origins from env
export function createProductionCors(env: Env) {
  const allowedOrigins = env.ALLOWED_ORIGINS?.split(',') ?? [];

  return cors({
    origin: (origin) => {
      if (!origin) return null;
      if (allowedOrigins.includes(origin)) return origin;
      if (env.ENVIRONMENT === 'development') return origin;
      return null;
    },
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposeHeaders: ['X-Request-ID', 'X-Response-Time'],
    credentials: true,
    maxAge: 86400,
  });
}
