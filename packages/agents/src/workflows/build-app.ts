import { StateGraph, Annotation, END, START } from '@langchain/langgraph';
import { z } from 'zod';
import { SandboxManager, CodeValidator } from '@definitelynotai/sandbox';
import { TemplateManager, type Platform } from '@definitelynotai/templates';
import { DeploymentOrchestrator, type OrchestratorConfig } from '@definitelynotai/deploy';
import { AGENT_REGISTRY } from '../agents/registry.js';
import { ModelRouter } from '../router/model-router.js';

/**
 * Build App Workflow State Schema (Zod for validation)
 */
export const BuildAppStateSchema = z.object({
  // Input
  projectId: z.string(),
  prompt: z.string(),
  platforms: z.array(z.string()),

  // Progress tracking
  status: z.enum(['planning', 'generating', 'validating', 'deploying', 'complete', 'failed']),
  currentAgent: z.string().optional(),

  // Artifacts
  plan: z
    .object({
      appName: z.string(),
      summary: z.string(),
      features: z.array(z.string()),
      dataModels: z.array(
        z.object({
          name: z.string(),
          fields: z.array(z.string()),
        })
      ),
      apiEndpoints: z.array(z.string()),
    })
    .optional(),

  generatedCode: z.record(z.string()).optional(), // filename -> content

  // Validation
  testsPass: z.boolean().optional(),
  securityPass: z.boolean().optional(),
  qaApproved: z.boolean().optional(),

  // Deployment
  deployed: z.boolean().optional(),
  deployedUrls: z.record(z.string()).optional(),

  // Errors
  errors: z.array(
    z.object({
      agent: z.string(),
      message: z.string(),
      timestamp: z.date(),
    })
  ),

  // Logs
  logs: z.array(
    z.object({
      agent: z.string(),
      step: z.string(),
      message: z.string(),
      model: z.string(),
      tokens: z.number(),
      timestamp: z.date(),
    })
  ),
});

export type BuildAppState = z.infer<typeof BuildAppStateSchema>;

/**
 * Log entry type
 */
type LogEntry = {
  agent: string;
  step: string;
  message: string;
  model: string;
  tokens: number;
  timestamp: Date;
};

/**
 * Error entry type
 */
type ErrorEntry = {
  agent: string;
  message: string;
  timestamp: Date;
};

/**
 * Plan type
 */
type Plan = {
  appName: string;
  summary: string;
  features: string[];
  dataModels: { name: string; fields: string[] }[];
  apiEndpoints: string[];
};

/**
 * LangGraph State Annotation for Build App Workflow
 */
const BuildAppAnnotation = Annotation.Root({
  projectId: Annotation<string>(),
  prompt: Annotation<string>(),
  platforms: Annotation<string[]>({
    reducer: (_, b) => b ?? [],
    default: () => [],
  }),
  status: Annotation<BuildAppState['status']>({
    reducer: (_, b) => b ?? 'planning',
    default: () => 'planning',
  }),
  currentAgent: Annotation<string | undefined>({
    reducer: (_, b) => b,
    default: () => undefined,
  }),
  plan: Annotation<Plan | undefined>({
    reducer: (_, b) => b,
    default: () => undefined,
  }),
  generatedCode: Annotation<Record<string, string> | undefined>({
    reducer: (a, b) => (b ? { ...a, ...b } : a),
    default: () => undefined,
  }),
  testsPass: Annotation<boolean | undefined>({
    reducer: (_, b) => b,
    default: () => undefined,
  }),
  securityPass: Annotation<boolean | undefined>({
    reducer: (_, b) => b,
    default: () => undefined,
  }),
  qaApproved: Annotation<boolean | undefined>({
    reducer: (_, b) => b,
    default: () => undefined,
  }),
  deployed: Annotation<boolean | undefined>({
    reducer: (_, b) => b,
    default: () => undefined,
  }),
  deployedUrls: Annotation<Record<string, string> | undefined>({
    reducer: (_, b) => b,
    default: () => undefined,
  }),
  errors: Annotation<ErrorEntry[]>({
    reducer: (a, b) => [...(a || []), ...(b || [])],
    default: () => [],
  }),
  logs: Annotation<LogEntry[]>({
    reducer: (a, b) => [...(a || []), ...(b || [])],
    default: () => [],
  }),
});

