import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createClient, users, projects, eq, and, desc } from '@definitelynotai/db';
import {
  generatePrefixedId,
  ID_PREFIXES,
  Platform,
  platformSchema,
  projectStatusSchema,
} from '@definitelynotai/shared';

import type { CloudflareBindings } from '../lib/env';
import type { AuthVariables } from '../middleware/auth';

/**
 * Input schemas for project operations
 */
const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  prompt: z.string().min(10).max(10000),
  platforms: z.array(platformSchema).min(1).default([Platform.CLOUDFLARE_PAGES]),
});

const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  prompt: z.string().min(10).max(10000).optional(),
  status: projectStatusSchema.optional(),
  platforms: z.array(platformSchema).min(1).optional(),
});

/**
 * Helper to get or create user from Clerk auth
 * This handles the case where the webhook hasn't synced the user yet
 */
async function getOrCreateUser(
  db: ReturnType<typeof createClient>,
  clerkId: string
): Promise<{ id: string; clerkId: string; email: string; name: string | null } | null> {
  // Try to find existing user
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  if (existingUser.length > 0) {
    return existingUser[0] ?? null;
  }

  // User doesn't exist - create a placeholder
  // This handles development scenarios where webhook hasn't synced yet
  // The webhook will update the email/name when it fires
  const newUser = await db
    .insert(users)
    .values({
      id: generatePrefixedId(ID_PREFIXES.USER),
      clerkId,
      email: `${clerkId}@placeholder.local`, // Placeholder email
      name: null,
    })
    .returning();

  console.log('Created placeholder user for clerkId:', clerkId);
  return newUser[0] ?? null;
}

const projectRoutes = new Hono<{
  Bindings: CloudflareBindings;
  Variables: AuthVariables;
}>();

/**
 * List all projects for the authenticated user
 * GET /projects
 */
projectRoutes.get('/', async (c) => {
  const { userId: clerkId } = c.get('auth');

  if (!clerkId) {
    return c.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401);
  }

  if (!c.env.DATABASE_URL) {
    return c.json({ error: 'Database not configured', code: 'DB_NOT_CONFIGURED' }, 500);
  }

  const db = createClient(c.env.DATABASE_URL);

  // Get or create user
  const user = await getOrCreateUser(db, clerkId);
  if (!user) {
    return c.json({ error: 'Failed to get user', code: 'USER_ERROR' }, 500);
  }

  // Get user's projects
  const userProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, user.id))
    .orderBy(desc(projects.createdAt));

  return c.json({
    data: userProjects,
    meta: {
      total: userProjects.length,
    },
  });
});

/**
 * Get a single project by ID
 * GET /projects/:id
 */
projectRoutes.get('/:id', async (c) => {
  const { userId: clerkId } = c.get('auth');
  const projectId = c.req.param('id');

  if (!clerkId) {
    return c.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401);
  }

  if (!c.env.DATABASE_URL) {
    return c.json({ error: 'Database not configured', code: 'DB_NOT_CONFIGURED' }, 500);
  }

  const db = createClient(c.env.DATABASE_URL);

  // Get or create user
  const user = await getOrCreateUser(db, clerkId);
  if (!user) {
    return c.json({ error: 'Failed to get user', code: 'USER_ERROR' }, 500);
  }

  // Get project (verify ownership)
  const project = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)))
    .limit(1);

  if (project.length === 0) {
    return c.json({ error: 'Project not found', code: 'NOT_FOUND' }, 404);
  }

  return c.json({ data: project[0] });
});

/**
 * Create a new project
 * POST /projects
 */
projectRoutes.post('/', zValidator('json', createProjectSchema), async (c) => {
  const { userId: clerkId } = c.get('auth');
  const data = c.req.valid('json');

  if (!clerkId) {
    return c.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401);
  }

  if (!c.env.DATABASE_URL) {
    return c.json({ error: 'Database not configured', code: 'DB_NOT_CONFIGURED' }, 500);
  }

  const db = createClient(c.env.DATABASE_URL);

  // Get or create user
  const user = await getOrCreateUser(db, clerkId);
  if (!user) {
    return c.json({ error: 'Failed to get user', code: 'USER_ERROR' }, 500);
  }

  // Create project
  const newProject = await db
    .insert(projects)
    .values({
      id: generatePrefixedId(ID_PREFIXES.PROJECT),
      userId: user.id,
      name: data.name,
      description: data.description ?? null,
      prompt: data.prompt,
      platforms: data.platforms,
      status: 'draft',
    })
    .returning();

  return c.json({ data: newProject[0] }, 201);
});

/**
 * Update a project
 * PATCH /projects/:id
 */
projectRoutes.patch('/:id', zValidator('json', updateProjectSchema), async (c) => {
  const { userId: clerkId } = c.get('auth');
  const projectId = c.req.param('id');
  const data = c.req.valid('json');

  if (!clerkId) {
    return c.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401);
  }

  if (!c.env.DATABASE_URL) {
    return c.json({ error: 'Database not configured', code: 'DB_NOT_CONFIGURED' }, 500);
  }

  const db = createClient(c.env.DATABASE_URL);

  // Get or create user
  const user = await getOrCreateUser(db, clerkId);
  if (!user) {
    return c.json({ error: 'Failed to get user', code: 'USER_ERROR' }, 500);
  }

  // Verify ownership
  const existing = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)))
    .limit(1);

  if (existing.length === 0) {
    return c.json({ error: 'Project not found', code: 'NOT_FOUND' }, 404);
  }

  // Build update object
  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.prompt !== undefined) updateData.prompt = data.prompt;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.platforms !== undefined) updateData.platforms = data.platforms;

  // Update project
  const updated = await db
    .update(projects)
    .set(updateData)
    .where(eq(projects.id, projectId))
    .returning();

  return c.json({ data: updated[0] });
});

/**
 * Delete a project
 * DELETE /projects/:id
 */
projectRoutes.delete('/:id', async (c) => {
  const { userId: clerkId } = c.get('auth');
  const projectId = c.req.param('id');

  if (!clerkId) {
    return c.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401);
  }

  if (!c.env.DATABASE_URL) {
    return c.json({ error: 'Database not configured', code: 'DB_NOT_CONFIGURED' }, 500);
  }

  const db = createClient(c.env.DATABASE_URL);

  // Get or create user
  const user = await getOrCreateUser(db, clerkId);
  if (!user) {
    return c.json({ error: 'Failed to get user', code: 'USER_ERROR' }, 500);
  }

  // Verify ownership
  const existing = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)))
    .limit(1);

  if (existing.length === 0) {
    return c.json({ error: 'Project not found', code: 'NOT_FOUND' }, 404);
  }

  // Delete project (cascades to deployments and agent_logs)
  await db.delete(projects).where(eq(projects.id, projectId));

  return c.json({ deleted: true, id: projectId });
});

export { projectRoutes as projects };
