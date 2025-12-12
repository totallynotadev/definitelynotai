// Schema exports
export {
  // Enums
  projectStatusEnum,
  deploymentStatusEnum,
  platformEnum,
  agentStepEnum,
  riskLevelEnum,
  artifactTypeEnum,
  // Tables
  users,
  projects,
  deployments,
  agentLogs,
  councilDecisions,
  artifacts,
  // Relations
  usersRelations,
  projectsRelations,
  deploymentsRelations,
  agentLogsRelations,
  councilDecisionsRelations,
  artifactsRelations,
  // Types
  type User,
  type NewUser,
  type Project,
  type NewProject,
  type Deployment,
  type NewDeployment,
  type AgentLog,
  type NewAgentLog,
  type CouncilDecision,
  type NewCouncilDecision,
  type Artifact,
  type NewArtifact,
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
