# Definitely Not AI — Project Bible

> **Purpose**: This document is the single source of truth for any Claude instance (chat or code) working on this project. Read this FIRST before diving into phase-specific docs or code.

---

## Executive Summary

**Definitely Not AI** is an Agentic Operating System that transforms natural language descriptions into fully deployed, production-ready applications across web and mobile platforms.

**The Core Flow**:
```
User: "Build me a fitness tracker with workout logging"
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  1. PLAN    → AI agents analyze, create specs & data models │
│  2. GENERATE → Multi-model agents write web, mobile, API    │
│  3. VALIDATE → Code runs in isolated E2B sandboxes          │
│  4. DEPLOY   → Auto-deploy to Cloudflare, App Stores        │
└─────────────────────────────────────────────────────────────┘
                          ↓
Output: Live web app, iOS app, Android app, API — all deployed
```

**Repository**: https://github.com/totallynotadev/definitelynotai  
**Live Site**: https://definitelynotai.dev/  
**Status**: All 8 implementation phases complete

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER INTERFACE                                  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    CONTROL PLANE (apps/web)                          │   │
│  │              SvelteKit + Tailwind + shadcn-svelte                    │   │
│  │                   Clerk Auth | Cloudflare Pages                      │   │
│  │                                                                      │   │
│  │   Routes: / (dashboard) | /projects | /projects/[id] | /settings    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API LAYER                                       │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      API SERVER (apps/api)                           │   │
│  │                 Hono + Zod Validation + OpenAPI                      │   │
│  │                      Cloudflare Workers                              │   │
│  │                                                                      │   │
│  │   Routes: /health | /projects | /agents | /sandbox | /deploy        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      DATABASE (packages/db)                          │   │
│  │               Drizzle ORM + Neon Serverless Postgres                 │   │
│  │                                                                      │   │
│  │   Tables: users | projects | deployments | agent_logs | artifacts   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AGENT SYSTEM                                       │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                    ORCHESTRATION (packages/agents)                     │ │
│  │                                                                        │ │
│  │  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌───────────┐ │ │
│  │  │   Model     │   │  LangGraph  │   │   Agent     │   │  Council  │ │ │
│  │  │   Router    │──▶│  Workflow   │──▶│  Registry   │──▶│  System   │ │ │
│  │  └─────────────┘   └─────────────┘   └─────────────┘   └───────────┘ │ │
│  │                                                                        │ │
│  │  Workflow: planning → generating → validating → deploying → complete  │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                      │                                      │
│         ┌────────────────────────────┼────────────────────────────┐        │
│         ▼                            ▼                            ▼        │
│  ┌─────────────┐            ┌─────────────┐            ┌─────────────┐    │
│  │  Claude     │            │   GPT-5.2   │            │  Gemini 3   │    │
│  │  Opus 4.5   │            │   / Pro     │            │    Pro      │    │
│  │             │            │             │            │             │    │
│  │ Orchestrate │            │   Plan      │            │  Frontend   │    │
│  │ QA/Review   │            │   Docs      │            │  Visual     │    │
│  └─────────────┘            └─────────────┘            └─────────────┘    │
│         │                            │                            │        │
│         └────────────────────────────┼────────────────────────────┘        │
│                                      ▼                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                    Claude Sonnet 4.5 (Implementation)                  │ │
│  │              Backend Code | Deployment Scripts | Debugging             │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EXECUTION & DEPLOYMENT                               │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐ │
│  │ packages/sandbox│  │packages/templates│  │     packages/deploy         │ │
│  │                 │  │                 │  │                             │ │
│  │ E2B Sandboxes   │  │ SvelteKit Web   │  │ GitHub Integration          │ │
│  │ Code Validation │  │ Expo Mobile     │  │ Cloudflare Pages/Workers    │ │
│  │ Modal Functions │  │ Hono Backend    │  │ EAS Build (Mobile)          │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘ │
│                                      │                                      │
│                                      ▼                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                      DEPLOYED APPLICATIONS                             │ │
│  │                                                                        │ │
│  │   🌐 Web App          📱 iOS App         📱 Android App    ⚡ API     │ │
│  │   Cloudflare Pages    App Store          Play Store      Workers     │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           OBSERVABILITY                                      │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐ │
│  │    Langfuse     │  │  Cost Tracker   │  │       PartyKit              │ │
│  │                 │  │                 │  │                             │ │
│  │ Agent Tracing   │  │ Token Costs     │  │ Real-time Updates           │ │
│  │ Decision Paths  │  │ Budget Alerts   │  │ Build Progress              │ │
│  │ Token Usage     │  │ Per-model Stats │  │ WebSocket Rooms             │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Control Plane (User-Facing Dashboard)

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | SvelteKit | Excellent streaming support for real-time agent updates, first-class Cloudflare adapter |
| **Styling** | Tailwind CSS + shadcn-svelte | Accessible, customizable components with Tailwind integration |
| **Auth** | Clerk (@clerk/sveltekit) | Robust auth with excellent DX; handles OAuth, sessions, user management |
| **Hosting** | Cloudflare Pages | Global edge deployment, zero cold starts, native SvelteKit adapter |