type BuildAppAnnotationState = typeof BuildAppAnnotation.State;

/**
 * Initial state for a new build workflow
 */
export function createInitialState(
  projectId: string,
  prompt: string,
  platforms: string[]
): BuildAppAnnotationState {
  return {
    projectId,
    prompt,
    platforms,
    status: 'planning',
    currentAgent: 'planner',
    plan: undefined,
    generatedCode: undefined,
    testsPass: undefined,
    securityPass: undefined,
    qaApproved: undefined,
    deployed: undefined,
    deployedUrls: undefined,
    errors: [],
    logs: [],
  };
}

/**
 * Create the Build App LangGraph workflow
 *
 * Stages: planning → generating → validating → deploying → complete
 *
 * Each stage uses the appropriate model based on task type via the ModelRouter.
 */
export function createBuildAppWorkflow(router: ModelRouter) {
  /**
   * Planning Node
   * Uses the Planner agent to create a detailed app specification
   */
  async function planningNode(
    state: BuildAppAnnotationState
  ): Promise<Partial<BuildAppAnnotationState>> {
    const agent = AGENT_REGISTRY.planner;
    if (!agent) {
      return {
        status: 'failed',
        errors: [
          {
            agent: 'system',
            message: 'Planner agent not found in registry',
            timestamp: new Date(),
          },
        ],
      };
    }

    const response = await router.complete({
      taskType: 'plan',
      systemPrompt: agent.systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Create a detailed plan for this app:

User Prompt: ${state.prompt}
Target Platforms: ${state.platforms.join(', ')}

Output a JSON object with:
- appName: string
- summary: string (2-3 sentences)
- features: string[] (list of features)
- dataModels: Array<{ name: string, fields: string[] }>
- apiEndpoints: string[] (e.g., "GET /api/todos", "POST /api/todos")

Respond with ONLY valid JSON.`,
        },
      ],
    });

    try {
      const plan = JSON.parse(response.content) as Plan;
      return {
        status: 'generating',
        currentAgent: 'backend',
        plan,
        logs: [
          {
            agent: 'planner',
            step: 'planning',
            message: `Created plan for "${plan.appName}" with ${plan.features.length} features`,
            model: response.model,
            tokens: response.usage.inputTokens + response.usage.outputTokens,
            timestamp: new Date(),
          },
        ],
      };
    } catch (e) {
      return {
        status: 'failed',
        errors: [
          {
            agent: 'planner',
            message: `Failed to parse plan: ${e}`,
            timestamp: new Date(),
          },
        ],
      };
    }
  }

  /**
   * Generating Node
   * Uses templates + Backend agent to generate code based on the plan
   */
  async function generatingNode(
    state: BuildAppAnnotationState
  ): Promise<Partial<BuildAppAnnotationState>> {
    const templateManager = new TemplateManager();
    const agent = AGENT_REGISTRY.backend;

    if (!agent) {
      return {
        status: 'failed',
        errors: [
          {
            agent: 'system',
            message: 'Backend agent not found in registry',
            timestamp: new Date(),
          },
        ],
      };
    }

    // Determine which template to use based on primary platform
    const platform = (state.platforms[0] || 'web') as Platform;
    const template = templateManager.getTemplateForPlatform(platform);

    if (!template) {
      return {
        status: 'failed',
        errors: [
          {
            agent: 'backend',
            message: `No template available for platform: ${platform}`,
            timestamp: new Date(),
          },
        ],
      };
    }

    // Generate only the injection content (not full files)
    const response = await router.complete({
      taskType: 'code_backend',
      systemPrompt: agent.systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Generate code to inject into a ${template.name} template.

App Plan:
${JSON.stringify(state.plan, null, 2)}

Available injection points:
${template.injectionPoints.map((p) => `- ${p.marker}: ${p.description}`).join('\n')}

For each relevant injection point, generate appropriate TypeScript code.
Output JSON with marker -> code mapping:
{
  "@agent:inject:schema": "export const todos = pgTable('todos', { id: text('id').primaryKey(), ... });",
  "@agent:inject:routes": "routes.get('/todos', async (c) => { ... });",
  ...
}

Rules:
- Generate ONLY code for injection points, not full files
- Use Drizzle ORM for schema definitions
- Use Hono patterns for routes
- Include proper TypeScript types
- Follow the template's existing patterns

Respond with ONLY valid JSON.`,
        },
      ],
      maxTokens: 8000,
    });

    try {
      const injections = JSON.parse(response.content) as Record<string, string>;

      // Convert to InjectionRequest array
      const injectionRequests = Object.entries(injections).map(([marker, content]) => ({
        marker,
        content: content as string,
      }));

      // Prepare template with injections and customizations
      const customizations: { appName?: string; description?: string } = {};
      if (state.plan?.appName) {
        customizations.appName = state.plan.appName;
      }
      if (state.plan?.summary) {
        customizations.description = state.plan.summary;
      }

      const files = await templateManager.prepareTemplate(
        template.id,
        injectionRequests,
        Object.keys(customizations).length > 0 ? customizations : undefined
      );

      return {
        status: 'validating',
        currentAgent: 'qa',
        generatedCode: files,
        logs: [
          {
            agent: 'backend',
            step: 'generating',
            message: `Generated ${Object.keys(files).length} files from ${template.name} template with ${injectionRequests.length} injections`,
            model: response.model,
            tokens: response.usage.inputTokens + response.usage.outputTokens,
            timestamp: new Date(),
          },
        ],
      };
    } catch (e) {
      return {
        status: 'failed',
        errors: [
          {
            agent: 'backend',
            message: `Failed to generate from template: ${e instanceof Error ? e.message : String(e)}`,
            timestamp: new Date(),
          },
        ],
      };
    }
  }

  /**
   * Validating Node
   * Uses E2B sandbox to validate generated code with real compilation and tests
   */
  async function validatingNode(
    state: BuildAppAnnotationState
  ): Promise<Partial<BuildAppAnnotationState>> {
    const e2bApiKey = process.env.E2B_API_KEY;
    if (!e2bApiKey) {
      return {
        status: 'failed',
        errors: [
          {
            agent: 'qa',
            message: 'E2B_API_KEY not configured',
            timestamp: new Date(),
          },
        ],
      };
    }

    const manager = new SandboxManager(e2bApiKey);
    const validator = new CodeValidator(manager);

    try {
      // Validate in sandbox
      const result = await validator.fullValidate(state.projectId, state.generatedCode || {});

      // Cleanup sandbox
      await validator.cleanup(state.projectId);

      if (result.valid) {
        return {
          status: 'deploying',
          currentAgent: 'deploy',
          testsPass: true,
          securityPass: true,
          qaApproved: true,
          logs: [
            {
              agent: 'qa',
              step: 'validating',
              message: `Validation passed with ${result.warnings.length} warnings`,
              model: 'e2b-sandbox',
              tokens: 0,
              timestamp: new Date(),
            },
          ],
        };
      } else {
        // Validation failed - could retry with fixes
        const errorMessages = result.errors.map((e) => e.message).join('; ');

        return {
          status: 'failed',
          qaApproved: false,
          errors: [
            {
              agent: 'qa',
              message: `Validation failed: ${errorMessages}`,
              timestamp: new Date(),
            },
          ],
          logs: [
            {
              agent: 'qa',
              step: 'validating',
              message: `Found ${result.errors.length} errors`,
              model: 'e2b-sandbox',
              tokens: 0,
              timestamp: new Date(),
            },
          ],
        };
      }
    } catch (error) {
      await manager.destroyAll(); // Cleanup on error

      return {
        status: 'failed',
        errors: [
          {
            agent: 'qa',
            message: `Sandbox error: ${error instanceof Error ? error.message : String(error)}`,
            timestamp: new Date(),
          },
        ],
      };
    }
  }

  /**
   * Deploying Node
   * Uses the DeploymentOrchestrator to deploy the generated app
   */
  async function deployingNode(
    state: BuildAppAnnotationState
  ): Promise<Partial<BuildAppAnnotationState>> {
    const ghToken = process.env.GH_TOKEN;
    const cfApiToken = process.env.CLOUDFLARE_API_TOKEN;
    const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;

    if (!ghToken || !cfApiToken || !cfAccountId) {
      return {
        status: 'failed',
        errors: [
          {
            agent: 'deploy',
            message: 'Missing required environment variables: GH_TOKEN, CLOUDFLARE_API_TOKEN, or CLOUDFLARE_ACCOUNT_ID',
            timestamp: new Date(),
          },
        ],
      };
    }

    const orchestratorConfig: OrchestratorConfig = {
      github: {
        token: ghToken,
      },
      cloudflare: {
        apiToken: cfApiToken,
        accountId: cfAccountId,
      },
    };

    if (process.env.EXPO_TOKEN) {
      orchestratorConfig.eas = {
        token: process.env.EXPO_TOKEN,
      };
    }

    const orchestrator = new DeploymentOrchestrator(orchestratorConfig);

    await orchestrator.init();

    try {
      const result = await orchestrator.deploy({
        projectId: state.projectId,
        projectName: state.plan?.appName || `app-${state.projectId}`,
        files: state.generatedCode || {},
        platforms: state.platforms as Array<'web' | 'api' | 'mobile'>,
        secrets: {
          DATABASE_URL: process.env.DATABASE_URL || '',
        },
        environment: 'preview',
      });

      // Collect deployment URLs
      const deploymentUrls: Record<string, string> = {};
      if (result.deployments) {
        for (const deployment of result.deployments) {
          if (deployment.success && deployment.url) {
            deploymentUrls[deployment.platform] = deployment.url;
          }
        }
      }

      const successCount = result.deployments?.filter((d) => d.success).length || 0;

      return {
        status: 'complete',
        currentAgent: undefined,
        deployed: true,
        deployedUrls: deploymentUrls,
        logs: [
          {
            agent: 'deploy',
            step: 'deploying',
            message: `Deployed to ${successCount} platforms`,
            model: 'deployment-orchestrator',
            tokens: 0,
            timestamp: new Date(),
          },
          ...(result.deployments?.map((d) => ({
            agent: 'deploy',
            step: 'deploying',
            message: d.success
              ? `${d.platform}: ${d.url}`
              : `${d.platform}: Failed - ${d.error}`,
            model: 'deployment-orchestrator',
            tokens: 0,
            timestamp: new Date(),
          })) || []),
        ],
      };
    } catch (error) {
      return {
        status: 'failed',
        errors: [
          {
            agent: 'deploy',
            message: `Deployment failed: ${error instanceof Error ? error.message : String(error)}`,
            timestamp: new Date(),
          },
        ],
      };
    }
  }

  /**
   * Routing logic after validation
   */
  function routeAfterValidation(state: BuildAppAnnotationState): typeof END | 'deploying' {
    if (state.status === 'failed') {
      return END;
    }
    if (state.qaApproved) {
      return 'deploying';
    }
    // Could add retry logic here in the future
    return END;
  }

  // Create the state graph with the annotation
  const workflow = new StateGraph(BuildAppAnnotation)
    .addNode('planning', planningNode)
    .addNode('generating', generatingNode)
    .addNode('validating', validatingNode)
    .addNode('deploying', deployingNode)
    .addEdge(START, 'planning')
    .addEdge('planning', 'generating')
    .addEdge('generating', 'validating')
    .addConditionalEdges('validating', routeAfterValidation)
    .addEdge('deploying', END);

  // Compile and return the workflow
  return workflow.compile();
}

/**
 * Type for the compiled workflow
 */
export type BuildAppWorkflow = ReturnType<typeof createBuildAppWorkflow>;
