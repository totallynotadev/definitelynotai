# Definitely Not AI - Claude Code Context

> **Read this first.** This file provides Claude Code with essential context about the project architecture, conventions, and common tasks.

## 📚 Additional Documentation

For deeper context, also read these files:
- **[PROJECT_BIBLE.md](./PROJECT_BIBLE.md)** — Comprehensive architecture, patterns, and decisions
- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** — Technical deep-dive, ADRs, data flows

---

## What Is This Project?

**Definitely Not AI** is an Agentic OS that transforms natural language into deployed applications. Users describe apps in plain English, and AI agents automatically plan, generate, validate, and deploy them.

```
User: "Build me a fitness tracker"
                ↓
    AI Agents (Plan → Generate → Validate → Deploy)
                ↓
    Live web app + mobile apps + API
```

## Repository Structure

```
definitelynotai/
├── apps/
│   ├── web/          # SvelteKit control plane (Cloudflare Pages)
│   └── api/          # Hono API server (Cloudflare Workers)
├── packages/
│   ├── shared/       # Types, utilities, Zod schemas, constants
│   ├── db/           # Drizzle ORM + Neon Postgres
│   ├── ui/           # shadcn-svelte components
│   ├── agents/       # LangGraph workflows, model router, council
│   ├── sandbox/      # E2B sandboxes, code validation, Modal
│   ├── templates/    # Starter templates (SvelteKit, Expo, Hono)
│   ├── deploy/       # GitHub, Cloudflare, EAS deployment
│   └── observability/# Langfuse tracing, cost tracking
├── turbo.json        # Turborepo build config
├── package.json      # Bun workspace root
└── tsconfig.json     # Base TypeScript config
```

## Tech Stack Quick Reference

| Layer | Technology |
|-------|------------|
| **Web App** | SvelteKit + Tailwind + shadcn-svelte |
| **API** | Hono + Zod validation |
| **Database** | Neon Postgres + Drizzle ORM |
| **Auth** | Clerk |
| **Agent Orchestration** | LangGraph + LiteLLM |
| **Code Execution** | E2B sandboxes |
| **Long Compute** | Modal |
| **Deployment** | Cloudflare Pages/Workers + EAS |
| **Real-time** | PartyKit |
| **Observability** | Langfuse |

## Package Dependencies

```
apps/web ────────────────┐
apps/api ────────────────┼──→ @definitelynotai/shared
                         │         ↑
packages/agents ─────────┤         │
packages/sandbox ────────┤    @definitelynotai/db
packages/templates ──────┤         ↑
packages/deploy ─────────┤         │
packages/observability ──┘    @definitelynotai/ui
```

## Multi-Model Agent System

Different AI models handle different tasks:

| Model | Tasks |
|-------|-------|
| **Claude Opus 4.5** | Orchestration, QA review, security |
| **Claude Sonnet 4.5** | Backend code, deployment, debugging |
| **GPT-5.2** | Planning specs, documentation |
| **Gemini 3 Pro** | Frontend/UI, visual tasks |
| **Grok 4.1** | Real-time queries, support |

## Code Style

### TypeScript
```typescript
// Use `type` over `interface`
type User = {
  id: string;
  email: string;
};

// Zod for runtime validation
const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
});
type User = z.infer<typeof userSchema>;

// Path aliases
import { db } from '@/lib/db';           // Within app
import { User } from '@definitelynotai/shared';  // Cross-package
```

### SvelteKit Routes
```
src/routes/
├── +layout.svelte       # Root layout
├── +page.svelte         # Dashboard (/)
├── projects/
│   ├── +page.svelte     # List (/projects)
│   └── [id]/
│       └── +page.svelte # Detail (/projects/[id])
```

### Hono API Routes
```typescript
// apps/api/src/routes/projects.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';

const projects = new Hono();

projects.get('/', async (c) => {
  // List projects
  return c.json({ projects: [] });
});

projects.post('/', zValidator('json', createProjectSchema), async (c) => {
  const data = c.req.valid('json');
  // Create project
  return c.json({ project }, 201);
});

export { projects };
```

### Error Handling
```typescript
// API - always structured errors
return c.json({ error: 'Not found', code: 'PROJECT_NOT_FOUND' }, 404);

// Agents - log to Langfuse AND database
trace.event({ name: 'error', metadata: { error: e.message } });
await db.insert(agentLogs).values({
  projectId,
  step: 'generating',
  message: e.message,
  status: 'error',
});
```

## Database Schema

```typescript
// packages/db/src/schema.ts
// Key tables:

users: id, clerkId, email, name, createdAt
projects: id, userId, name, prompt, status, platforms, plan, createdAt, updatedAt
deployments: id, projectId, platform, url, status, createdAt
agent_logs: id, projectId, step, message, agentId, modelUsed, inputTokens, outputTokens
artifacts: id, projectId, type, name, content, version
council_decisions: id, projectId, actionId, riskLevel, approved, votes
```

**ID Convention**: All IDs are `nanoid` strings, not UUIDs.

## Template Injection Markers

Templates use markers for code injection:

