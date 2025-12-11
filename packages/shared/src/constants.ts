import {
  AgentStep,
  DeploymentStatus,
  Platform,
  ProjectStatus,
} from './types';

/**
 * Project Status Constants
 */

export const PROJECT_STATUSES = Object.values(ProjectStatus);

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  [ProjectStatus.DRAFT]: 'Draft',
  [ProjectStatus.GENERATING]: 'Generating',
  [ProjectStatus.BUILDING]: 'Building',
  [ProjectStatus.DEPLOYED]: 'Deployed',
  [ProjectStatus.FAILED]: 'Failed',
  [ProjectStatus.ARCHIVED]: 'Archived',
};

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  [ProjectStatus.DRAFT]: 'gray',
  [ProjectStatus.GENERATING]: 'blue',
  [ProjectStatus.BUILDING]: 'yellow',
  [ProjectStatus.DEPLOYED]: 'green',
  [ProjectStatus.FAILED]: 'red',
  [ProjectStatus.ARCHIVED]: 'gray',
};

/**
 * Deployment Status Constants
 */

export const DEPLOYMENT_STATUSES = Object.values(DeploymentStatus);

export const DEPLOYMENT_STATUS_LABELS: Record<DeploymentStatus, string> = {
  [DeploymentStatus.QUEUED]: 'Queued',
  [DeploymentStatus.BUILDING]: 'Building',
  [DeploymentStatus.DEPLOYING]: 'Deploying',
  [DeploymentStatus.SUCCESS]: 'Success',
  [DeploymentStatus.FAILED]: 'Failed',
  [DeploymentStatus.CANCELLED]: 'Cancelled',
};

export const DEPLOYMENT_STATUS_COLORS: Record<DeploymentStatus, string> = {
  [DeploymentStatus.QUEUED]: 'gray',
  [DeploymentStatus.BUILDING]: 'yellow',
  [DeploymentStatus.DEPLOYING]: 'blue',
  [DeploymentStatus.SUCCESS]: 'green',
  [DeploymentStatus.FAILED]: 'red',
  [DeploymentStatus.CANCELLED]: 'gray',
};

/**
 * Platform Constants
 */

export const PLATFORMS = Object.values(Platform);

export const PLATFORM_LABELS: Record<Platform, string> = {
  [Platform.CLOUDFLARE_PAGES]: 'Cloudflare Pages',
  [Platform.CLOUDFLARE_WORKERS]: 'Cloudflare Workers',
  [Platform.VERCEL]: 'Vercel',
  [Platform.NETLIFY]: 'Netlify',
};

export const PLATFORM_ICONS: Record<Platform, string> = {
  [Platform.CLOUDFLARE_PAGES]: 'cloudflare',
  [Platform.CLOUDFLARE_WORKERS]: 'cloudflare',
  [Platform.VERCEL]: 'vercel',
  [Platform.NETLIFY]: 'netlify',
};

/**
 * Agent Step Constants
 */

export const AGENT_STEPS = Object.values(AgentStep);

export const AGENT_STEP_LABELS: Record<AgentStep, string> = {
  [AgentStep.ANALYZING]: 'Analyzing Requirements',
  [AgentStep.PLANNING]: 'Planning Architecture',
  [AgentStep.GENERATING]: 'Generating Code',
  [AgentStep.REVIEWING]: 'Reviewing Code',
  [AgentStep.REFINING]: 'Refining Implementation',
  [AgentStep.TESTING]: 'Running Tests',
  [AgentStep.COMPLETE]: 'Complete',
  [AgentStep.ERROR]: 'Error',
};

export const AGENT_STEP_ORDER: Record<AgentStep, number> = {
  [AgentStep.ANALYZING]: 1,
  [AgentStep.PLANNING]: 2,
  [AgentStep.GENERATING]: 3,
  [AgentStep.REVIEWING]: 4,
  [AgentStep.REFINING]: 5,
  [AgentStep.TESTING]: 6,
  [AgentStep.COMPLETE]: 7,
  [AgentStep.ERROR]: -1,
};

/**
 * Validation Constants
 */

export const VALIDATION = {
  PROJECT_NAME_MIN: 1,
  PROJECT_NAME_MAX: 100,
  PROJECT_DESCRIPTION_MAX: 500,
  PROJECT_PROMPT_MIN: 10,
  PROJECT_PROMPT_MAX: 10000,
  ID_LENGTH: 21,
  PREFIXED_ID_LENGTH: 16,
} as const;

/**
 * ID Prefixes
 */

export const ID_PREFIXES = {
  USER: 'usr',
  PROJECT: 'prj',
  DEPLOYMENT: 'dpl',
  AGENT_LOG: 'log',
} as const;
