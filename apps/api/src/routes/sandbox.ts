import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { SandboxManager, CodeValidator } from '@definitelynotai/sandbox';

import type { CloudflareBindings } from '../lib/env';
import type { AuthVariables } from '../middleware/auth';

/**
 * Sandbox managers cache (keyed by API key to support different environments)
 */
const managers = new Map<string, SandboxManager>();
const validators = new Map<string, CodeValidator>();

function getManager(apiKey: string): SandboxManager {
  if (!managers.has(apiKey)) {
    managers.set(apiKey, new SandboxManager(apiKey));
  }
  return managers.get(apiKey)!;
}

function getValidator(apiKey: string): CodeValidator {
  if (!validators.has(apiKey)) {
    validators.set(apiKey, new CodeValidator(getManager(apiKey)));
  }
  return validators.get(apiKey)!;
}

const sandbox = new Hono<{
  Bindings: CloudflareBindings;
  Variables: AuthVariables;
}>();

/**
 * Validate code in sandbox
 * POST /sandbox/validate
 */
const validateSchema = z.object({
  projectId: z.string().min(1),
  files: z.record(z.string()), // filename -> content
  options: z
    .object({
      installDeps: z.boolean().optional(),
      runTypeCheck: z.boolean().optional(),
      runLint: z.boolean().optional(),
      runBuild: z.boolean().optional(),
    })
    .optional(),
});

sandbox.post('/validate', zValidator('json', validateSchema), async (c) => {
  const { userId } = c.get('auth');
  const { projectId, files, options } = c.req.valid('json');

  if (!userId) {
    return c.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401);
  }

  if (!c.env.E2B_API_KEY) {
    return c.json(
      {
        error: 'E2B_API_KEY not configured',
        code: 'E2B_NOT_CONFIGURED',
      },
      500
    );
  }

  const validator = getValidator(c.env.E2B_API_KEY);

  try {
    // Build options explicitly to satisfy exactOptionalPropertyTypes
    const validationOptions: {
      installDeps?: boolean;
      runTypeCheck?: boolean;
      runLint?: boolean;
      runBuild?: boolean;
      startDevServer?: boolean;
    } = {};
    if (options?.installDeps !== undefined) validationOptions.installDeps = options.installDeps;
    if (options?.runTypeCheck !== undefined) validationOptions.runTypeCheck = options.runTypeCheck;
    if (options?.runLint !== undefined) validationOptions.runLint = options.runLint;
    if (options?.runBuild !== undefined) validationOptions.runBuild = options.runBuild;

    const result = await validator.validateProject(projectId, files, validationOptions);

    // Always cleanup after validation
    await validator.cleanup(projectId);

    return c.json({
      data: result,
    });
  } catch (error) {
    return c.json(
      {
        data: {
          valid: false,
          errors: [
            {
              type: 'runtime',
              message: error instanceof Error ? error.message : 'Validation failed',
            },
          ],
          warnings: [],
        },
      },
      500
    );
  }
});

/**
 * Execute code snippet (for testing)
 * POST /sandbox/execute
 */
const executeSchema = z.object({
  projectId: z.string().min(1),
  code: z.string().min(1),
  language: z.enum(['javascript', 'typescript', 'python']).optional(),
});

sandbox.post('/execute', zValidator('json', executeSchema), async (c) => {
  const { userId } = c.get('auth');
  const { projectId, code, language } = c.req.valid('json');

  if (!userId) {
    return c.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401);
  }

  if (!c.env.E2B_API_KEY) {
    return c.json(
      {
        error: 'E2B_API_KEY not configured',
        code: 'E2B_NOT_CONFIGURED',
      },
      500
    );
  }

  const manager = getManager(c.env.E2B_API_KEY);

  try {
    // Create sandbox if doesn't exist
    if (!manager.getSandbox(projectId)) {
      await manager.createSandbox(projectId);
    }

    const result = await manager.executeCode(projectId, code, language);

    return c.json({
      data: result,
    });
  } catch (error) {
    return c.json(
      {
        data: {
          stdout: '',
          stderr: error instanceof Error ? error.message : 'Execution failed',
          exitCode: 1,
          error: String(error),
        },
      },
      500
    );
  }
});

/**
 * Cleanup sandbox
 * DELETE /sandbox/:projectId
 */
sandbox.delete('/:projectId', async (c) => {
  const { userId } = c.get('auth');
  const projectId = c.req.param('projectId');

  if (!userId) {
    return c.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401);
  }

  if (!c.env.E2B_API_KEY) {
    return c.json(
      {
        error: 'E2B_API_KEY not configured',
        code: 'E2B_NOT_CONFIGURED',
      },
      500
    );
  }

  const manager = getManager(c.env.E2B_API_KEY);
  await manager.destroySandbox(projectId);

  return c.json({
    data: { deleted: true, projectId },
  });
});

/**
 * Get sandbox status
 * GET /sandbox/:projectId/status
 */
sandbox.get('/:projectId/status', async (c) => {
  const { userId } = c.get('auth');
  const projectId = c.req.param('projectId');

  if (!userId) {
    return c.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401);
  }

  if (!c.env.E2B_API_KEY) {
    return c.json(
      {
        error: 'E2B_API_KEY not configured',
        code: 'E2B_NOT_CONFIGURED',
      },
      500
    );
  }

  const manager = getManager(c.env.E2B_API_KEY);
  const sandboxInstance = manager.getSandbox(projectId);

  return c.json({
    data: {
      exists: !!sandboxInstance,
      projectId,
    },
  });
});

export { sandbox };