### API Server

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | Hono | Lightweight, fast, built for edge; excellent middleware ecosystem |
| **Validation** | Zod + @hono/zod-validator | Runtime validation with TypeScript inference |
| **Database** | Neon Postgres | Serverless Postgres with instant branching, edge-compatible pooling |
| **ORM** | Drizzle | Type-safe, lightweight, designed for serverless/edge |
| **Hosting** | Cloudflare Workers | Edge deployment, integrates with D1/KV/R2 |

### Agent System

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Orchestration** | LangGraph | Multi-step planning, tool use, human-in-the-loop workflows |
| **LLM Gateway** | LiteLLM | Abstracts Claude/GPT/Gemini with fallbacks, caching, cost tracking |
| **Tracing** | Langfuse | Purpose-built for LLM observability; tracks decisions and costs |

### Execution & Deployment

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Code Sandbox** | E2B | Secure isolated cloud sandboxes for AI-generated code |
| **Long Compute** | Modal | Serverless containers for 10+ minute agent workflows (Workers have 30s limit) |
| **Version Control** | GitHub API (Octokit) | Repo creation, code push, secrets management |
| **Web Deploy** | Cloudflare Pages | Auto-deploy via GitHub Actions |
| **API Deploy** | Cloudflare Workers | Wrangler CLI deployment |
| **Mobile Build** | Expo EAS | Cloud builds for iOS/Android without local setup |

### Data & Storage

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Primary DB** | Neon Postgres | Serverless, branching for previews, pgvector for embeddings |
| **Cache/Queue** | Upstash Redis | Serverless Redis for rate limiting, job queues |
| **Object Storage** | Cloudflare R2 | S3-compatible, zero egress fees |
| **Vector Search** | pgvector | Native Postgres extension; no separate Pinecone needed |

### Real-Time

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **WebSockets** | PartyKit | Built on Cloudflare, rooms for build progress, agent status |

---

## Multi-Model Agent System

### Model-Task Mapping

| Model | Primary Role | Tasks | Why This Model |
|-------|--------------|-------|----------------|
| **Claude Opus 4.5** | Supreme Orchestrator | Coordination, QA review, security audit, architecture | Best reasoning, safety-aware |
| **Claude Sonnet 4.5** | Implementation Lead | Backend code, deployment scripts, debugging | Fast, great at code |
| **GPT-5.2** | Structured Output | Planning specs, documentation, task breakdowns | Excellent at structured JSON |
| **GPT-5.2 Pro** | Verification | Billing operations, approval workflows | High reliability |
| **Gemini 3 Pro** | Visual/Frontend | UI components, multimodal tasks, UX | Strong visual understanding |
| **Grok 4.1** | Real-time | Customer support, live data queries | Fast responses, real-time data |

### Agent Registry

```typescript
// packages/agents/src/agents/registry.ts
AGENT_REGISTRY = {
  orchestrator: { model: "claude-opus-4-5", permissions: ["read", "write", "approve"] },
  planner:      { model: "gpt-5.2",         permissions: ["read", "write"] },
  frontend:     { model: "gemini-3-pro",    permissions: ["read", "write", "execute"] },
  backend:      { model: "claude-sonnet-4-5", permissions: ["read", "write", "execute"] },
  qa:           { model: "claude-opus-4-5", permissions: ["read", "write", "approve"] },
  docs:         { model: "gpt-5.2",         permissions: ["read", "write"] },
  deploy:       { model: "claude-sonnet-4-5", permissions: ["read", "write", "deploy"] },
  support:      { model: "grok-4.1",        permissions: ["read", "write"] },
  billing:      { model: "gpt-5.2-pro",     permissions: ["read", "billing"] },
}
```

