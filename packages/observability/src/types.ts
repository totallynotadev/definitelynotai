export interface TraceContext {
  traceId: string;
  spanId?: string | undefined;
  userId?: string | undefined;
  sessionId?: string | undefined;
  projectId?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
}

export interface GenerationMetrics {
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  latencyMs: number;
  success: boolean;
  error?: string | undefined;
}

export interface AgentMetrics {
  agentId: string;
  taskType: string;
  model: string;
  startTime: Date;
  endTime?: Date | undefined;
  tokens: {
    input: number;
    output: number;
  };
  cost: number;
  success: boolean;
  error?: string | undefined;
}

export interface CostSummary {
  daily: number;
  weekly: number;
  monthly: number;
  byModel: Record<string, number>;
  byAgent: Record<string, number>;
}

export interface UsageStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatencyMs: number;
  totalTokens: number;
  totalCost: number;
  topModels: Array<{ model: string; count: number; cost: number }>;
  topAgents: Array<{ agent: string; count: number; cost: number }>;
}
