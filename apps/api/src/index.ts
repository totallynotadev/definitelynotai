import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { requestId } from 'hono/request-id';
import { secureHeaders } from 'hono/secure-headers';

import { errorHandler } from './middleware/error-handler';
import { agents } from './routes/agents';
import { deployments } from './routes/deployments';
import { health } from './routes/health';
import { projects } from './routes/projects';
import { clerk } from './routes/webhooks/clerk';

import type { CloudflareBindings } from './lib/env';

const app = new Hono<{ Bindings: CloudflareBindings }>();

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

// Error handling middleware
app.use('*', errorHandler);

/**
 * Routes
 */

// Health check
app.route('/health', health);

// Webhooks (outside of API versioning)
app.route('/webhooks/clerk', clerk);

// API v1 routes
const v1 = new Hono<{ Bindings: CloudflareBindings }>();
v1.route('/projects', projects);
v1.route('/agents', agents);
v1.route('/deployments', deployments);

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