### LangGraph Workflow

```
┌─────────┐     ┌────────────┐     ┌────────────┐     ┌───────────┐     ┌──────────┐
│  START  │────▶│  planning  │────▶│ generating │────▶│ validating│────▶│ deploying│
└─────────┘     └────────────┘     └────────────┘     └────────────┘     └──────────┘
                     │                   │                  │                  │
                     ▼                   ▼                  ▼                  ▼
                 GPT-5.2            Sonnet 4.5          Opus 4.5          Sonnet 4.5
                 creates            writes              reviews            deploys
                 structured         code files          security           to prod
                 plan JSON                              & quality
                                                            │
                                                            ▼
                                                    ┌──────────────┐
                                                    │   COUNCIL    │
                                                    │  (if high    │
                                                    │   risk)      │
                                                    └──────────────┘
```

### Council Approval System

For high-risk actions, multiple models vote:

| Risk Level | Requirements |
|------------|--------------|
| **Low** | Auto-approve |
| **Medium** | Auto-approve with logging |
| **High** | 2 votes from [claude-opus-4-5, gpt-5.2-pro] |
| **Critical** | 2 votes + human notification |

---

## Package Structure

```
definitelynotai/
├── apps/
│   ├── web/                      # SvelteKit control plane
│   │   ├── src/
│   │   │   ├── routes/           # File-based routing
│   │   │   │   ├── +layout.svelte
│   │   │   │   ├── +page.svelte  # Dashboard
│   │   │   │   ├── projects/
│   │   │   │   │   ├── +page.svelte
│   │   │   │   │   └── [id]/+page.svelte
│   │   │   │   └── settings/
│   │   │   ├── lib/
│   │   │   │   ├── components/   # UI components
│   │   │   │   └── server/       # Server-side code
│   │   │   └── app.css           # Tailwind imports
│   │   ├── svelte.config.js
│   │   └── wrangler.toml
│   │
│   └── api/                      # Hono API server
│       ├── src/
│       │   ├── index.ts          # Entry point
│       │   ├── routes/
│       │   │   ├── health.ts
│       │   │   ├── projects.ts
│       │   │   ├── agents.ts
│       │   │   ├── sandbox.ts
│       │   │   ├── deploy.ts
│       │   │   └── templates.ts
│       │   ├── middleware/
│       │   │   ├── auth.ts       # Clerk middleware
│       │   │   └── cors.ts
│       │   └── lib/
│       │       └── env.ts        # Zod env validation
│       └── wrangler.toml
│
├── packages/
│   ├── shared/                   # Shared types & utilities
│   │   └── src/
│   │       ├── types/            # TypeScript types
│   │       ├── schemas/          # Zod schemas
│   │       ├── utils/            # generateId, formatDate, sleep
│   │       └── constants/        # Status enums, platforms
│   │
│   ├── db/                       # Database layer
│   │   └── src/
│   │       ├── schema.ts         # Drizzle table definitions
│   │       ├── client.ts         # Neon + Drizzle client
│   │       └── index.ts          # Exports
│   │
│   ├── ui/                       # shadcn-svelte components
│   │   └── src/
│   │       └── components/       # Button, Card, Input, etc.
│   │
│   ├── agents/                   # Agent orchestration
│   │   └── src/
│   │       ├── router/
│   │       │   └── model-router.ts
│   │       ├── agents/
│   │       │   ├── types.ts
│   │       │   └── registry.ts
│   │       ├── workflows/
│   │       │   └── build-app.ts  # LangGraph workflow
│   │       └── council/
│   │           └── council.ts    # Multi-model voting
│   │
│   ├── sandbox/                  # Code execution
│   │   ├── src/
│   │   │   ├── manager.ts        # E2B sandbox management
│   │   │   ├── validator.ts      # Code validation
│   │   │   └── modal-client.ts   # Modal integration
│   │   └── modal/
│   │       └── app.py            # Modal Python functions
│   │
│   ├── templates/                # Starter templates
│   │   ├── src/
│   │   │   ├── types.ts
│   │   │   ├── manager.ts        # Template operations
│   │   │   └── utils.ts
│   │   └── templates/
│   │       ├── sveltekit-web/    # Web app starter
│   │       ├── expo-mobile/      # Mobile app starter
│   │       └── hono-backend/     # API starter
│   │
│   ├── deploy/                   # Deployment orchestration
│   │   └── src/
│   │       ├── types.ts
│   │       ├── github.ts         # Repo creation, push, secrets
│   │       ├── cloudflare.ts     # Pages & Workers deploy
│   │       ├── eas.ts            # Expo builds
│   │       └── orchestrator.ts   # Coordinates all platforms
│   │
│   └── observability/            # Monitoring & tracing
│       └── src/
│           ├── langfuse.ts       # Trace wrapper
│           ├── cost-tracker.ts   # Token cost calculation
│           ├── error-monitor.ts
│           └── metrics.ts
│
├── turbo.json                    # Turborepo config
├── package.json                  # Bun workspace root
├── tsconfig.json                 # Base TypeScript config
└── CLAUDE.md                     # Claude Code context
```

