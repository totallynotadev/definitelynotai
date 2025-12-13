import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const auth = locals.auth();

  // If not authenticated server-side, return null token
  // Client-side auth check in layout will handle redirect
  if (!auth.userId) {
    return {
      token: null,
    };
  }

  // Get the session token for API calls
  const token = await auth.getToken();

  return {
    token,
  };
};
