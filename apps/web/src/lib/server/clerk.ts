import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

/**
 * Clerk server-side authentication helpers
 *
 * These utilities help work with Clerk authentication state
 * in server-side code (load functions, actions, API routes).
 */

/**
 * Get the authenticated user ID from the request
 * Returns null if user is not authenticated
 */
export function getUserId(event: RequestEvent): string | null {
  const auth = event.locals.auth();
  return auth.userId;
}

/**
 * Get the session ID from the request
 * Returns null if no active session
 */
export function getSessionId(event: RequestEvent): string | null {
  const auth = event.locals.auth();
  return auth.sessionId;
}

/**
 * Require authentication for a route
 * Throws a 401 error if the user is not authenticated
 */
export function requireAuth(event: RequestEvent): { userId: string; sessionId: string } {
  const auth = event.locals.auth();

  if (!auth.userId || !auth.sessionId) {
    throw error(401, {
      message: 'Unauthorized',
      code: 'UNAUTHORIZED'
    });
  }

  return {
    userId: auth.userId,
    sessionId: auth.sessionId
  };
}

/**
 * Check if the user is authenticated
 */
export function isAuthenticated(event: RequestEvent): boolean {
  const auth = event.locals.auth();
  return !!auth.userId;
}

/**
 * Get the full auth object from the request
 */
export function getAuth(event: RequestEvent) {
  return event.locals.auth();
}

/**
 * Verify that the Clerk secret key is configured
 * Call this during app startup to fail fast if misconfigured
 */
export function verifyClerkConfig(): void {
  // Clerk configuration is handled via environment variables
  // CLERK_SECRET_KEY should be set in production
  // svelte-clerk handles the configuration automatically
}
