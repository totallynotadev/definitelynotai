import { Hono } from 'hono';
import type { Env, Variables } from '../types/index.js';
import { createDb } from '../db/client.js';

const healthRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// Detailed health check with database connectivity
healthRoutes.get('/', async (c) => {
  const checks: Record<string, { status: string; latency?: number }> = {};

  // Database check
  if (c.env.DATABASE_URL) {
    const start = Date.now();
    try {
      const db = createDb(c.env.DATABASE_URL);
      await db.execute('SELECT 1');
      checks.database = {
        status: 'healthy',
        latency: Date.now() - start,
      };
    } catch {
      checks.database = { status: 'unhealthy' };
    }
  }

  const allHealthy = Object.values(checks).every((c) => c.status === 'healthy');

  return c.json(
    {
      status: allHealthy ? 'healthy' : 'degraded',
      checks,
      timestamp: new Date().toISOString(),
    },
    allHealthy ? 200 : 503
  );
});

export { healthRoutes };
