import {
  createProjectInputSchema,
  formatDate,
  generatePrefixedId,
  ID_PREFIXES,
  Platform,
  type ProjectDTO,
  ProjectStatus,
  updateProjectInputSchema,
} from '@definitelynotai/shared';
import { Hono } from 'hono';


import type { CloudflareBindings } from '../lib/env';

const projects = new Hono<{ Bindings: CloudflareBindings }>();

/**
 * List all projects
 * GET /projects
 */
projects.get('/', (c) => {
  // TODO: Implement database query
  const mockProjects: ProjectDTO[] = [
    {
      id: generatePrefixedId(ID_PREFIXES.PROJECT),
      userId: 'usr_demo123',
      name: 'E-commerce App',
      description: 'Full-featured online store',
      prompt: 'Create an e-commerce application with product listings and shopping cart.',
      status: ProjectStatus.DEPLOYED,
      platforms: [Platform.CLOUDFLARE_PAGES],
      createdAt: '2024-12-01T00:00:00Z',
      updatedAt: '2024-12-10T00:00:00Z',
    },
    {
      id: generatePrefixedId(ID_PREFIXES.PROJECT),
      userId: 'usr_demo123',
      name: 'Dashboard Template',
      description: 'Analytics dashboard',
      prompt: 'Create an analytics dashboard with charts and data visualization.',
      status: ProjectStatus.BUILDING,
      platforms: [Platform.CLOUDFLARE_PAGES],
      createdAt: '2024-12-05T00:00:00Z',
      updatedAt: '2024-12-11T00:00:00Z',
    },
  ];

  return c.json({
    data: mockProjects,
    meta: {
      total: mockProjects.length,
      page: 1,
      pageSize: 20,
    },
  });
});

/**
 * Get a single project
 * GET /projects/:id
 */
projects.get('/:id', (c) => {
  const id = c.req.param('id');

  // TODO: Implement database query
  const mockProject: ProjectDTO = {
    id,
    userId: 'usr_demo123',
    name: 'E-commerce App',
    description: 'Full-featured online store with shopping cart, checkout flow, and payment integration.',
    prompt: 'Create an e-commerce application with product listings, shopping cart, and checkout.',
    status: ProjectStatus.DEPLOYED,
    platforms: [Platform.CLOUDFLARE_PAGES, Platform.CLOUDFLARE_WORKERS],
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2024-12-10T00:00:00Z',
  };

  return c.json({ data: mockProject });
});

/**
 * Create a new project
 * POST /projects
 */
projects.post('/', async (c) => {
  const body = await c.req.json();
  const validated = createProjectInputSchema.parse(body);

  // TODO: Implement database insert and AI generation
  const now = formatDate(new Date());
  const newProject: ProjectDTO = {
    id: generatePrefixedId(ID_PREFIXES.PROJECT),
    userId: validated.userId,
    name: validated.name,
    description: validated.description ?? null,
    prompt: validated.prompt,
    status: ProjectStatus.DRAFT,
    platforms: validated.platforms,
    createdAt: now,
    updatedAt: now,
  };

  return c.json({ data: newProject }, 201);
});

/**
 * Update a project
 * PATCH /projects/:id
 */
projects.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const validated = updateProjectInputSchema.parse(body);

  // TODO: Implement database update
  // Build update object explicitly to satisfy exactOptionalPropertyTypes
  const updatedProject: Record<string, unknown> = {
    id,
    updatedAt: formatDate(new Date()),
  };

  if (validated.name !== undefined) {updatedProject.name = validated.name;}
  if (validated.description !== undefined) {updatedProject.description = validated.description;}
  if (validated.prompt !== undefined) {updatedProject.prompt = validated.prompt;}
  if (validated.status !== undefined) {updatedProject.status = validated.status;}
  if (validated.platforms !== undefined) {updatedProject.platforms = validated.platforms;}

  return c.json({ data: updatedProject });
});

/**
 * Delete a project
 * DELETE /projects/:id
 */
projects.delete('/:id', (c) => {
  const id = c.req.param('id');

  // TODO: Implement database delete
  return c.json({ message: `Project ${id} deleted successfully` });
});

export { projects };
