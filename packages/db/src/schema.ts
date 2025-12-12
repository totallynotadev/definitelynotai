import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

/**
 * Enums
 */

export const projectStatusEnum = pgEnum('project_status', [
  'draft',
  'generating',
  'building',
  'deployed',
  'failed',
  'archived',
]);

export const deploymentStatusEnum = pgEnum('deployment_status', [
  'queued',
  'building',
  'deploying',
  'success',
  'failed',
  'cancelled',
]);

export const platformEnum = pgEnum('platform', [
  'cloudflare_pages',
  'cloudflare_workers',
  'vercel',
  'netlify',
]);

export const agentStepEnum = pgEnum('agent_step', [
  'analyzing',
  'planning',
  'generating',
  'reviewing',
  'refining',
  'testing',
  'complete',
  'error',
]);

export const riskLevelEnum = pgEnum('risk_level', [
  'low',
  'medium',
  'high',
  'critical',
]);

export const artifactTypeEnum = pgEnum('artifact_type', [
  'plan',
  'code',
  'config',
  'docs',
]);

/**
 * Users Table
 */

export const users = pgTable(
  'users',
  {
    id: text('id').primaryKey(),
    clerkId: text('clerk_id').notNull().unique(),
    email: text('email').notNull().unique(),
    name: text('name'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('users_clerk_id_idx').on(table.clerkId),
    index('users_email_idx').on(table.email),
  ]
);

/**
 * Projects Table
 */

export const projects = pgTable(
  'projects',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    prompt: text('prompt').notNull(),
    status: projectStatusEnum('status').notNull().default('draft'),
    platforms: text('platforms').array().notNull().default([]),
    // Generated plan from LLM
    plan: jsonb('plan').$type<{
      appName: string;
      summary: string;
      features: string[];
      dataModels: { name: string; fields: string[] }[];
      apiEndpoints: string[];
    }>(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('projects_user_id_idx').on(table.userId),
    index('projects_status_idx').on(table.status),
    index('projects_created_at_idx').on(table.createdAt),
  ]
);

/**
 * Deployments Table
 */

export const deployments = pgTable(
  'deployments',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    platform: platformEnum('platform').notNull(),
    url: text('url'),
    status: deploymentStatusEnum('status').notNull().default('queued'),
    buildLogs: jsonb('build_logs').$type<Array<{
      timestamp: string;
      level: string;
      message: string;
    }>>(),
    error: text('error'),
    duration: text('duration'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (table) => [
    index('deployments_project_id_idx').on(table.projectId),
    index('deployments_status_idx').on(table.status),
    index('deployments_created_at_idx').on(table.createdAt),
  ]
);

/**
 * Agent Logs Table - Enhanced with model tracking
 */

export const agentLogs = pgTable(
  'agent_logs',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    step: agentStepEnum('step').notNull(),
    message: text('message').notNull(),
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),
    // New fields for multi-model tracking
    agentId: text('agent_id'), // orchestrator, planner, backend, etc.
    modelUsed: text('model_used'), // claude-opus-4-5, gpt-5.2, etc.
    inputTokens: integer('input_tokens'),
    outputTokens: integer('output_tokens'),
    durationMs: integer('duration_ms'),
    status: text('status').default('success'), // success, error, pending
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('agent_logs_project_id_idx').on(table.projectId),
    index('agent_logs_step_idx').on(table.step),
    index('agent_logs_created_at_idx').on(table.createdAt),
    index('agent_logs_agent_id_idx').on(table.agentId),
  ]
);

/**
 * Council Decisions Table - Multi-model voting for high-risk actions
 */

export const councilDecisions = pgTable(
  'council_decisions',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id').references(() => projects.id, { onDelete: 'cascade' }),
    actionId: text('action_id').notNull(),
    action: text('action').notNull(),
    riskLevel: riskLevelEnum('risk_level').notNull(),
    approved: boolean('approved').notNull(),
    requiresHuman: boolean('requires_human').default(false),
    reasoning: text('reasoning'),
    votes: jsonb('votes').$type<Array<{
      model: string;
      approved: boolean;
      reasoning: string;
      concerns: string[];
    }>>(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('council_decisions_project_id_idx').on(table.projectId),
    index('council_decisions_action_id_idx').on(table.actionId),
    index('council_decisions_created_at_idx').on(table.createdAt),
  ]
);

/**
 * Artifacts Table - Generated code and documents
 */

export const artifacts = pgTable(
  'artifacts',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    type: artifactTypeEnum('type').notNull(),
    name: text('name').notNull(), // filename or artifact name
    content: text('content').notNull(),
    version: integer('version').default(1),
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('artifacts_project_id_idx').on(table.projectId),
    index('artifacts_type_idx').on(table.type),
    index('artifacts_created_at_idx').on(table.createdAt),
  ]
);

/**
 * Relations
 */

export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  deployments: many(deployments),
  agentLogs: many(agentLogs),
  councilDecisions: many(councilDecisions),
  artifacts: many(artifacts),
}));

export const deploymentsRelations = relations(deployments, ({ one }) => ({
  project: one(projects, {
    fields: [deployments.projectId],
    references: [projects.id],
  }),
}));

export const agentLogsRelations = relations(agentLogs, ({ one }) => ({
  project: one(projects, {
    fields: [agentLogs.projectId],
    references: [projects.id],
  }),
}));

export const councilDecisionsRelations = relations(councilDecisions, ({ one }) => ({
  project: one(projects, {
    fields: [councilDecisions.projectId],
    references: [projects.id],
  }),
}));

export const artifactsRelations = relations(artifacts, ({ one }) => ({
  project: one(projects, {
    fields: [artifacts.projectId],
    references: [projects.id],
  }),
}));

/**
 * Type Exports
 */

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type Deployment = typeof deployments.$inferSelect;
export type NewDeployment = typeof deployments.$inferInsert;

export type AgentLog = typeof agentLogs.$inferSelect;
export type NewAgentLog = typeof agentLogs.$inferInsert;

export type CouncilDecision = typeof councilDecisions.$inferSelect;
export type NewCouncilDecision = typeof councilDecisions.$inferInsert;

export type Artifact = typeof artifacts.$inferSelect;
export type NewArtifact = typeof artifacts.$inferInsert;
