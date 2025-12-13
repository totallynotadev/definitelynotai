/**
 * Clerk client - vanilla JavaScript, no Svelte reactivity
 */
console.log('[clerk/client] Module loading');

import { Clerk } from '@clerk/clerk-js';

console.log('[clerk/client] Clerk imported successfully');

let clerk: Clerk | null = null;
let initPromise: Promise<Clerk> | null = null;
let isReady = false;

/**
 * Initialize Clerk - returns a promise that resolves to the Clerk instance
 */
export function initClerk(publishableKey: string): Promise<Clerk> {
	console.log('initClerk called, current state:', { clerk: !!clerk, isReady, initPromise: !!initPromise });

	if (clerk && isReady) {
		console.log('initClerk: returning existing clerk instance');
		return Promise.resolve(clerk);
	}

	if (initPromise) {
		console.log('initClerk: returning existing promise');
		return initPromise;
	}

	console.log('initClerk: creating new Clerk instance');
	initPromise = new Promise((resolve, reject) => {
		const instance = new Clerk(publishableKey);
		console.log('initClerk: calling instance.load()');
		instance
			.load()
			.then(() => {
				console.log('initClerk: load() resolved successfully');
				clerk = instance;
				isReady = true;
				resolve(instance);
			})
			.catch((err) => {
				console.error('initClerk: load() failed:', err);
				reject(err);
			});
	});

	return initPromise;
}

/**
 * Get the Clerk instance (may be null if not initialized)
 */
export function getClerk(): Clerk | null {
	return clerk;
}

/**
 * Check if Clerk is fully loaded and ready
 */
export function isClerkReady(): boolean {
	return isReady && clerk !== null;
}

/**
 * Check if user is signed in
 */
export function isSignedIn(): boolean {
	return clerk?.user != null;
}

/**
 * Get current user ID
 */
export function getUserId(): string | null | undefined {
	return clerk?.user?.id;
}
