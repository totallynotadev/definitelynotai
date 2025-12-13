import { Hono } from 'hono';
import { TemplateManager, type Platform } from '@definitelynotai/templates';

import type { CloudflareBindings } from '../lib/env';
import type { AuthVariables } from '../middleware/auth';

const templates = new Hono<{ Bindings: CloudflareBindings; Variables: AuthVariables }>();
const manager = new TemplateManager();

/**
 * List all available templates
 * GET /api/v1/templates
 */
templates.get('/', (c) => {
  const allTemplates = manager.listTemplates();
  return c.json({
    templates: allTemplates.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      platform: t.platform,
    })),
  });
});

/**
 * Get template details by ID
 * GET /api/v1/templates/:id
 */
templates.get('/:id', (c) => {
  const template = manager.getTemplate(c.req.param('id'));

  if (!template) {
    return c.json({ error: 'Template not found', code: 'TEMPLATE_NOT_FOUND' }, 404);
  }

  return c.json({ template });
});

/**
 * Get template for a specific platform
 * GET /api/v1/templates/platform/:platform
 */
templates.get('/platform/:platform', (c) => {
  const platformParam = c.req.param('platform');
  const validPlatforms: Platform[] = ['web', 'mobile', 'api'];

  if (!validPlatforms.includes(platformParam as Platform)) {
    return c.json(
      {
        error: 'Invalid platform',
        code: 'INVALID_PLATFORM',
        validPlatforms,
      },
      400
    );
  }

  const platform = platformParam as Platform;
  const template = manager.getTemplateForPlatform(platform);

  if (!template) {
    return c.json(
      {
        error: 'No template available for this platform',
        code: 'NO_TEMPLATE_FOR_PLATFORM',
        platform,
      },
      404
    );
  }

  return c.json({ template });
});

/**
 * Preview template files (paths and sizes only)
 * GET /api/v1/templates/:id/files
 */
templates.get('/:id/files', async (c) => {
  const templateId = c.req.param('id');
  const template = manager.getTemplate(templateId);

  if (!template) {
    return c.json({ error: 'Template not found', code: 'TEMPLATE_NOT_FOUND' }, 404);
  }

  try {
    const files = await manager.readTemplateFiles(templateId);

    // Return just paths and sizes, not full content (for performance)
    const preview = files.map((f) => ({
      path: f.path,
      size: f.content.length,
      lines: f.content.split('\n').length,
    }));

    return c.json({
      templateId,
      templateName: template.name,
      fileCount: preview.length,
      totalSize: preview.reduce((sum, f) => sum + f.size, 0),
      files: preview,
    });
  } catch (error) {
    console.error('Failed to read template files:', error);
    return c.json(
      {
        error: 'Failed to read template files',
        code: 'TEMPLATE_READ_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

/**
 * Get injection points for a template
 * GET /api/v1/templates/:id/injection-points
 */
templates.get('/:id/injection-points', (c) => {
  const template = manager.getTemplate(c.req.param('id'));

  if (!template) {
    return c.json({ error: 'Template not found', code: 'TEMPLATE_NOT_FOUND' }, 404);
  }

  return c.json({
    templateId: template.id,
    templateName: template.name,
    injectionPoints: template.injectionPoints,
  });
});

/**
 * Get template dependencies
 * GET /api/v1/templates/:id/dependencies
 */
templates.get('/:id/dependencies', (c) => {
  const templateId = c.req.param('id');
  const template = manager.getTemplate(templateId);

  if (!template) {
    return c.json({ error: 'Template not found', code: 'TEMPLATE_NOT_FOUND' }, 404);
  }

  const deps = manager.getTemplateDependencies(templateId);

  return c.json({
    templateId: template.id,
    templateName: template.name,
    dependencies: deps.dependencies,
    devDependencies: deps.devDependencies,
  });
});

export { templates };
