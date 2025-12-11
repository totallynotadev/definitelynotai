import { z } from 'zod';

import {
  AgentStep,
  DeploymentStatus,
  Platform,
  ProjectStatus,
} from './types';

/**
 * Enum Schemas
 */

export const projectStatusSchema = z.nativeEnum(ProjectStatus);
export const deploymentStatusSchema = z.nativeEnum(DeploymentStatus);
export const platformSchema = z.nativeEnum(Platform);
export const agentStepSchema = z.nativeEnum(AgentStep);

/**
 * Entity Schemas
 */

export const userSchema = z.object({
  id: z.string().min(1),
  clerkId: z.string().min(1),
  email: z.string().email(),
  name: z.string().nullable(),
  createdAt: z.coerce.date(),
});

export const projectSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  name: z.string().min(1).max(100),
  description: z.string().max(500).nullable(),
  prompt: z.string().min(10).max(10000),
  status: projectStatusSchema,
  platforms: z.array(platformSchema),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const deploymentSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  platform: platformSchema,
  url: z.string().url().nullable(),
  status: deploymentStatusSchema,
  createdAt: z.coerce.date(),
});

export const agentLogSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  step: agentStepSchema,
  message: z.string().min(1),
  metadata: z.record(z.unknown()).nullable(),
  createdAt: z.coerce.date(),
});

/**
 * DTO Schemas (for API responses with string dates)
 */

export const userDTOSchema = z.object({
  id: z.string().min(1),
  clerkId: z.string().min(1),
  email: z.string().email(),
  name: z.string().nullable(),
  createdAt: z.string().datetime(),
});

export const projectDTOSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  name: z.string().min(1).max(100),
  description: z.string().max(500).nullable(),
  prompt: z.string().min(10).max(10000),
  status: projectStatusSchema,
  platforms: z.array(platformSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const deploymentDTOSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  platform: platformSchema,
  url: z.string().url().nullable(),
  status: deploymentStatusSchema,
  createdAt: z.string().datetime(),
});

export const agentLogDTOSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  step: agentStepSchema,
  message: z.string().min(1),
  metadata: z.record(z.unknown()).nullable(),
  createdAt: z.string().datetime(),
});

/**
 * Input Schemas
 */

export const createUserInputSchema = z.object({
  clerkId: z.string().min(1),
  email: z.string().email(),
  name: z.string().nullable().optional(),
});

export const createProjectInputSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(1).max(100),
  description: z.string().max(500).nullable().optional(),
  prompt: z.string().min(10).max(10000),
  platforms: z.array(platformSchema).optional().default([Platform.CLOUDFLARE_PAGES]),
});

export const updateProjectInputSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  prompt: z.string().min(10).max(10000).optional(),
  status: projectStatusSchema.optional(),
  platforms: z.array(platformSchema).optional(),
});

export const createDeploymentInputSchema = z.object({
  projectId: z.string().min(1),
  platform: platformSchema,
});

export const createAgentLogInputSchema = z.object({
  projectId: z.string().min(1),
  step: agentStepSchema,
  message: z.string().min(1),
  metadata: z.record(z.unknown()).nullable().optional(),
});

/**
 * Type inference helpers
 */

export type UserSchema = z.infer<typeof userSchema>;
export type ProjectSchema = z.infer<typeof projectSchema>;
export type DeploymentSchema = z.infer<typeof deploymentSchema>;
export type AgentLogSchema = z.infer<typeof agentLogSchema>;

export type CreateUserInputSchema = z.infer<typeof createUserInputSchema>;
export type CreateProjectInputSchema = z.infer<typeof createProjectInputSchema>;
export type UpdateProjectInputSchema = z.infer<typeof updateProjectInputSchema>;
export type CreateDeploymentInputSchema = z.infer<typeof createDeploymentInputSchema>;
export type CreateAgentLogInputSchema = z.infer<typeof createAgentLogInputSchema>;
