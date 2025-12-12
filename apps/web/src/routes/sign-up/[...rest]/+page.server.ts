import { redirect } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const auth = locals.auth();

  // If user is already signed in, redirect to projects
  if (auth.userId) {
    throw redirect(303, '/projects');
  }

  return {};
};
