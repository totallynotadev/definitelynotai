import { getDb, projects, users, eq, desc, sql, and } from '@definitelynotai/db';
import { redirect } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const auth = locals.auth();

  // Redirect to sign-in if not authenticated
  if (!auth.userId) {
    throw redirect(303, '/sign-in');
  }

  const db = getDb();

  // Get or create user in our database
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, auth.userId),
  });

  // If user doesn't exist yet, return empty state
  if (!user) {
    return {
      user: {
        id: auth.userId,
        name: null,
        email: null,
      },
      stats: {
        total: 0,
        draft: 0,
        generating: 0,
        building: 0,
        deployed: 0,
        failed: 0,
      },
      recentProjects: [],
    };
  }

  // Fetch project counts by status
  const statusCounts = await db
    .select({
      status: projects.status,
      count: sql<number>`count(*)::int`,
    })
    .from(projects)
    .where(eq(projects.userId, user.id))
    .groupBy(projects.status);

  // Convert to object for easy access
  const stats = {
    total: 0,
    draft: 0,
    generating: 0,
    building: 0,
    deployed: 0,
    failed: 0,
  };

  for (const row of statusCounts) {
    const status = row.status as keyof typeof stats;
    if (status in stats) {
      stats[status] = row.count;
    }
    stats.total += row.count;
  }

  // Fetch recent 5 projects
  const recentProjects = await db.query.projects.findMany({
    where: eq(projects.userId, user.id),
    orderBy: [desc(projects.updatedAt)],
    limit: 5,
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    stats,
    recentProjects: recentProjects.map((p) => ({
      id: p.id,
      name: p.name,
      status: p.status,
      prompt: p.prompt,
      updatedAt: p.updatedAt.toISOString(),
    })),
  };
};
