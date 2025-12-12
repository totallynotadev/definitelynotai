import { buildClerkProps } from 'svelte-clerk/server';

import type { LayoutServerLoad } from './$types';

/**
 * Root layout server load function
 *
 * This provides Clerk auth state to the client for SSR support.
 * The buildClerkProps function serializes the auth state so it can
 * be hydrated on the client without an additional network request.
 */
export const load: LayoutServerLoad = ({ locals }) => {
  return {
    ...buildClerkProps(locals.auth())
  };
};
