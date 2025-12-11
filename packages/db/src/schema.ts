import { relations } from 'drizzle-orm';
import {
  index,
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
 * Agent Logs Table
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
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('agent_logs_project_id_idx').on(table.projectId),
    index('agent_logs_step_idx').on(table.step),
    index('agent_logs_created_at_idx').on(table.createdAt),
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
