import { Hono } from 'hono';

import type { CloudflareBindings } from '../lib/env';

const health = new Hono<{ Bindings: CloudflareBindings }>();

/**
 * Health check endpoint
 * GET /health
 */
health.get('/', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: c.env?.API_VERSION ?? 'unknown',
    environment: c.env?.ENVIRONMENT ?? 'unknown',
  });
});

/**
 * Detailed health check with dependency status
 * GET /health/detailed
 */
health.get('/detailed', async (c) => {
  const checks: Record<string, { status: 'ok' | 'error'; latency?: number; error?: string }> = {};

  // Check database connectivity (when configured)
  // try {
  //   const start = Date.now();
  //   await c.env.DB.prepare('SELECT 1').first();
  //   checks.database = { status: 'ok', latency: Date.now() - start };
  // } catch (err) {
  //   checks.database = { status: 'error', error: err instanceof Error ? err.message : 'Unknown error' };
  // }

  const allHealthy = Object.values(checks).every((check) => check.status === 'ok');

  return c.json(
    {
      status: allHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      version: c.env?.API_VERSION ?? 'unknown',
      environment: c.env?.ENVIRONMENT ?? 'unknown',
      checks,
    },
    allHealthy ? 200 : 503
  );
});

export { health };
