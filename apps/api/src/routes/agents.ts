import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import {
  ModelRouter,
  createBuildAppWorkflow,
  createInitialState,
  getCouncil,
  AGENT_REGISTRY,
  type BuildAppState,
} from '@definitelynotai/agents';

import type { CloudflareBindings } from '../lib/env';
import type { AuthVariables } from '../middleware/auth';

/**
 * In-memory store for workflow states (Phase 5 will use database)
 */
const workflowStates = new Map<string, BuildAppState>();
const workflowPromises = new Map<string, Promise<BuildAppState>>();

/**
 * Input schemas
 */
const buildAppSchema = z.object({
  projectId: z.string().min(1),
  prompt: z.string().min(10).max(10000),
  platforms: z.array(z.string()).min(1).default(['web']),
});

const councilApprovalSchema = z.object({
  actionId: z.string().min(1),
  action: z.string().min(1),
  context: z.string().min(1),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
  proposer: z.string().min(1),
});

const agents = new Hono<{
  Bindings: CloudflareBindings;
  Variables: AuthVariables;
}>();

/**
 * Create a ModelRouter from environment bindings
 */
function createRouterFromEnv(env: CloudflareBindings): ModelRouter {
  return new ModelRouter({
    anthropicApiKey: env.ANTHROPIC_API_KEY,
    openaiApiKey: env.OPENAI_API_KEY,
    googleApiKey: env.GOOGLE_AI_API_KEY,
    xaiApiKey: env.XAI_API_KEY,
  });
}

/**
 * List available agents and their capabilities
 * GET /agents
 */
agents.get('/', (c) => {
  const agentList = Object.entries(AGENT_REGISTRY).map(([id, agent]) => ({
    id,
    name: agent.name,
    description: agent.description,
    model: agent.model,
    riskLevel: agent.riskLevel,
    permissions: agent.permissions,
  }));

  return c.json({
    data: agentList,
    meta: {
      total: agentList.length,
    },
  });
});

/**
 * Start a new app build workflow
 * POST /agents/build
 *
 * This initiates the LangGraph workflow:
 * planning → generating → validating → deploying → complete
 */
agents.post('/build', zValidator('json', buildAppSchema), async (c) => {
  const { userId } = c.get('auth');
  const { projectId, prompt, platforms } = c.req.valid('json');

  if (!userId) {
    return c.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401);
  }

  // Validate at least one LLM API key is configured
  if (
    !c.env.ANTHROPIC_API_KEY &&
    !c.env.OPENAI_API_KEY &&
    !c.env.GOOGLE_AI_API_KEY &&
    !c.env.XAI_API_KEY
  ) {
    return c.json(
      { error: 'No LLM API keys configured', code: 'NO_LLM_CONFIGURED' },
      500
    );
  }

  // Check if workflow already running for this project
  if (workflowPromises.has(projectId)) {
    return c.json(
      { error: 'Workflow already running for this project', code: 'WORKFLOW_IN_PROGRESS' },
      409
    );
  }

  // Create the initial state
  const initialState = createInitialState(projectId, prompt, platforms);
  workflowStates.set(projectId, initialState as BuildAppState);

  // Create router and workflow
  const router = createRouterFromEnv(c.env);
  const workflow = createBuildAppWorkflow(router);

  // Start the workflow asynchronously
  const workflowPromise = (async () => {
    try {
      // Stream events from the workflow
      const stream = await workflow.stream(initialState);

      let finalState: BuildAppState | null = null;

      for await (const event of stream) {
        // Update the stored state with each event
        // The event contains node outputs keyed by node name
        for (const [_nodeName, nodeOutput] of Object.entries(event)) {
          if (nodeOutput && typeof nodeOutput === 'object') {
            const currentState = workflowStates.get(projectId);
            if (currentState) {
              // Merge the node output into the current state
              const merged = {
                ...currentState,
                ...(nodeOutput as Partial<BuildAppState>),
              };
              workflowStates.set(projectId, merged);
              finalState = merged;
            }
          }
        }
      }

      return finalState ?? (workflowStates.get(projectId) as BuildAppState);
    } catch (error) {
      const errorState: BuildAppState = {
        ...(workflowStates.get(projectId) as BuildAppState),
        status: 'failed',
        errors: [
          {
            agent: 'system',
            message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date(),
          },
        ],
      };
      workflowStates.set(projectId, errorState);
      return errorState;
    } finally {
      workflowPromises.delete(projectId);
    }
  })();

  workflowPromises.set(projectId, workflowPromise);

  return c.json(
    {
      data: {
        projectId,
        status: 'planning',
        message: 'Build workflow started',
      },
    },
    202
  );
});

