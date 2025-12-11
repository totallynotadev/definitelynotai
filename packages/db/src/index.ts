// Schema exports
export {
  // Enums
  projectStatusEnum,
  deploymentStatusEnum,
  platformEnum,
  agentStepEnum,
  // Tables
  users,
  projects,
  deployments,
  agentLogs,
  // Relations
  usersRelations,
  projectsRelations,
  deploymentsRelations,
  agentLogsRelations,
  // Types
  type User,
  type NewUser,
  type Project,
  type NewProject,
  type Deployment,
  type NewDeployment,
  type AgentLog,
  type NewAgentLog,
} from './schema';

// Client exports
export {
  createClient,
  getDb,
  resetDb,
  type Database,
} from './client';

// Re-export useful drizzle utilities
export { eq, ne, gt, gte, lt, lte, and, or, like, ilike, inArray, notInArray, isNull, isNotNull, asc, desc, sql } from 'drizzle-orm';
