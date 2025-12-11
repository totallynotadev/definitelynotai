# Definitely Not AI - Project Context

> An Agentic OS that lets users describe apps in plain English and have them automatically built, deployed, and served. Totally not powered by AI. 🤖

## Project Overview

This is a monorepo containing an AI-powered application builder platform. Users describe what they want ("build me a fitness tracker"), and our agent system:
1. Plans the architecture
2. Generates code for web, mobile, and API
3. Validates in sandboxed environments
4. Deploys to production

## Tech Stack

### Control Plane (apps/web)
- **Framework**: SvelteKit with TypeScript
- **Styling**: Tailwind CSS + shadcn-svelte
- **Auth**: Clerk (@clerk/sveltekit)
- **Hosting**: Cloudflare Pages

### API Server (apps/api)
- **Framework**: Hono
- **Database**: Neon Postgres via Drizzle ORM
- **Auth**: Clerk middleware
- **Hosting**: Cloudflare Workers

### Agent System (packages/agents)
- **Orchestration**: LangGraph
- **LLM Gateway**: LiteLLM (Claude primary, GPT-4 fallback)
- **Tracing**: Langfuse

### Sandboxed Execution
- **Code Execution**: E2B (isolated sandboxes)
- **Long-Running Tasks**: Modal (serverless containers)

### Shared Packages
- `packages/shared` - Types, utilities, constants
- `packages/db` - Drizzle schema and client
- `packages/ui` - Shared shadcn-svelte components
- `packages/agents` - LangGraph workflows
- `packages/sandbox` - E2B integration
- `packages/templates` - Starter templates for generated apps

## Code Style Guidelines

### TypeScript
- Strict mode enabled everywhere
- Prefer `type` over `interface` for object shapes
- Use Zod for runtime validation, export inferred types
- Path aliases: `@/` points to `src/` in each app
- Shared imports: `@definitelynotai/shared`, `@definitelynotai/db`

### SvelteKit Conventions
- File-based routing in `src/routes/`
- Server code in `+page.server.ts` or `+server.ts`
- Shared components in `src/lib/components/`
- Use `$lib` alias for imports

### Hono Conventions
- Modular routes in `src/routes/`
- Middleware in `src/middleware/`
- Use Zod validators with `@hono/zod-validator`
- OpenAPI spec generation with `@hono/zod-openapi`

### Database
- All IDs are nanoid strings (not UUIDs)
- Timestamps use `timestamp('created_at').defaultNow()`
- Soft deletes where appropriate
- Migrations via drizzle-kit

## Important Patterns

### Error Handling
```typescript
// API routes - always return structured errors
return c.json({ error: 'Something went wrong', code: 'ERR_CODE' }, 500);

// Agent workflows - log to both Langfuse and agentLogs table
logger.error('Agent failed', { projectId, step, error });
await db.insert(agentLogs).values({ projectId, step, message: error.message });
```

### Real-Time Updates
```typescript
// Broadcast via PartyKit when agent state changes
await partykit.broadcast(projectId, { type: 'status', data: newStatus });
await partykit.broadcast(projectId, { type: 'log', data: logEntry });
```

### Generated Code Injection
```typescript
// Templates use markers for code injection
// @agent:inject:schema - Database schema goes here
// @agent:inject:routes - API routes go here
// @agent:inject:components - UI components go here
```

## Environment Variables

Required in `.env.local`:
```bash
# Database
DATABASE_URL=              # Neon connection string

# Auth
PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# AI
ANTHROPIC_API_KEY=
OPENAI_API_KEY=           # Fallback

# Execution
E2B_API_KEY=
MODAL_TOKEN_ID=
MODAL_TOKEN_SECRET=

# Storage
CLOUDFLARE_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=

# Observability
LANGFUSE_PUBLIC_KEY=
LANGFUSE_SECRET_KEY=
LANGFUSE_HOST=https://cloud.langfuse.com

# Real-time
PARTYKIT_HOST=
```

## Common Commands

```bash
# Development
bun run dev              # Start all apps
bun run dev --filter=web # Start only web app
bun run dev --filter=api # Start only API

# Database
bun run db:generate      # Generate migrations
bun run db:migrate       # Run migrations
bun run db:studio        # Open Drizzle Studio

# Build & Deploy
bun run build            # Build all
bun run lint             # Lint all
bun run typecheck        # Type check all
```

## File Structure

```
definitelynotai/
├── apps/
│   ├── web/                 # SvelteKit control plane
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── components/
│   │   │   │   │   └── ui/  # shadcn-svelte
│   │   │   │   └── server/
│   │   │   └── routes/
│   │   └── svelte.config.js
│   └── api/                 # Hono API server
│       └── src/
│           ├── routes/
│           └── middleware/
├── packages/
│   ├── shared/              # Types, utils, constants
│   ├── db/                  # Drizzle schema & client
│   ├── ui/                  # Shared components
│   ├── agents/              # LangGraph workflows
│   ├── sandbox/             # E2B integration
│   └── templates/           # Generated app starters
├── templates/               # Full app templates
│   ├── sveltekit-web/
│   ├── expo-mobile/
│   └── hono-backend/
├── turbo.json
├── package.json
└── CLAUDE.md               # You are here
```

## Agent Workflow States

```
planning → generating → validating → [retry?] → complete/failed
```

Each state logs to `agentLogs` table and broadcasts via PartyKit.

## IMPORTANT RULES

1. **Never hardcode secrets** - Always use environment variables
2. **Validate all inputs** - Use Zod schemas at API boundaries
3. **Sandbox untrusted code** - All generated code runs in E2B
4. **Log everything** - Agent decisions must be traceable via Langfuse
5. **Handle errors gracefully** - Users should see friendly messages, not stack traces
6. **Type everything** - No `any` types without explicit justification

## Testing Approach

- Unit tests: Vitest for pure functions
- Integration tests: Test API routes with actual DB
- E2E tests: Playwright for critical user flows
- Agent tests: Mock LLM responses for deterministic testing

## Deployment

- **Web**: Cloudflare Pages (auto-deploy from main)
- **API**: Cloudflare Workers (wrangler deploy)
- **Generated Apps**: GitHub Actions → target platform

---

*This file is automatically read by Claude Code at the start of each session.*
