import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { DeploymentOrchestrator, CloudflareClient } from '@definitelynotai/deploy';
import type { CloudflareBindings } from '../lib/env';
import type { AuthVariables } from '../middleware/auth';

const deploy = new Hono<{ Bindings: CloudflareBindings; Variables: AuthVariables }>();

/**
 * Full deployment request schema
 */
const deployRequestSchema = z.object({
  projectId: z.string().min(1),
  projectName: z.string().min(1),
  files: z.record(z.string()),
  platforms: z.array(z.enum(['web', 'api', 'mobile'])).min(1),
  secrets: z.record(z.string()).optional(),
  environment: z.enum(['preview', 'production']).optional(),
});

/**
 * Quick deployment request schema
 */
const quickDeployRequestSchema = z.object({
  projectId: z.string().min(1),
  projectName: z.string().min(1),
  files: z.record(z.string()),
  platforms: z.array(z.enum(['web', 'api', 'mobile'])).min(1),
  secrets: z.record(z.string()).optional(),
});

/**
 * POST /deploy
 * Full deployment pipeline: GitHub repo + platform deployments
 */
deploy.post('/', zValidator('json', deployRequestSchema), async (c) => {
  const body = c.req.valid('json');

  // Validate required environment variables
  const ghToken = c.env.GH_TOKEN;
  const cfApiToken = c.env.CLOUDFLARE_API_TOKEN;
  const cfAccountId = c.env.CLOUDFLARE_ACCOUNT_ID;

  if (!ghToken || !cfApiToken || !cfAccountId) {
    return c.json(
      {
        error: 'MISSING_CREDENTIALS',
        message: 'Missing required deployment credentials (GH_TOKEN, CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID)',
      },
      500
    );
  }

  const orchestratorConfig: {
    github: { token: string };
    cloudflare: { apiToken: string; accountId: string };
    eas?: { token: string };
  } = {
    github: { token: ghToken },
    cloudflare: { apiToken: cfApiToken, accountId: cfAccountId },
  };

  if (c.env.EXPO_TOKEN) {
    orchestratorConfig.eas = { token: c.env.EXPO_TOKEN };
  }

  const orchestrator = new DeploymentOrchestrator(orchestratorConfig);

  try {
    await orchestrator.init();

    const deployOptions: Parameters<typeof orchestrator.deploy>[0] = {
      projectId: body.projectId,
      projectName: body.projectName,
      files: body.files,
      platforms: body.platforms,
    };
    if (body.secrets) {
      deployOptions.secrets = body.secrets;
    }
    if (body.environment) {
      deployOptions.environment = body.environment;
    }

    const result = await orchestrator.deploy(deployOptions);

    return c.json({
      success: true,
      github: result.github,
      deployments: result.deployments,
    });
  } catch (error) {
    return c.json(
      {
        error: 'DEPLOYMENT_FAILED',
        message: error instanceof Error ? error.message : 'Deployment failed',
      },
      500
    );
  }
});

/**
 * POST /deploy/quick
 * Quick deployment: GitHub repo only, CI handles the rest
 */
deploy.post('/quick', zValidator('json', quickDeployRequestSchema), async (c) => {
  const body = c.req.valid('json');

  const ghToken = c.env.GH_TOKEN;
  const cfApiToken = c.env.CLOUDFLARE_API_TOKEN;
  const cfAccountId = c.env.CLOUDFLARE_ACCOUNT_ID;

  if (!ghToken || !cfApiToken || !cfAccountId) {
    return c.json(
      {
        error: 'MISSING_CREDENTIALS',
        message: 'Missing required deployment credentials',
      },
      500
    );
  }

  const orchestratorConfig: {
    github: { token: string };
    cloudflare: { apiToken: string; accountId: string };
    eas?: { token: string };
  } = {
    github: { token: ghToken },
    cloudflare: { apiToken: cfApiToken, accountId: cfAccountId },
  };

  if (c.env.EXPO_TOKEN) {
    orchestratorConfig.eas = { token: c.env.EXPO_TOKEN };
  }

  const orchestrator = new DeploymentOrchestrator(orchestratorConfig);

  try {
    await orchestrator.init();

    const quickDeployOptions: Parameters<typeof orchestrator.quickDeploy>[0] = {
      projectId: body.projectId,
      projectName: body.projectName,
      files: body.files,
      platforms: body.platforms,
    };
    if (body.secrets) {
      quickDeployOptions.secrets = body.secrets;
    }

    const result = await orchestrator.quickDeploy(quickDeployOptions);

    return c.json({
      success: true,
      github: result.github,
      message: 'Code pushed to GitHub. CI will handle deployment.',
    });
  } catch (error) {
    return c.json(
      {
        error: 'QUICK_DEPLOY_FAILED',
        message: error instanceof Error ? error.message : 'Quick deployment failed',
      },
      500
    );
  }
});

/**
 * GET /deploy/status/:projectName/:deploymentId
 * Get deployment status from Cloudflare
 */
deploy.get('/status/:projectName/:deploymentId', async (c) => {
  const { projectName, deploymentId } = c.req.param();

  const cfApiToken = c.env.CLOUDFLARE_API_TOKEN;
  const cfAccountId = c.env.CLOUDFLARE_ACCOUNT_ID;

  if (!cfApiToken || !cfAccountId) {
    return c.json(
      {
        error: 'MISSING_CREDENTIALS',
        message: 'Missing Cloudflare credentials',
      },
      500
    );
  }

  const cloudflare = new CloudflareClient(cfApiToken, cfAccountId);

  try {
    const status = await cloudflare.getDeploymentStatus(projectName, deploymentId);
    return c.json(status);
  } catch (error) {
    return c.json(
      {
        error: 'STATUS_CHECK_FAILED',
        message: error instanceof Error ? error.message : 'Failed to get deployment status',
      },
      500
    );
  }
});

export { deploy };
