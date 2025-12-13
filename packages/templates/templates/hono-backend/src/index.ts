import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { routes } from './routes/index.js';
import { authMiddleware } from './middleware/auth.js';
import type { Env, Variables } from './types/index.js';

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// Global middleware
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  })
);

// Health check (no auth required)
app.get('/health', (c) =>
  c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT,
  })
);

// Protected API routes
app.use('/api/*', authMiddleware);
app.route('/api', routes);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found', path: c.req.path }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json(
    {
      error: 'Internal server error',
      message: c.env.ENVIRONMENT === 'development' ? err.message : undefined,
    },
    500
  );
});

export default app;
