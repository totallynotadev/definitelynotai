import { createMiddleware } from 'hono/factory';
import { verifyToken } from '@clerk/backend';
import type { Env, Variables } from '../types/index.js';

export const authMiddleware = createMiddleware<{
  Bindings: Env;
  Variables: Variables;
}>(async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized', code: 'MISSING_TOKEN' }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const payload = await verifyToken(token, {
      secretKey: c.env.CLERK_SECRET_KEY,
    });

    // Set user info in context for downstream handlers
    c.set('userId', payload.sub);
    c.set('sessionId', payload.sid ?? null);

    await next();
  } catch (error) {
    console.error('Auth error:', error);
    return c.json({ error: 'Invalid token', code: 'INVALID_TOKEN' }, 401);
  }
});

// Optional auth - doesn't fail if no token, but sets userId if present
export const optionalAuthMiddleware = createMiddleware<{
  Bindings: Env;
  Variables: Variables;
}>(async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);

    try {
      const payload = await verifyToken(token, {
        secretKey: c.env.CLERK_SECRET_KEY,
      });

      c.set('userId', payload.sub);
      c.set('sessionId', payload.sid ?? null);
    } catch {
      // Ignore auth errors for optional auth
    }
  }

  await next();
});
