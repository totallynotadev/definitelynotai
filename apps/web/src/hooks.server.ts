import { createClerkClient } from '@clerk/backend';
import type { Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

/**
 * Custom Clerk authentication handler for SvelteKit
 * Uses @clerk/backend directly instead of svelte-clerk to avoid Svelte store issues
 */
export const handle: Handle = async ({ event, resolve }) => {
	// Initialize Clerk client with runtime env vars
	const secretKey = env.CLERK_SECRET_KEY;
	const publishableKey = publicEnv.PUBLIC_CLERK_PUBLISHABLE_KEY;

	// Clerk can use different cookie names depending on the environment
	// Check all possible session cookie names
	const sessionToken =
		event.cookies.get('__session') ||
		event.cookies.get('__clerk_db_jwt') ||
		event.cookies.get('__client') ||
		event.request.headers.get('Authorization')?.replace('Bearer ', '');

	console.log('[hooks.server] Auth check:', {
		hasSecretKey: !!secretKey,
		hasPublishableKey: !!publishableKey,
		hasSessionToken: !!sessionToken,
		cookies: event.cookies.getAll().map(c => c.name),
		path: event.url.pathname
	});

	// Create default auth function that returns empty auth state
	event.locals.auth = () => ({
		userId: null,
		sessionId: null,
		sessionClaims: null,
		getToken: async () => null,
		has: () => false,
		debug: () => ({})
	});

	// Only verify token if we have the secret key and a session token
	if (secretKey && publishableKey && sessionToken) {
		try {
			const clerkClient = createClerkClient({
				secretKey,
				publishableKey
			});

			const verifiedToken = await clerkClient.verifyToken(sessionToken);
			console.log('[hooks.server] Token verified successfully, userId:', verifiedToken.sub);

			event.locals.auth = () => ({
				userId: verifiedToken.sub,
				sessionId: verifiedToken.sid,
				sessionClaims: verifiedToken,
				getToken: async () => sessionToken,
				has: () => true,
				debug: () => ({})
			});
		} catch (e) {
			console.log('[hooks.server] Token verification failed:', e instanceof Error ? e.message : 'Unknown error');
			// Token verification failed, keep default empty auth
		}
	}

	return resolve(event);
};
