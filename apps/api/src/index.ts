import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { requestId } from 'hono/request-id';
import { secureHeaders } from 'hono/secure-headers';

import { initObservability, observabilityMiddleware } from '@definitelynotai/observability';
import { clerkAuth, requireAuth, type AuthVariables } from './middleware/auth';
import { errorHandler } from './middleware/error-handler';
import { agents } from './routes/agents';
import { deploy } from './routes/deploy';
import { deployments } from './routes/deployments';
import { health } from './routes/health';
import { observability } from './routes/observability';
import { projects } from './routes/projects';
import { sandbox } from './routes/sandbox';
import { templates } from './routes/templates';
import { clerk } from './routes/webhooks/clerk';

import type { CloudflareBindings } from './lib/env';

// Track if observability is initialized
let observabilityInitialized = false;

const app = new Hono<{ Bindings: CloudflareBindings; Variables: AuthVariables }>();

/**
 * Global middleware
 */

// Add request ID to all requests
app.use('*', requestId());

// Logger middleware
app.use('*', logger());

// Security headers
app.use('*', secureHeaders());

// Pretty JSON in development
app.use('*', prettyJSON());

// Initialize observability (lazy init with env from first request)
app.use('*', async (c, next) => {
  if (!observabilityInitialized) {
    const env = c.env;
    initObservability({
      langfuse:
        env.LANGFUSE_PUBLIC_KEY && env.LANGFUSE_SECRET_KEY
          ? {
              publicKey: env.LANGFUSE_PUBLIC_KEY,
              secretKey: env.LANGFUSE_SECRET_KEY,
              baseUrl: env.LANGFUSE_HOST,
            }
          : undefined,
      costTracker: {
        dailyBudget: 100, // $100/day limit
      },
      enabled: true,
    });
    observabilityInitialized = true;
  }
  await next();
});

// Observability middleware (tracing, metrics)
app.use('*', observabilityMiddleware());

// CORS configuration
app.use(
  '*',
  cors({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'https://definitelynotai.pages.dev'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposeHeaders: ['X-Request-ID'],
    credentials: true,
    maxAge: 86400,
  })
);

// Clerk authentication (parses JWT, does not require auth)
app.use('*', clerkAuth);

// Error handling middleware
app.use('*', errorHandler);

/**
 * Routes
 */

// Health check
app.route('/health', health);

// Webhooks (outside of API versioning)
app.route('/webhooks/clerk', clerk);

// API v1 routes (protected - require authentication)
const v1 = new Hono<{ Bindings: CloudflareBindings; Variables: AuthVariables }>();
v1.use('*', requireAuth);
v1.route('/projects', projects);
v1.route('/agents', agents);
v1.route('/deploy', deploy);
v1.route('/deployments', deployments);
v1.route('/sandbox', sandbox);
v1.route('/templates', templates);
v1.route('/observability', observability);

app.route('/api/v1', v1);

/**
 * Root endpoint
 */
app.get('/', (c) => {
  return c.json({
    name: 'Definitely Not AI API',
    description: 'An Agentic OS where users describe apps and AI builds them',
    version: c.env?.API_VERSION ?? 'v1',
    documentation: '/api/v1',
    health: '/health',
  });
});

/**
 * 404 handler
 */
app.notFound((c) => {
  return c.json(
    {
      error: 'NOT_FOUND',
      message: `Route ${c.req.method} ${c.req.path} not found`,
    },
    404
  );
});

export default app;
