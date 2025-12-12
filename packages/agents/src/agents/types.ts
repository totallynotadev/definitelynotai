import { z } from 'zod';
import type { ModelId } from '../router/model-router';

/**
 * Agent permission levels
 */
export const AgentPermission = z.enum([
  'read', // Can read data
  'write', // Can create/modify data
  'execute', // Can run code/commands
  'deploy', // Can deploy to staging/prod
  'billing', // Can access billing operations
  'approve', // Can approve other agents' actions
  'reject', // Can reject other agents' actions
]);

export type AgentPermission = z.infer<typeof AgentPermission>;

/**
 * Risk levels for actions
 */
export const RiskLevel = z.enum([
  'low', // Formatting, summaries - single model OK
  'medium', // PRs, docs, drafts - single model + validation
  'high', // Deploy, refunds - council approval required
  'critical', // Pricing changes, legal - council + human notification
]);

export type RiskLevel = z.infer<typeof RiskLevel>;

/**
 * Agent definition schema
 */
export const AgentDefinition = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  primaryModel: z.string() as z.ZodType<ModelId>,
  fallbackModel: z.string().optional() as z.ZodType<ModelId | undefined>,
  permissions: z.array(AgentPermission),
  maxRiskLevel: RiskLevel,
  systemPrompt: z.string(),
  tools: z.array(z.string()), // Tool IDs this agent can use
});

export type AgentDefinition = z.infer<typeof AgentDefinition>;

/**
 * Agent execution context
 */
export type AgentContext = {
  projectId: string;
  userId: string;
  sessionId: string;
  parentAgentId?: string; // For hierarchical tracking
  budget: {
    maxTokens: number;
    maxCost: number; // In cents
    maxDuration: number; // In seconds
  };
};

/**
 * Agent action output
 */
export type AgentAction = {
  id: string;
  agentId: string;
  type: 'message' | 'tool_call' | 'delegate' | 'approve' | 'reject';
  content: string;
  metadata?: Record<string, unknown>;
  riskLevel: RiskLevel;
  requiresApproval: boolean;
  timestamp: Date;
};

/**
 * Agent execution result
 */
export type AgentResult = {
  success: boolean;
  actions: AgentAction[];
  output?: string;
  error?: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    cost: number; // In cents
    duration: number; // In milliseconds
  };
};
