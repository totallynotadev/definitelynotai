import { createMiddleware } from 'hono/factory';
import { nanoid } from 'nanoid';
import type { Env, Variables } from '../types/index.js';

// Enhanced logger with request ID and timing
export const requestLogger = createMiddleware<{
  Bindings: Env;
  Variables: Variables;
}>(async (c, next) => {
  const requestId = c.req.header('X-Request-ID') ?? nanoid(12);
  const start = Date.now();

  c.set('requestId', requestId);
  c.header('X-Request-ID', requestId);

  console.log(
    JSON.stringify({
      type: 'request',
      requestId,
      method: c.req.method,
      path: c.req.path,
      userAgent: c.req.header('User-Agent'),
      timestamp: new Date().toISOString(),
    })
  );

  await next();

  const duration = Date.now() - start;
  c.header('X-Response-Time', `${duration}ms`);

  console.log(
    JSON.stringify({
      type: 'response',
      requestId,
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      duration,
      timestamp: new Date().toISOString(),
    })
  );
});

// Simple development logger
export const devLogger = createMiddleware(async (c, next) => {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  console.log(`${c.req.method} ${c.req.path} - ${c.res.status} (${duration}ms)`);
});