---

## Database Schema

### Tables Overview

```sql
-- Users (synced from Clerk)
users
├── id (text, PK)              -- nanoid
├── clerkId (text, unique)     -- Clerk user ID
├── email (text)
├── name (text, nullable)
└── createdAt (timestamp)

-- Projects (user's app requests)
projects
├── id (text, PK)
├── userId (text, FK → users)
├── name (text)
├── description (text, nullable)
├── prompt (text)              -- Original user request
├── status (enum)              -- draft|planning|building|deployed|failed
├── platforms (text[])         -- ['web', 'ios', 'android', 'api']
├── plan (jsonb, nullable)     -- Generated plan from planner agent
├── createdAt (timestamp)
└── updatedAt (timestamp)

-- Deployments (per-platform status)
deployments
├── id (text, PK)
├── projectId (text, FK → projects)
├── platform (enum)            -- web|ios|android|api
├── url (text, nullable)       -- Live URL when deployed
├── status (enum)              -- pending|building|live|failed
├── metadata (jsonb)           -- Build logs, error details
└── createdAt (timestamp)

-- Agent Logs (execution tracking)
agent_logs
├── id (text, PK)
├── projectId (text, FK → projects)
├── step (text)                -- planning|generating|validating|deploying
├── message (text)
├── metadata (jsonb)
├── agentId (text)             -- orchestrator|planner|backend|qa|etc
├── modelUsed (text)           -- claude-opus-4-5|gpt-5.2|etc
├── inputTokens (int)
├── outputTokens (int)
├── durationMs (int)
├── status (text)              -- success|error|pending
└── createdAt (timestamp)

-- Council Decisions (multi-model votes)
council_decisions
├── id (text, PK)
├── projectId (text, FK → projects)
├── actionId (text)
├── action (text)              -- What action was proposed
├── riskLevel (text)           -- low|medium|high|critical
├── approved (boolean)
├── requiresHuman (boolean)
├── reasoning (text)
├── votes (jsonb)              -- [{model, approved, reasoning, concerns}]
└── createdAt (timestamp)

-- Artifacts (generated code & configs)
artifacts
├── id (text, PK)
├── projectId (text, FK → projects)
├── type (text)                -- plan|code|config|docs
├── name (text)                -- Filename or artifact name
├── content (text)             -- Full file content
├── version (int)
├── metadata (jsonb)
├── createdAt (timestamp)
└── updatedAt (timestamp)
```

### Key Patterns

- **IDs**: All use `nanoid` strings, not UUIDs
- **Timestamps**: Use `timestamp('created_at').defaultNow()`
- **JSON fields**: Use `jsonb` for flexible metadata
- **Enums**: Defined with `pgEnum` in Drizzle

---

## Template System

### Injection Markers

Templates use special markers where agents inject generated code:

