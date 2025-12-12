import { z } from 'zod';

/**
 * Supported LLM providers
 */
export type LLMProvider = 'anthropic' | 'openai' | 'google' | 'xai';

/**
 * Agent workflow states
 */
export type AgentState = 'planning' | 'generating' | 'validating' | 'complete' | 'failed';

/**
 * Configuration for LLM clients
 */
export type LLMConfig = {
  provider: LLMProvider;
  apiKey: string;
  model?: string;
  baseUrl?: string;
};

/**
 * Schema for agent configuration
 */
export const agentConfigSchema = z.object({
  primaryProvider: z.enum(['anthropic', 'openai', 'google', 'xai']).default('anthropic'),
  fallbackProvider: z.enum(['anthropic', 'openai', 'google', 'xai']).optional(),
  maxRetries: z.number().min(0).max(5).default(3),
  timeout: z.number().min(1000).max(300000).default(60000),
});

export type AgentConfig = z.infer<typeof agentConfigSchema>;

/**
 * Message types for agent communication
 */
export type AgentMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

/**
 * Agent log entry for tracing
 */
export type AgentLogEntry = {
  id: string;
  projectId: string;
  step: string;
  state: AgentState;
  message: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
};
