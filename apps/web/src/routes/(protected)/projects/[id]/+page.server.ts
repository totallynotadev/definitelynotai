import { getDb, projects, users, deployments, agentLogs, eq, desc, and } from '@definitelynotai/db';
import { error, redirect } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
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

  if (!user) {
    throw error(404, 'User not found');
  }

  // Fetch project by ID
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, params.id),
  });

  // Return 404 if project not found
  if (!project) {
    throw error(404, 'Project not found');
  }

  // Verify ownership
  if (project.userId !== user.id) {
    throw error(403, 'You do not have access to this project');
  }

  // Fetch related deployments
  const projectDeployments = await db.query.deployments.findMany({
    where: eq(deployments.projectId, project.id),
    orderBy: [desc(deployments.createdAt)],
  });

  // Fetch recent agent logs (last 10)
  const projectAgentLogs = await db.query.agentLogs.findMany({
    where: eq(agentLogs.projectId, project.id),
    orderBy: [desc(agentLogs.createdAt)],
    limit: 10,
  });

  return {
    project: {
      id: project.id,
      name: project.name,
      description: project.description,
      prompt: project.prompt,
      status: project.status,
      platforms: project.platforms,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    },
    deployments: projectDeployments.map((d) => ({
      id: d.id,
      platform: d.platform,
      url: d.url,
      status: d.status,
      error: d.error,
      duration: d.duration,
      createdAt: d.createdAt.toISOString(),
      completedAt: d.completedAt?.toISOString() || null,
    })),
    agentLogs: projectAgentLogs.map((l) => ({
      id: l.id,
      step: l.step,
      message: l.message,
      metadata: l.metadata,
      createdAt: l.createdAt.toISOString(),
    })),
    token: await auth.getToken(),
  };
};
