import { getDb, users, eq } from '@definitelynotai/db';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const auth = locals.auth();

  // If not authenticated server-side, return empty state
  // Client-side auth check in layout will handle redirect
  if (!auth.userId) {
    return {
      user: {
        id: null,
        clerkId: null,
        name: null,
        email: null,
        createdAt: new Date().toISOString(),
      },
    };
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
