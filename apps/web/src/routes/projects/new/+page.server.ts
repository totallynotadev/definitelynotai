import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const auth = locals.auth();

  // Redirect to sign-in if not authenticated
  if (!auth.userId) {
    throw redirect(303, '/sign-in');
  }

  // Get the session token for API calls
  const token = await auth.getToken();

  return {
    token,
  };
};
