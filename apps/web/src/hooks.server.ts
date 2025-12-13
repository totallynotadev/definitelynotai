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

	const sessionToken =
		event.cookies.get('__session') ||
		event.request.headers.get('Authorization')?.replace('Bearer ', '');

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
			event.locals.auth = () => ({
				userId: verifiedToken.sub,
				sessionId: verifiedToken.sid,
				sessionClaims: verifiedToken,
				getToken: async () => sessionToken,
				has: () => true,
				debug: () => ({})
			});
		} catch {
			// Token verification failed, keep default empty auth
		}
	}

	return resolve(event);
};