```typescript
// In template files:
// @agent:inject:schema     → Database schema definitions
// @agent:inject:routes     → API route handlers
// @agent:inject:components → UI components
// @agent:inject:imports    → Import statements
// @agent:inject:store      → Zustand state
// @agent:inject:types      → TypeScript types
```

### Template Manager Operations

```typescript
// packages/templates/src/manager.ts
class TemplateManager {
  listTemplates(): Template[]
  getTemplate(id: string): Template
  getTemplateFiles(id: string): TemplateFile[]
  findInjectionPoints(id: string): InjectionPoint[]
  injectCode(files: TemplateFile[], injections: InjectionRequest[]): TemplateFile[]
  prepareTemplate(templateId: string, injections: Injection[], customizations: object): Record<string, string>
}
```

---

## Deployment Pipeline

### Flow

```
Generated Code
      │
      ▼
┌─────────────────────────────────────────────────────────┐
│                    GITHUB                                │
│                                                         │
│  1. Create repository (if new)                          │
│  2. Push all generated files                            │
│  3. Set secrets (DATABASE_URL, API keys, etc.)          │
│  4. Create GitHub Actions workflows                     │
└─────────────────────────────────────────────────────────┘
      │
      ├──────────────────┬──────────────────┬─────────────┐
      ▼                  ▼                  ▼             ▼
┌───────────┐     ┌───────────┐     ┌───────────┐  ┌───────────┐
│   WEB     │     │    API    │     │  MOBILE   │  │  MOBILE   │
│           │     │           │     │   iOS     │  │  Android  │
│ Cloudflare│     │ Cloudflare│     │           │  │           │
│   Pages   │     │  Workers  │     │ EAS Build │  │ EAS Build │
│           │     │           │     │     ↓     │  │     ↓     │
│   *.pages │     │ *.workers │     │ App Store │  │Play Store │
│   .dev    │     │   .dev    │     │           │  │           │
└───────────┘     └───────────┘     └───────────┘  └───────────┘
```

### API Keys Required

| Key | Source | Permissions |
|-----|--------|-------------|
| `GH_TOKEN` | github.com/settings/tokens | `repo`, `workflow` |
| `CLOUDFLARE_API_TOKEN` | Cloudflare Dashboard | Pages Edit, Workers Scripts Edit |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Dashboard sidebar | — |
| `EXPO_TOKEN` | expo.dev/accounts/settings | Full access |

---

## Environment Variables

```bash
# Database (Neon)
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/definitelynotai?sslmode=require

# Auth (Clerk)
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# AI Models
ANTHROPIC_API_KEY=sk-ant-xxxxx
OPENAI_API_KEY=sk-xxxxx
GOOGLE_AI_API_KEY=xxxxx           # For Gemini
XAI_API_KEY=xxxxx                 # For Grok

# Sandboxed Execution
E2B_API_KEY=e2b_xxxxx
MODAL_TOKEN_ID=xxxxx
MODAL_TOKEN_SECRET=xxxxx

# Deployment
GH_TOKEN=ghp_xxxxx                # Note: not GITHUB_TOKEN (reserved in Codespaces)
CLOUDFLARE_API_TOKEN=xxxxx
CLOUDFLARE_ACCOUNT_ID=xxxxx
EXPO_TOKEN=xxxxx

# Storage
R2_ACCESS_KEY_ID=xxxxx
R2_SECRET_ACCESS_KEY=xxxxx

# Observability
LANGFUSE_PUBLIC_KEY=pk-xxxxx
LANGFUSE_SECRET_KEY=sk-xxxxx
LANGFUSE_HOST=https://cloud.langfuse.com

# Real-time
PARTYKIT_HOST=your-party.partykit.dev
```

---

## Common Commands

```bash
# Development
bun install              # Install all dependencies
bun run dev              # Start all services (web + api)
bun run build            # Build all packages
bun run typecheck        # TypeScript check
bun run lint             # ESLint

# Database
bun run db:generate      # Generate Drizzle migrations
bun run db:migrate       # Run migrations
bun run db:studio        # Open Drizzle Studio

# Testing
bun run test             # Run all tests
cd packages/sandbox && bun run test  # Package-specific tests

# Deployment
cd apps/api && bunx wrangler deploy   # Deploy API to Workers
cd apps/web && bun run build          # Build for Pages (auto-deploys via GitHub)
```

