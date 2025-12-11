/**
 * Enum Types
 */

export enum ProjectStatus {
  DRAFT = 'draft',
  GENERATING = 'generating',
  BUILDING = 'building',
  DEPLOYED = 'deployed',
  FAILED = 'failed',
  ARCHIVED = 'archived',
}

export enum DeploymentStatus {
  QUEUED = 'queued',
  BUILDING = 'building',
  DEPLOYING = 'deploying',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum Platform {
  CLOUDFLARE_PAGES = 'cloudflare_pages',
  CLOUDFLARE_WORKERS = 'cloudflare_workers',
  VERCEL = 'vercel',
  NETLIFY = 'netlify',
}

export enum AgentStep {
  ANALYZING = 'analyzing',
  PLANNING = 'planning',
  GENERATING = 'generating',
  REVIEWING = 'reviewing',
  REFINING = 'refining',
  TESTING = 'testing',
  COMPLETE = 'complete',
  ERROR = 'error',
}

/**
 * Entity Types
 */

export interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  createdAt: Date;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  prompt: string;
  status: ProjectStatus;
  platforms: Platform[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Deployment {
  id: string;
  projectId: string;
  platform: Platform;
  url: string | null;
  status: DeploymentStatus;
  createdAt: Date;
}

export interface AgentLog {
  id: string;
  projectId: string;
  step: AgentStep;
  message: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

/**
 * API Types - for JSON serialization (dates as strings)
 */

export interface UserDTO {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  createdAt: string;
}

export interface ProjectDTO {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  prompt: string;
  status: ProjectStatus;
  platforms: Platform[];
  createdAt: string;
  updatedAt: string;
}

export interface DeploymentDTO {
  id: string;
  projectId: string;
  platform: Platform;
  url: string | null;
  status: DeploymentStatus;
  createdAt: string;
}

export interface AgentLogDTO {
  id: string;
  projectId: string;
  step: AgentStep;
  message: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

/**
 * Input Types - for creating/updating entities
 */

export interface CreateUserInput {
  clerkId: string;
  email: string;
  name?: string | null;
}

export interface CreateProjectInput {
  userId: string;
  name: string;
  description?: string | null;
  prompt: string;
  platforms?: Platform[];
}

export interface UpdateProjectInput {
  name?: string;
  description?: string | null;
  prompt?: string;
  status?: ProjectStatus;
  platforms?: Platform[];
}

export interface CreateDeploymentInput {
  projectId: string;
  platform: Platform;
}

export interface CreateAgentLogInput {
  projectId: string;
  step: AgentStep;
  message: string;
  metadata?: Record<string, unknown> | null;
}
