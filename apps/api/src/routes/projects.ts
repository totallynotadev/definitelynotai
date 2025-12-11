import { Hono } from 'hono';
import { z } from 'zod';

import type { CloudflareBindings } from '../lib/env';

const projects = new Hono<{ Bindings: CloudflareBindings }>();

/**
 * Project schemas
 */
const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  prompt: z.string().min(10).max(10000),
});

const updateProjectSchema = createProjectSchema.partial();

/**
 * List all projects
 * GET /projects
 */
projects.get('/', (c) => {
  // TODO: Implement database query
  const mockProjects = [
    {
      id: '1',
      name: 'E-commerce App',
      description: 'Full-featured online store',
      status: 'deployed',
      createdAt: '2024-12-01T00:00:00Z',
      updatedAt: '2024-12-10T00:00:00Z',
    },
    {
      id: '2',
      name: 'Dashboard Template',
      description: 'Analytics dashboard',
      status: 'building',
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
  const mockProject = {
    id,
    name: 'E-commerce App',
    description: 'Full-featured online store with shopping cart, checkout flow, and payment integration.',
    prompt: 'Create an e-commerce application with product listings, shopping cart, and checkout.',
    status: 'deployed',
    deploymentUrl: 'https://ecommerce-app.pages.dev',
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
  const validated = createProjectSchema.parse(body);

  // TODO: Implement database insert and AI generation
  const newProject = {
    id: crypto.randomUUID(),
    ...validated,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
  const validated = updateProjectSchema.parse(body);

  // TODO: Implement database update
  const updatedProject = {
    id,
    name: validated.name ?? 'E-commerce App',
    description: validated.description ?? 'Full-featured online store',
    status: 'deployed',
    updatedAt: new Date().toISOString(),
  };

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
