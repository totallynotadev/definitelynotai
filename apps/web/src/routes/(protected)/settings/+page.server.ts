import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDb, users, eq } from '@definitelynotai/db';

export const load: PageServerLoad = async ({ locals }) => {
  const auth = locals.auth();

  if (!auth.userId) {
    throw redirect(303, '/sign-in');
  }

  const db = getDb();

  // Get user from our database
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, auth.userId),
  });

  return {
    user: user
      ? {
          id: user.id,
          clerkId: user.clerkId,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt.toISOString(),
        }
      : {
          id: auth.userId,
          clerkId: auth.userId,
          name: null,
          email: null,
          createdAt: new Date().toISOString(),
        },
  };
};