/**
 * Get the status of a build workflow
 * GET /agents/build/:projectId/status
 */
agents.get('/build/:projectId/status', async (c) => {
  const { userId } = c.get('auth');
  const projectId = c.req.param('projectId');

  if (!userId) {
    return c.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401);
  }

  const state = workflowStates.get(projectId);

  if (!state) {
    return c.json({ error: 'Workflow not found', code: 'NOT_FOUND' }, 404);
  }

  // Return sanitized state (remove potentially large generated code from summary)
  return c.json({
    data: {
      projectId: state.projectId,
      status: state.status,
      currentAgent: state.currentAgent,
      plan: state.plan,
      hasGeneratedCode: !!state.generatedCode,
      fileCount: state.generatedCode ? Object.keys(state.generatedCode).length : 0,
      testsPass: state.testsPass,
      securityPass: state.securityPass,
      qaApproved: state.qaApproved,
      errors: state.errors,
      logs: state.logs,
    },
  });
});

/**
 * Get the generated code for a completed workflow
 * GET /agents/build/:projectId/code
 */
agents.get('/build/:projectId/code', async (c) => {
  const { userId } = c.get('auth');
  const projectId = c.req.param('projectId');

  if (!userId) {
    return c.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401);
  }

  const state = workflowStates.get(projectId);

  if (!state) {
    return c.json({ error: 'Workflow not found', code: 'NOT_FOUND' }, 404);
  }

  if (!state.generatedCode) {
    return c.json({ error: 'No code generated yet', code: 'NO_CODE' }, 400);
  }

  return c.json({
    data: {
      projectId: state.projectId,
      plan: state.plan,
      files: state.generatedCode,
    },
  });
});

/**
 * Request council approval for a high-risk action
 * POST /agents/council/approve
 *
 * The council uses multiple AI models to vote on risky operations.
 * High-risk: Requires 2/2 approvals
 * Critical: Requires 2/2 approvals + human notification
 */
agents.post('/council/approve', zValidator('json', councilApprovalSchema), async (c) => {
  const { userId } = c.get('auth');
  const params = c.req.valid('json');

  if (!userId) {
    return c.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401);
  }

  // Validate at least one LLM API key is configured
  if (
    !c.env.ANTHROPIC_API_KEY &&
    !c.env.OPENAI_API_KEY &&
    !c.env.GOOGLE_AI_API_KEY &&
    !c.env.XAI_API_KEY
  ) {
    return c.json(
      { error: 'No LLM API keys configured', code: 'NO_LLM_CONFIGURED' },
      500
    );
  }

  const router = createRouterFromEnv(c.env);
  const council = getCouncil(router);

  // Check if council approval is even needed
  if (!council.requiresApproval(params.riskLevel)) {
    return c.json({
      data: {
        actionId: params.actionId,
        approved: true,
        requiresHuman: false,
        reasoning: 'Auto-approved: Low/medium risk action',
        votes: [],
      },
    });
  }

  // Request council approval
  const decision = await council.requestApproval(params);

  return c.json({
    data: {
      actionId: decision.actionId,
      action: decision.action,
      riskLevel: decision.riskLevel,
      approved: decision.approved,
      requiresHuman: decision.requiresHuman,
      reasoning: decision.reasoning,
      votes: decision.votes.map((v) => ({
        model: v.model,
        approved: v.approved,
        reasoning: v.reasoning,
        concerns: v.concerns,
      })),
      timestamp: decision.timestamp,
    },
  });
});

/**
 * Get council configuration for a risk level
 * GET /agents/council/config/:riskLevel
 */
agents.get('/council/config/:riskLevel', (c) => {
  const { userId } = c.get('auth');
  const riskLevel = c.req.param('riskLevel');

  if (!userId) {
    return c.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401);
  }

  if (riskLevel !== 'high' && riskLevel !== 'critical') {
    return c.json(
      {
        data: {
          riskLevel,
          requiresCouncil: false,
          message: 'Low/medium risk actions are auto-approved',
        },
      }
    );
  }

  const router = new ModelRouter({});
  const council = getCouncil(router);
  const config = council.getConfig(riskLevel);

  return c.json({
    data: {
      riskLevel,
      requiresCouncil: true,
      requiredVotes: config.requiredVotes,
      models: config.models,
      timeout: config.timeout,
      requiresHuman: config.requiresHuman,
    },
  });
});

export { agents };
