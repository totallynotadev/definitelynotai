import type { GenerationMetrics, CostSummary } from "./types.js";

// Cost per 1M tokens (verified December 2025)
// Must match models in packages/agents/src/model-router.ts
const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  // Anthropic (https://www.anthropic.com/pricing)
  "claude-opus-4-5-20251101": { input: 5.0, output: 25.0 },
  "claude-sonnet-4-5-20250929": { input: 3.0, output: 15.0 },

  // OpenAI (https://openai.com/api/pricing)
  "gpt-5.2-pro": { input: 21.0, output: 168.0 },

  // Google (https://ai.google.dev/gemini-api/docs/pricing)
  "gemini-3-pro-preview": { input: 2.0, output: 12.0 },

  // xAI (https://docs.x.ai/docs/models)
  "grok-4-0709": { input: 3.0, output: 15.0 },

  // Fallback
  default: { input: 3.0, output: 15.0 },
};

export interface CostRecord {
  id: string;
  timestamp: Date;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  agentId?: string | undefined;
  projectId?: string | undefined;
  userId?: string | undefined;
}

export interface CostTrackerOptions {
  dailyBudget?: number | undefined;
  onAlert?: ((message: string) => void) | undefined;
}

export class CostTracker {
  private records: CostRecord[] = [];
  private dailyBudget?: number | undefined;
  private alertCallback?: ((message: string) => void) | undefined;

  constructor(options?: CostTrackerOptions) {
    this.dailyBudget = options?.dailyBudget;
    this.alertCallback = options?.onAlert;
  }

  /**
   * Calculate cost for a generation
   */
  calculateCost(
    model: string,
    inputTokens: number,
    outputTokens: number
  ): number {
    const costs = MODEL_COSTS[model] ?? MODEL_COSTS["default"]!;
    const inputCost = (inputTokens / 1_000_000) * costs.input;
    const outputCost = (outputTokens / 1_000_000) * costs.output;
    return Math.round((inputCost + outputCost) * 10000) / 10000; // Round to 4 decimals
  }

  /**
   * Record a generation's cost
   */
  recordCost(
    metrics: GenerationMetrics & {
      agentId?: string | undefined;
      projectId?: string | undefined;
      userId?: string | undefined;
    }
  ): CostRecord {
    const cost = this.calculateCost(
      metrics.model,
      metrics.inputTokens,
      metrics.outputTokens
    );

    const record: CostRecord = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      model: metrics.model,
      inputTokens: metrics.inputTokens,
      outputTokens: metrics.outputTokens,
      cost,
    };

    if (metrics.agentId !== undefined) {
      record.agentId = metrics.agentId;
    }
    if (metrics.projectId !== undefined) {
      record.projectId = metrics.projectId;
    }
    if (metrics.userId !== undefined) {
      record.userId = metrics.userId;
    }

    this.records.push(record);
    this.checkBudget();

    return record;
  }

  /**
   * Get cost summary
   */
  getSummary(options?: {
    startDate?: Date | undefined;
    endDate?: Date | undefined;
    userId?: string | undefined;
    projectId?: string | undefined;
  }): CostSummary {
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(dayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let filtered = this.records;

    if (options?.userId) {
      filtered = filtered.filter((r) => r.userId === options.userId);
    }

    if (options?.projectId) {
      filtered = filtered.filter((r) => r.projectId === options.projectId);
    }

    if (options?.startDate) {
      filtered = filtered.filter((r) => r.timestamp >= options.startDate!);
    }

    if (options?.endDate) {
      filtered = filtered.filter((r) => r.timestamp <= options.endDate!);
    }

    const daily = filtered
      .filter((r) => r.timestamp >= dayStart)
      .reduce((sum, r) => sum + r.cost, 0);

    const weekly = filtered
      .filter((r) => r.timestamp >= weekStart)
      .reduce((sum, r) => sum + r.cost, 0);

    const monthly = filtered
      .filter((r) => r.timestamp >= monthStart)
      .reduce((sum, r) => sum + r.cost, 0);

    const byModel: Record<string, number> = {};
    const byAgent: Record<string, number> = {};

    for (const record of filtered) {
      byModel[record.model] = (byModel[record.model] ?? 0) + record.cost;
      if (record.agentId) {
        byAgent[record.agentId] = (byAgent[record.agentId] ?? 0) + record.cost;
      }
    }

    return { daily, weekly, monthly, byModel, byAgent };
  }

  /**
   * Get recent records
   */
  getRecords(limit: number = 100): CostRecord[] {
    return this.records.slice(-limit);
  }

  /**
   * Check if budget exceeded
   */
  private checkBudget(): void {
    if (!this.dailyBudget || !this.alertCallback) return;

    const summary = this.getSummary();

    if (summary.daily >= this.dailyBudget) {
      this.alertCallback(
        `Daily budget exceeded: $${summary.daily.toFixed(2)} / $${this.dailyBudget}`
      );
    } else if (summary.daily >= this.dailyBudget * 0.8) {
      this.alertCallback(
        `80% of daily budget used: $${summary.daily.toFixed(2)} / $${this.dailyBudget}`
      );
    }
  }

  /**
   * Export records for persistence
   */
  exportRecords(): CostRecord[] {
    return [...this.records];
  }

  /**
   * Import records from persistence
   */
  importRecords(records: CostRecord[]): void {
    this.records = records.map((r) => ({
      ...r,
      timestamp: new Date(r.timestamp),
    }));
  }

  /**
   * Clear old records (for memory management)
   */
  pruneRecords(olderThan: Date): number {
    const initialCount = this.records.length;
    this.records = this.records.filter((r) => r.timestamp >= olderThan);
    return initialCount - this.records.length;
  }
}

/**
 * Get model costs info (for display)
 */
export function getModelCosts(): Record<
  string,
  { input: number; output: number }
> {
  return { ...MODEL_COSTS };
}

/**
 * Estimate cost before running
 */
export function estimateCost(
  model: string,
  estimatedInputTokens: number,
  estimatedOutputTokens: number
): { min: number; max: number; expected: number } {
  const costs = MODEL_COSTS[model] ?? MODEL_COSTS["default"]!;
  const expected =
    (estimatedInputTokens / 1_000_000) * costs.input +
    (estimatedOutputTokens / 1_000_000) * costs.output;

  return {
    min: expected * 0.5,
    max: expected * 2,
    expected: Math.round(expected * 10000) / 10000,
  };
}
