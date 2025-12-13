# Definitely Not AI — Architecture Documentation

> Technical deep-dive into system architecture, design decisions, and integration patterns.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Data Flow](#data-flow)
3. [Agent System Architecture](#agent-system-architecture)
4. [Security Model](#security-model)
5. [Deployment Architecture](#deployment-architecture)
6. [Architecture Decision Records](#architecture-decision-records)
7. [Integration Patterns](#integration-patterns)
8. [Scaling Considerations](#scaling-considerations)
9. [Disaster Recovery](#disaster-recovery)

---

## System Overview

### High-Level Architecture

```
                                    ┌─────────────────┐
                                    │   End Users     │
                                    └────────┬────────┘
                                             │
                                             ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                           CLOUDFLARE EDGE                                   │
│  ┌──────────────────────────────┐    ┌──────────────────────────────────┐ │
│  │      Cloudflare Pages        │    │      Cloudflare Workers          │ │
│  │                              │    │                                  │ │
│  │  ┌────────────────────────┐  │    │  ┌────────────────────────────┐  │ │
│  │  │      apps/web          │  │    │  │       apps/api             │  │ │
│  │  │      SvelteKit         │  │◄───┤  │        Hono                │  │ │
│  │  │                        │  │    │  │                            │  │ │
│  │  │  - Dashboard           │  │    │  │  - /projects               │  │ │
│  │  │  - Project Management  │  │    │  │  - /agents                 │  │ │
│  │  │  - Real-time Logs      │  │    │  │  - /sandbox                │  │ │
│  │  │  - Deployment Status   │  │    │  │  - /deploy                 │  │ │
│  │  └────────────────────────┘  │    │  └────────────────────────────┘  │ │
│  └──────────────────────────────┘    └──────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────┘
                │                                      │
                │                                      ▼
                │              ┌─────────────────────────────────────────────┐
                │              │              EXTERNAL SERVICES              │
                │              │                                             │
                │              │  ┌─────────┐  ┌─────────┐  ┌─────────────┐ │
                │              │  │  Clerk  │  │   E2B   │  │    Modal    │ │
                │              │  │  Auth   │  │ Sandbox │  │   Compute   │ │
                │              │  └─────────┘  └─────────┘  └─────────────┘ │
                │              │                                             │
                │              │  ┌─────────┐  ┌─────────┐  ┌─────────────┐ │
                │              │  │  Neon   │  │ Langfuse│  │  PartyKit   │ │
                │              │  │Postgres │  │ Tracing │  │  Real-time  │ │
                │              │  └─────────┘  └─────────┘  └─────────────┘ │
                │              │                                             │
                │              │  ┌─────────┐  ┌─────────┐  ┌─────────────┐ │
                │              │  │ GitHub  │  │Cloudflare│ │   Expo/EAS  │ │
                │              │  │   API   │  │   API   │  │   Builds    │ │
                │              │  └─────────┘  └─────────┘  └─────────────┘ │
                │              └─────────────────────────────────────────────┘
                │                                      │
                ▼                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                              AI PROVIDERS                                   │
│                                                                            │
│   ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────────────┐  │
│   │ Anthropic  │  │  OpenAI    │  │   Google   │  │        xAI         │  │
│   │            │  │            │  │            │  │                    │  │
│   │ Claude 4.5 │  │ GPT-5.2    │  │ Gemini 3   │  │     Grok 4.1       │  │
│   │ Opus/Sonnet│  │ / Pro      │  │   Pro      │  │                    │  │
│   └────────────┘  └────────────┘  └────────────┘  └────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Technology |
|-----------|----------------|------------|
| **apps/web** | User interface, project management, real-time updates | SvelteKit, Tailwind, Clerk |
| **apps/api** | REST API, request validation, auth middleware | Hono, Zod, Clerk |
| **packages/db** | Data persistence, schema, migrations | Drizzle, Neon Postgres |
| **packages/agents** | AI orchestration, multi-model routing | LangGraph, LiteLLM |
| **packages/sandbox** | Code execution, validation | E2B, Modal |
| **packages/templates** | Starter code, injection | Custom |
| **packages/deploy** | CI/CD, deployment orchestration | Octokit, Cloudflare API, EAS |
| **packages/observability** | Tracing, metrics, cost tracking | Langfuse |

---

## Data Flow

### Build Request Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BUILD REQUEST FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

1. User submits prompt via web UI
         │
         ▼
┌─────────────────┐
│   apps/web      │  POST /projects { name, prompt, platforms }
│   SvelteKit     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   apps/api      │  Validate request, create project record
│   Hono          │  Return projectId
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  packages/db    │  INSERT INTO projects
│  Drizzle+Neon   │  status = 'draft'
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   apps/api      │  POST /projects/:id/build
│   /agents/build │  Trigger async workflow
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ packages/agents │  LangGraph workflow starts
│ build-app.ts    │  status = 'planning'
└────────┬────────┘
         │
    ┌────┴─────────────────────────────────────────────────┐
    │                                                       │
    ▼                                                       ▼
┌─────────────────┐                              ┌─────────────────┐
│  Planning Node  │                              │  PartyKit       │
│  (GPT-5.2)      │                              │  Broadcast      │
│                 │                              │  { type: 'log'} │
│  → Create spec  │                              └─────────────────┘
│  → Data models  │                                       │
│  → API design   │                                       ▼
└────────┬────────┘                              ┌─────────────────┐
         │                                       │   apps/web      │
         ▼                                       │   Real-time UI  │
┌─────────────────┐                              │   updates       │
│ Generating Node │                              └─────────────────┘
│ (Sonnet 4.5)    │
│                 │
│  → Write code   │
│  → Use template │
│  → Inject code  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ packages/sandbox│
│ E2B Sandbox     │
│                 │
│  → Write files  │
│  → npm install  │
│  → tsc --noEmit │
│  → Run tests    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Validating Node │
│ (Opus 4.5)      │
│                 │
│  → Security     │
│  → Quality      │
│  → Approve/Deny │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐  ┌──────────────────┐
│ Fail  │  │  Deploying Node  │
│       │  │  (Sonnet 4.5)    │
│ status│  │                  │
│='fail'│  │  → GitHub push   │
└───────┘  │  → CF Pages      │
           │  → CF Workers    │
           │  → EAS Build     │
           └────────┬─────────┘
                    │
                    ▼
           ┌───────────────────┐
           │ packages/deploy   │
           │ Orchestrator      │
           │                   │
           │ → Create repo     │
           │ → Push code       │
           │ → Set secrets     │
           │ → Trigger deploys │
           └────────┬──────────┘
                    │
                    ▼
           ┌───────────────────┐
           │    packages/db    │
           │                   │
           │ status='deployed' │
           │ deployments URLs  │
           └───────────────────┘
```

### Real-Time Update Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         REAL-TIME UPDATE FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

packages/agents                     PartyKit                    apps/web
     │                                  │                           │
     │  1. Agent completes step         │                           │
     │────────────────────────────────▶│                           │
     │  broadcast(projectId, {          │                           │
     │    type: 'log',                  │                           │
     │    data: { step, message }       │                           │
     │  })                              │                           │
     │                                  │                           │
     │                                  │  2. WebSocket push        │
     │                                  │─────────────────────────▶│
     │                                  │                           │
     │                                  │                           │  3. Update UI
     │                                  │                           │  logs = [...logs, data]
     │                                  │                           │
     │  4. Status change                │                           │
     │────────────────────────────────▶│                           │
     │  broadcast(projectId, {          │                           │
     │    type: 'status',               │                           │
     │    data: 'validating'            │                           │
     │  })                              │                           │
     │                                  │─────────────────────────▶│
     │                                  │                           │  5. Update status badge
     │                                  │                           │
```

---

## Agent System Architecture

### Model Router

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             MODEL ROUTER                                     │
│                    packages/agents/src/router/model-router.ts               │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────┐
                              │  Task Type  │
                              └──────┬──────┘
                                     │
         ┌───────────┬───────────┬───┴───┬───────────┬───────────┐
         ▼           ▼           ▼       ▼           ▼           ▼
    ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
    │orchestrate│code_backend│  plan   │code_frontend│ research │ approval │
    │ review  │ deploy    │  docs   │  visual   │ support  │ billing  │
    │   qa    │  debug    │         │           │          │          │
    └────┬────┘ └────┬────┘ └────┬───┘ └────┬────┘ └────┬────┘ └────┬────┘
         │           │           │          │           │           │
         ▼           ▼           ▼          ▼           ▼           ▼
    ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
    │ Claude  │ │ Claude  │ │ GPT-5.2 │ │ Gemini  │ │ Grok    │ │GPT-5.2  │
    │ Opus    │ │ Sonnet  │ │         │ │ 3 Pro   │ │ 4.1     │ │  Pro    │
    │ 4.5     │ │ 4.5     │ │         │ │         │ │         │ │         │
    └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘

                                     │
                                     ▼
                         ┌───────────────────────┐
                         │  Unified Response     │
                         │  {                    │
                         │    content: string,   │
                         │    model: string,     │
                         │    usage: {           │
                         │      inputTokens,     │
                         │      outputTokens     │
                         │    }                  │
                         │  }                    │
                         └───────────────────────┘
```

### LangGraph State Machine

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         LANGGRAPH STATE MACHINE                              │
│                packages/agents/src/workflows/build-app.ts                   │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────┐
                              │  START  │
                              └────┬────┘
                                   │
                                   ▼
                        ┌──────────────────┐
                        │    PLANNING      │
                        │                  │
                        │  Model: GPT-5.2  │
                        │                  │
                        │  Input: prompt   │
                        │  Output: Plan    │
                        │  - appName       │
                        │  - features      │
                        │  - dataModels    │
                        │  - apiEndpoints  │
                        └────────┬─────────┘
                                 │
                        ┌────────┴────────┐
                        │  Plan Valid?    │
                        └────────┬────────┘
                            yes  │  no
                     ┌───────────┴───────────┐
                     ▼                       ▼
          ┌──────────────────┐        ┌───────────┐
          │    GENERATING    │        │   FAIL    │
          │                  │        │           │
          │ Model: Sonnet    │        │ Log error │
          │                  │        └───────────┘
          │ Input: Plan      │
          │ Output: Files    │
          │ - components     │
          │ - routes         │
          │ - schema         │
          └────────┬─────────┘
                   │
                   ▼
          ┌──────────────────┐
          │   VALIDATING     │
          │                  │
          │ Model: Opus 4.5  │
          │                  │
          │ - E2B Sandbox    │
          │ - TypeScript     │
          │ - Security       │
          │ - Quality        │
          └────────┬─────────┘
                   │
          ┌────────┴────────┐
          │   Approved?     │
          └────────┬────────┘
              yes  │  no
          ┌────────┴────────────┐
          ▼                     ▼
┌──────────────────┐     ┌───────────┐
│    DEPLOYING     │     │   FAIL    │
│                  │     │           │
│ Model: Sonnet    │     │ Return    │
│                  │     │ errors    │
│ - GitHub push    │     └───────────┘
│ - CF Pages       │
│ - CF Workers     │
│ - EAS (optional) │
└────────┬─────────┘
         │
         ▼
    ┌─────────┐
    │   END   │
    │         │
    │ status: │
    │complete │
    └─────────┘
```

### Council Approval Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         COUNCIL APPROVAL FLOW                                │
│                  packages/agents/src/council/council.ts                     │
└─────────────────────────────────────────────────────────────────────────────┘

                    ┌───────────────────┐
                    │  Action Proposed  │
                    │                   │
                    │  riskLevel: ?     │
                    └─────────┬─────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
        ┌──────────┐    ┌──────────┐    ┌──────────┐
        │   LOW    │    │  MEDIUM  │    │   HIGH   │
        │          │    │          │    │          │
        │ Auto-    │    │ Auto-    │    │ Council  │
        │ approve  │    │ approve  │    │ Vote     │
        │          │    │ + log    │    │          │
        └──────────┘    └──────────┘    └────┬─────┘
                                             │
                         ┌───────────────────┴───────────────────┐
                         │                                       │
                         ▼                                       ▼
                  ┌─────────────┐                         ┌─────────────┐
                  │ Claude Opus │                         │ GPT-5.2 Pro │
                  │    4.5      │                         │             │
                  │             │                         │             │
                  │ Vote: Y/N   │                         │ Vote: Y/N   │
                  │ Reasoning   │                         │ Reasoning   │
                  │ Concerns    │                         │ Concerns    │
                  └──────┬──────┘                         └──────┬──────┘
                         │                                       │
                         └───────────────┬───────────────────────┘
                                         │
                                         ▼
                              ┌─────────────────────┐
                              │   Tally Votes       │
                              │                     │
                              │   Required: 2       │
                              │   Timeout: 60s      │
                              └──────────┬──────────┘
                                         │
                              ┌──────────┴──────────┐
                              │                     │
                              ▼                     ▼
                       ┌───────────┐         ┌───────────┐
                       │ APPROVED  │         │ REJECTED  │
                       │           │         │           │
                       │ Proceed   │         │ Log       │
                       │ with      │         │ decision  │
                       │ action    │         │ Halt      │
                       └───────────┘         └───────────┘

For CRITICAL risk:
  - Same as HIGH
  - Plus: Send human notification
  - Timeout: 120s
```

---

## Security Model

### Defense in Depth

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SECURITY LAYERS                                    │
└─────────────────────────────────────────────────────────────────────────────┘

Layer 1: Edge (Cloudflare)
├── DDoS protection
├── WAF rules
├── Rate limiting
└── SSL termination

Layer 2: Authentication (Clerk)
├── Session management
├── OAuth providers
├── JWT validation
└── User sync to DB

Layer 3: Authorization (Application)
├── Route guards (web)
├── Middleware (api)
├── Resource ownership checks
└── Role-based access (future)

Layer 4: Execution Isolation (E2B)
├── Sandboxed containers
├── No network access (configurable)
├── Resource limits
├── Timeout enforcement
└── Automatic cleanup

Layer 5: AI Safety (Council)
├── Risk classification
├── Multi-model consensus
├── Human escalation
└── Audit logging

Layer 6: Data Protection
├── Encrypted at rest (Neon)
├── Encrypted in transit (TLS)
├── Secrets management
└── No secrets in code
```

### Sandbox Isolation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         E2B SANDBOX ISOLATION                                │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         E2B CLOUD                                │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    SANDBOX INSTANCE                         │ │
│  │                                                             │ │
│  │  ┌─────────────────┐  ┌─────────────────────────────────┐  │ │
│  │  │   Filesystem    │  │        Process Space            │  │ │
│  │  │                 │  │                                 │  │ │
│  │  │  /project/      │  │  - npm install                  │  │ │
│  │  │    src/         │  │  - tsc --noEmit                 │  │ │
│  │  │    package.json │  │  - eslint                       │  │ │
│  │  │                 │  │  - npm run build                │  │ │
│  │  └─────────────────┘  └─────────────────────────────────┘  │ │
│  │                                                             │ │
│  │  ┌─────────────────────────────────────────────────────┐   │ │
│  │  │                   CONSTRAINTS                        │   │ │
│  │  │                                                      │   │ │
│  │  │  ✗ No access to host filesystem                      │   │ │
│  │  │  ✗ No access to other sandboxes                      │   │ │
│  │  │  ✗ Limited network (configurable)                    │   │ │
│  │  │  ✗ CPU/memory limits                                 │   │ │
│  │  │  ✗ 5 minute timeout (configurable)                   │   │ │
│  │  │  ✓ Destroyed after use                               │   │ │
│  │  └─────────────────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                 ANOTHER SANDBOX (isolated)                  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

### Multi-Platform Deploy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      DEPLOYMENT ARCHITECTURE                                 │
└─────────────────────────────────────────────────────────────────────────────┘

                    ┌───────────────────────────┐
                    │   Generated Code Files    │
                    │                           │
                    │   - src/                  │
                    │   - package.json          │
                    │   - wrangler.toml         │
                    │   - app.json              │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
                    ┌───────────────────────────┐
                    │    DeploymentOrchestrator │
                    │                           │
                    │    packages/deploy/       │
                    │    orchestrator.ts        │
                    └─────────────┬─────────────┘
                                  │
           ┌──────────────────────┼──────────────────────┐
           │                      │                      │
           ▼                      ▼                      ▼
┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
│    GitHubClient     │ │  CloudflareClient   │ │     EASClient       │
│                     │ │                     │ │                     │
│  - createRepo()     │ │ - createPagesProj() │ │ - triggerBuild()    │
│  - pushFiles()      │ │ - deployToPages()   │ │ - getBuildStatus()  │
│  - setSecrets()     │ │ - deployWorker()    │ │ - submitToStore()   │
│  - createWorkflow() │ │ - setEnvVars()      │ │                     │
└──────────┬──────────┘ └──────────┬──────────┘ └──────────┬──────────┘
           │                       │                       │
           ▼                       ▼                       ▼
┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
│      GitHub         │ │     Cloudflare      │ │      Expo/EAS       │
│                     │ │                     │ │                     │
│  Repository:        │ │  Pages Project:     │ │  Build:             │
│  user/app-name      │ │  app-name           │ │  - iOS              │
│                     │ │                     │ │  - Android          │
│  Actions:           │ │  Workers Script:    │ │                     │
│  - deploy.yml       │ │  app-name-api       │ │  Submit:            │
│                     │ │                     │ │  - App Store        │
│                     │ │                     │ │  - Play Store       │
└─────────────────────┘ └─────────────────────┘ └─────────────────────┘
           │                       │                       │
           └───────────────────────┼───────────────────────┘
                                   │
                                   ▼
                    ┌───────────────────────────┐
                    │     Deployed URLs         │
                    │                           │
                    │  Web: app.pages.dev       │
                    │  API: app-api.workers.dev │
                    │  iOS: apps.apple.com/...  │
                    │  Android: play.google/... │
                    └───────────────────────────┘
```

---

## Architecture Decision Records

### ADR-001: Bun Over npm/yarn/pnpm

**Status**: Accepted  
**Date**: 2025-12

**Context**: Need a package manager and runtime for the monorepo.

**Decision**: Use Bun as both package manager and runtime.

**Rationale**:
- Native workspace support without extra tooling
- 10-100x faster installs than npm
- Built-in TypeScript execution
- Compatible with npm ecosystem

**Consequences**:
- Team must install Bun
- Some edge cases with native modules
- Excellent DX and speed

---

### ADR-002: SvelteKit Over Next.js

**Status**: Accepted  
**Date**: 2025-12

**Context**: Need a framework for the control plane UI.

**Decision**: Use SvelteKit instead of Next.js.

**Rationale**:
- Superior streaming support for real-time agent updates
- First-class Cloudflare Pages adapter
- Smaller bundle sizes
- Less boilerplate than React

**Consequences**:
- Smaller ecosystem than React/Next.js
- Team needs Svelte knowledge
- Excellent performance and DX

---

### ADR-003: Modal for Long-Running Compute

**Status**: Accepted  
**Date**: 2025-12

**Context**: Agent workflows can run 10+ minutes. Cloudflare Workers have 30s limit.

**Decision**: Use Modal for long-running agent workflows.

**Rationale**:
- No timeout limits
- Scale to zero pricing
- GPU support (future ML needs)
- Python-native (good for ML tools)

**Consequences**:
- Additional service to manage
- Python dependency for Modal functions
- TypeScript wrapper needed

---

### ADR-004: pgvector Over Pinecone

**Status**: Accepted  
**Date**: 2025-12

**Context**: Need vector search for semantic code search and RAG.

**Decision**: Use pgvector extension in Neon Postgres instead of Pinecone.

**Rationale**:
- One less service to manage
- Data stays in same database
- Adequate performance for our scale
- Cost effective

**Consequences**:
- Limited to Postgres-compatible queries
- May need Pinecone at extreme scale
- Simpler architecture

---

### ADR-005: Multi-Model Agent System

**Status**: Accepted  
**Date**: 2025-12

**Context**: Different AI tasks have different requirements.

**Decision**: Use specialized models for specialized tasks:
- Claude Opus for reasoning/QA
- Claude Sonnet for code
- GPT-5.2 for structured output
- Gemini for visual/frontend
- Grok for real-time

**Rationale**:
- Each model excels at different tasks
- Cost optimization (use cheaper models where appropriate)
- Fallback resilience
- Avoid single-provider lock-in

**Consequences**:
- Complex routing logic
- Multiple API integrations
- Token tracking per model
- Excellent task-model fit

---

### ADR-006: Template Injection Over Full Generation

**Status**: Accepted  
**Date**: 2025-12

**Context**: AI generates entire applications.

**Decision**: Start with templates and inject AI-generated code at specific markers.

**Rationale**:
- Consistent, production-ready starting points
- Reduced token usage (don't regenerate boilerplate)
- Easier validation (templates are pre-tested)
- Faster generation

**Consequences**:
- Templates must be maintained
- Limited flexibility (must fit template structure)
- Excellent quality and consistency

---

## Integration Patterns

### Clerk Auth Flow

```typescript
// apps/api/src/middleware/auth.ts
import { clerkMiddleware } from '@clerk/hono';

export const requireAuth = clerkMiddleware({
  secretKey: env.CLERK_SECRET_KEY,
  publishableKey: env.PUBLIC_CLERK_PUBLISHABLE_KEY,
});

// Usage in route
app.get('/projects', requireAuth, async (c) => {
  const userId = c.get('userId');
  // ...
});
```

### Langfuse Tracing Pattern

```typescript
// packages/observability/src/langfuse.ts
const trace = langfuse.createTrace({
  traceId: crypto.randomUUID(),
  userId,
  metadata: { projectId },
});

const span = trace.span({ name: 'planning' });
const generation = span.generation({
  name: 'create-plan',
  model: 'gpt-5.2',
  input: prompt,
});

const result = await model.complete(prompt);

generation.end({
  output: result.content,
  usage: {
    input: result.usage.inputTokens,
    output: result.usage.outputTokens,
  },
});
```

### PartyKit Real-Time Pattern

```typescript
// Server: packages/agents/src/workflows/build-app.ts
async function planningNode(state: BuildAppState) {
  await partykit.broadcast(state.projectId, {
    type: 'status',
    data: 'planning',
  });
  
  // ... do planning ...
  
  await partykit.broadcast(state.projectId, {
    type: 'log',
    data: { step: 'planning', message: 'Created spec' },
  });
}

// Client: apps/web/src/routes/projects/[id]/+page.svelte
<script>
  import { onMount } from 'svelte';
  
  let logs = [];
  
  onMount(() => {
    const ws = new WebSocket(`wss://${PARTYKIT_HOST}/party/${projectId}`);
    ws.onmessage = (e) => {
      const { type, data } = JSON.parse(e.data);
      if (type === 'log') {
        logs = [...logs, data];
      }
    };
    return () => ws.close();
  });
</script>
```

---

## Scaling Considerations

### Current Limits

| Resource | Current | Scaling Path |
|----------|---------|--------------|
| **Concurrent builds** | ~10 | Modal scales automatically |
| **Database connections** | 100 pooled | Neon autoscaling |
| **API requests** | Unlimited (Workers) | Cloudflare global edge |
| **Storage** | R2 unlimited | S3-compatible, no limits |

### Future Scaling Needs

1. **Queue System**: Add Upstash Redis queues for build requests
2. **Database Sharding**: User-based sharding if needed
3. **Regional Deploys**: Multi-region for lower latency
4. **Caching Layer**: Redis for hot data (templates, plans)

---

## Disaster Recovery

### Backup Strategy

| Data | Backup Method | Frequency | Retention |
|------|---------------|-----------|-----------|
| **Database** | Neon PITR | Continuous | 7 days |
| **Code** | GitHub | Every push | Forever |
| **Artifacts** | R2 | On creation | 30 days |
| **Logs** | Langfuse | Streaming | 90 days |

### Recovery Procedures

1. **Database**: Restore from Neon point-in-time
2. **Application**: Redeploy from GitHub main branch
3. **Secrets**: Re-provision from secure vault (1Password/Doppler)

---

*Last updated: December 2025*
