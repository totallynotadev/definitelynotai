import { createClerkClient } from '@clerk/backend';
import { CLERK_SECRET_KEY } from '$env/static/private';
import { PUBLIC_CLERK_PUBLISHABLE_KEY } from '$env/static/public';
import type { Handle } from '@sveltejs/kit';

const clerkClient = createClerkClient({
	secretKey: CLERK_SECRET_KEY,
	publishableKey: PUBLIC_CLERK_PUBLISHABLE_KEY
});

/**
 * Custom Clerk authentication handler for SvelteKit
 * Uses @clerk/backend directly instead of svelte-clerk to avoid Svelte store issues
 */
export const handle: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get('__session') || event.request.headers.get('Authorization')?.replace('Bearer ', '');

	// Create auth function that returns auth state
	event.locals.auth = () => {
		// Return empty auth if no token
		if (!sessionToken) {
			return {
				userId: null,
				sessionId: null,
				sessionClaims: null,
				getToken: async () => null,
				has: () => false,
				debug: () => ({})
			};
		}

		// For server-side, we'll verify the token and return the auth state
		// The actual verification happens asynchronously, but we provide a sync interface
		return {
			userId: null, // Will be populated by verifyToken below
			sessionId: null,
			sessionClaims: null,
			getToken: async () => sessionToken,
			has: () => false,
			debug: () => ({})
		};
	};

	// Verify token and populate auth if we have a session
	if (sessionToken) {
		try {
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