```typescript
// @agent:inject:schema     → Database schema
// @agent:inject:routes     → API routes
// @agent:inject:components → UI components
// @agent:inject:store      → Zustand state
// @agent:inject:types      → TypeScript types
```

## Common Commands

```bash
# Development
bun install          # Install dependencies
bun run dev          # Start web + api
bun run build        # Build all
bun run typecheck    # TypeScript check
bun run lint         # ESLint

# Database
bun run db:generate  # Generate migrations
bun run db:migrate   # Run migrations
bun run db:studio    # Open Drizzle Studio

# Package-specific
cd apps/api && bunx wrangler dev     # Local Workers dev
cd apps/web && bun run dev           # Local SvelteKit dev
cd packages/sandbox && bun run test  # Run sandbox tests
```

## Environment Variables

Required in `.env.local`:

```bash
# Database
DATABASE_URL=postgresql://...@neon.tech/definitelynotai

# Auth
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# AI
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# Execution
E2B_API_KEY=e2b_...
MODAL_TOKEN_ID=...
MODAL_TOKEN_SECRET=...

# Deployment
GH_TOKEN=ghp_...
CLOUDFLARE_API_TOKEN=...
CLOUDFLARE_ACCOUNT_ID=...

# Observability
LANGFUSE_PUBLIC_KEY=pk-...
LANGFUSE_SECRET_KEY=sk-...
```

## Agent Workflow

```
planning → generating → validating → deploying → complete
    │           │            │            │
    ▼           ▼            ▼            ▼
 GPT-5.2    Sonnet 4.5   Opus 4.5    Sonnet 4.5
```

**State Shape:**
```typescript
interface BuildAppState {
  projectId: string;
  prompt: string;
  platforms: string[];
  status: 'planning' | 'generating' | 'validating' | 'deploying' | 'complete' | 'failed';
  plan?: Plan;
  generatedCode?: Record<string, string>;
  qaApproved?: boolean;
  errors: Array<{ agent: string; message: string; timestamp: Date }>;
  logs: Array<{ agent: string; step: string; model: string; tokens: number }>;
}
```

## Key Files to Know

| File | Purpose |
|------|---------|
| `packages/agents/src/router/model-router.ts` | Routes tasks to appropriate models |
| `packages/agents/src/workflows/build-app.ts` | Main LangGraph workflow |
| `packages/agents/src/council/council.ts` | Multi-model approval system |
| `packages/sandbox/src/manager.ts` | E2B sandbox lifecycle |
| `packages/sandbox/src/validator.ts` | Code validation in sandbox |
| `packages/templates/src/manager.ts` | Template operations |
| `packages/deploy/src/orchestrator.ts` | Deployment coordination |
| `apps/api/src/routes/agents.ts` | Agent API endpoints |

## Deployment Flow

```
Generated Code → GitHub Repo → Set Secrets → Deploy
                                    ↓
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
              Cloudflare      Cloudflare         EAS
                Pages          Workers          Build
                (web)          (api)          (mobile)
```

## Troubleshooting

### Module not found
```bash
bun install  # Re-link workspaces
```

### TypeScript errors in .svelte files
```bash
# Ensure typescript-svelte-plugin is installed
# Check svelte.config.js has TypeScript preprocessor
```

### E2B timeout
```typescript
// Increase timeout
await sandboxManager.createSandbox(projectId, { timeout: 600000 });
```

### Workers deployment fails
```bash
# Check wrangler.toml is valid
# Verify CLOUDFLARE_API_TOKEN permissions
bunx wrangler whoami  # Test auth
```

## Adding a New Package

```bash
# 1. Create directory
mkdir -p packages/newpkg/src

# 2. Create package.json
{
  "name": "@definitelynotai/newpkg",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "typecheck": "tsc --noEmit"
  }
}

# 3. Create tsconfig.json extending root
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}

# 4. Link workspace
bun install
```

## Testing Patterns

```typescript
// packages/*/test/*.test.ts
import { describe, it, expect, beforeEach } from 'vitest';

describe('FeatureName', () => {
  beforeEach(() => {
    // Setup
  });

  it('should do something', async () => {
    const result = await doSomething();
    expect(result).toBeDefined();
  });
});
```

## Real-Time Updates Pattern

```typescript
// Server: Broadcast update
await partykit.broadcast(projectId, {
  type: 'log',
  data: { step: 'generating', message: 'Writing components...' }
});

// Client: Listen for updates
const socket = new WebSocket(`wss://${PARTYKIT_HOST}/party/${projectId}`);
socket.onmessage = (event) => {
  const { type, data } = JSON.parse(event.data);
  if (type === 'log') {
    logs = [...logs, data];
  }
};
```

## Security Notes

1. **Sandboxed Execution**: All AI-generated code runs in isolated E2B containers
2. **Council Approval**: High-risk actions need multi-model consensus
3. **Token Budgets**: Agents have per-request spending limits
4. **No Secrets in Code**: All credentials via environment variables

---

**For comprehensive architecture details, see PROJECT_BIBLE.md in the repo root or the Claude Project knowledge base.**
