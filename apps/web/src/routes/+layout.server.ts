import type { LayoutServerLoad } from './$types';

/**
 * Root layout server load function
 *
 * Provides server-side auth info for route protection.
 * The Clerk UI is initialized client-side via @clerk/clerk-js.
 */
export const load: LayoutServerLoad = ({ locals }) => {
  const auth = locals.auth();

  return {
    userId: auth.userId
  };
};
