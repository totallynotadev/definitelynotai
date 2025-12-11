import { createMiddleware } from 'hono/factory';
import { verifyToken } from '@clerk/backend';

import type { CloudflareBindings } from '../lib/env';

/**
 * Auth context available in route handlers
 */
export type AuthContext = {
  userId: string | null;
  sessionId: string | null;
};

/**
 * Hono variables type for auth
 */
export type AuthVariables = {
  auth: AuthContext;
};

/**
 * Clerk authentication middleware
 *
 * Parses and verifies the JWT from the Authorization header.
 * Sets auth context with userId and sessionId if valid.
 * Does NOT require authentication - use requireAuth for that.
 */
export const clerkAuth = createMiddleware<{
  Bindings: CloudflareBindings;
  Variables: AuthVariables;
}>(async (c, next) => {
  const authHeader = c.req.header('Authorization');

  // No auth header - set null auth and continue
  if (!authHeader?.startsWith('Bearer ')) {
    c.set('auth', { userId: null, sessionId: null });
    return next();
  }

  const token = authHeader.split(' ')[1];

  // Check for secret key
  if (!c.env.CLERK_SECRET_KEY) {
    console.error('CLERK_SECRET_KEY is not configured');
    c.set('auth', { userId: null, sessionId: null });
    return next();
  }

  try {
    const payload = await verifyToken(token, {
      secretKey: c.env.CLERK_SECRET_KEY,
    });

    c.set('auth', {
      userId: payload.sub,
      sessionId: payload.sid ?? null,
    });
  } catch (error) {
    // Invalid token - set null auth
    console.error('Token verification failed:', error);
    c.set('auth', { userId: null, sessionId: null });
  }

  return next();
});

/**
 * Require authentication middleware
 *
 * Must be used after clerkAuth middleware.
 * Returns 401 if user is not authenticated.
 */
export const requireAuth = createMiddleware<{
  Bindings: CloudflareBindings;
  Variables: AuthVariables;
}>(async (c, next) => {
  const auth = c.get('auth');

  if (!auth?.userId) {
    return c.json(
      {
        error: 'Unauthorized',
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      },
      401
    );
  }

  return next();
});

/**
 * Helper to get auth context in route handlers
 */
export function getAuth(c: { get: (key: 'auth') => AuthContext }): AuthContext {
  return c.get('auth');
}
