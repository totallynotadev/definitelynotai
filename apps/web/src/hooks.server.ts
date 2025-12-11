import { withClerkHandler } from 'svelte-clerk/server';

/**
 * Clerk authentication handler for SvelteKit
 *
 * This handler authenticates requests and provides the Auth object
 * via `event.locals.auth()` in server loaders and actions.
 */
export const handle = withClerkHandler();