---

## Code Conventions

### TypeScript
- Strict mode enabled everywhere
- Prefer `type` over `interface` for object shapes
- Use Zod for runtime validation, export inferred types
- Path aliases: `@/` → `src/` in each app
- Shared imports: `@definitelynotai/shared`, `@definitelynotai/db`

### SvelteKit
- File-based routing in `src/routes/`
- Server code in `+page.server.ts` or `+server.ts`
- Shared components in `src/lib/components/`
- Use `$lib` alias for imports

### Hono
- Modular routes in `src/routes/`
- Middleware in `src/middleware/`
- Use Zod validators with `@hono/zod-validator`
- Return structured errors: `{ error: string, code: string }`

### Error Handling
```typescript
// API routes
return c.json({ error: 'Something went wrong', code: 'ERR_CODE' }, 500);

// Agent workflows
logger.error('Agent failed', { projectId, step, error });
await db.insert(agentLogs).values({ projectId, step, message: error.message });
```

### Real-Time Updates
```typescript
// Broadcast via PartyKit when agent state changes
await partykit.broadcast(projectId, { type: 'status', data: newStatus });
await partykit.broadcast(projectId, { type: 'log', data: logEntry });
```

---

## Implementation Phases (Completed)

| Phase | Focus | Key Deliverables |
|-------|-------|------------------|
| **1** | Project Foundation | Bun monorepo, SvelteKit, Hono, TypeScript config |
| **2** | Database & Auth | Neon + Drizzle schema, Clerk integration |
| **3** | Control Plane UI | Dashboard, project creation, detail pages |
| **4** | Agent Orchestration | LangGraph, model router, agent registry, council |
| **5** | Sandboxed Execution | E2B integration, code validation, Modal |
| **6** | Template System | SvelteKit/Expo/Hono templates, injection markers |
| **7** | Build Pipeline | GitHub/Cloudflare/EAS deployment orchestration |
| **8** | Real-Time & Observability | PartyKit, Langfuse, cost tracking, metrics |

---

## Key Architecture Decisions

| Decision | Why |
|----------|-----|
| **Bun over npm/yarn** | Native workspace support, fast, built-in TypeScript |
| **SvelteKit over Next.js** | Better streaming for real-time, first-class Cloudflare support |
| **Modal over Workers for compute** | Workers have 30s limit; agents can run 10+ minutes |
| **pgvector over Pinecone** | One less service; Postgres handles most workloads |
| **Templates with markers** | Consistent starting points, reduced token usage |
| **Multi-model system** | Each model's strengths match specific tasks |
| **Council for high-risk** | Safety through consensus, not single-model decisions |

---

## Troubleshooting Quick Reference

### "Cannot find module '@definitelynotai/shared'"
```bash
bun install  # Re-link workspaces
```

### "E2B sandbox timeout"
```typescript
// Increase timeout in createSandbox config
{ timeout: 600000 }  // 10 minutes
```

### "GitHub push failed"
```bash
# Check token permissions
# Ensure repo has at least one commit (use autoInit: true)
```

### "Cloudflare deployment failed"
```bash
# Verify API token has: Pages Edit, Workers Scripts Edit
# Check CLOUDFLARE_ACCOUNT_ID from dashboard sidebar
```

### "Agent workflow stuck"
```typescript
// Check Langfuse traces for the step that failed
// Look at agent_logs table for error details
// Modal functions have their own logs in Modal dashboard
```

---

## Next Steps / Future Work

1. **Enhanced Plan Validation** — Have QA agent validate plans before code generation
2. **Incremental Builds** — Only regenerate changed components
3. **User Customization** — Allow users to modify generated code in-browser
4. **Billing Integration** — Usage-based pricing tied to token consumption
5. **Team Features** — Shared projects, collaboration
6. **Custom Templates** — User-uploaded starter templates
7. **Plugin System** — Third-party integrations (Stripe, Supabase, etc.)

---

## Document Maintenance

This document should be updated when:
- New packages are added
- Database schema changes
- New models are integrated
- Deployment pipeline changes
- Major architectural decisions are made

Last updated: December 2025
