import { getDb, projects, users, eq, desc } from '@definitelynotai/db';
import { redirect } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const auth = locals.auth();

  // Redirect to sign-in if not authenticated
  if (!auth.userId) {
    throw redirect(303, '/sign-in');
  }

  const db = getDb();

  // Get user from database
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, auth.userId),
  });

  // If user doesn't exist, return empty state
  if (!user) {
    return {
      projects: [],
      projectCount: 0,
      token: await auth.getToken(),
    };
  }

  // Fetch all user projects ordered by updated date
  const userProjects = await db.query.projects.findMany({
    where: eq(projects.userId, user.id),
    orderBy: [desc(projects.updatedAt)],
  });

  return {
    projects: userProjects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      prompt: p.prompt,
      status: p.status,
      platforms: p.platforms,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    })),
    projectCount: userProjects.length,
    token: await auth.getToken(),
  };
};
