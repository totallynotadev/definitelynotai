import type { UsageStats, AgentMetrics } from "./types.js";

export interface MetricPoint {
  timestamp: Date;
  name: string;
  value: number;
  tags?: Record<string, string> | undefined;
}

export interface LatencyPercentiles {
  p50: number;
  p90: number;
  p95: number;
  p99: number;
}

export class MetricsCollector {
  private metrics: MetricPoint[] = [];
  private agentMetrics: AgentMetrics[] = [];

  /**
   * Record a metric point
   */
  record(name: string, value: number, tags?: Record<string, string>): void {
    const point: MetricPoint = {
      timestamp: new Date(),
      name,
      value,
    };

    if (tags !== undefined) {
      point.tags = tags;
    }

    this.metrics.push(point);
  }

  /**
   * Record agent execution
   */
  recordAgentExecution(metrics: AgentMetrics): void {
    this.agentMetrics.push(metrics);

    // Also record as metric points
    this.record("agent.execution", 1, {
      agentId: metrics.agentId,
      success: String(metrics.success),
    });
    this.record("agent.tokens.input", metrics.tokens.input, {
      agentId: metrics.agentId,
    });
    this.record("agent.tokens.output", metrics.tokens.output, {
      agentId: metrics.agentId,
    });
    this.record("agent.cost", metrics.cost, {
      agentId: metrics.agentId,
      model: metrics.model,
    });

    if (metrics.endTime && metrics.startTime) {
      const latency = metrics.endTime.getTime() - metrics.startTime.getTime();
      this.record("agent.latency", latency, { agentId: metrics.agentId });
    }
  }

  /**
   * Get usage statistics
   */
  getUsageStats(options?: {
    hours?: number | undefined;
    userId?: string | undefined;
  }): UsageStats {
    const hours = options?.hours ?? 24;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const recentMetrics = this.agentMetrics.filter((m) => m.startTime >= since);

    const totalRequests = recentMetrics.length;
    const successfulRequests = recentMetrics.filter((m) => m.success).length;
    const failedRequests = totalRequests - successfulRequests;

    // Calculate average latency
    const latencies = recentMetrics
      .filter((m) => m.endTime)
      .map((m) => m.endTime!.getTime() - m.startTime.getTime());
    const averageLatencyMs =
      latencies.length > 0
        ? latencies.reduce((a, b) => a + b, 0) / latencies.length
        : 0;

    // Total tokens and cost
    const totalTokens = recentMetrics.reduce(
      (sum, m) => sum + m.tokens.input + m.tokens.output,
      0
    );
    const totalCost = recentMetrics.reduce((sum, m) => sum + m.cost, 0);

    // Top models
    const modelCounts = new Map<string, { count: number; cost: number }>();
    for (const m of recentMetrics) {
      const current = modelCounts.get(m.model) ?? { count: 0, cost: 0 };
      modelCounts.set(m.model, {
        count: current.count + 1,
        cost: current.cost + m.cost,
      });
    }
    const topModels = Array.from(modelCounts.entries())
      .map(([model, data]) => ({ model, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top agents
    const agentCounts = new Map<string, { count: number; cost: number }>();
    for (const m of recentMetrics) {
      const current = agentCounts.get(m.agentId) ?? { count: 0, cost: 0 };
      agentCounts.set(m.agentId, {
        count: current.count + 1,
        cost: current.cost + m.cost,
      });
    }
    const topAgents = Array.from(agentCounts.entries())
      .map(([agent, data]) => ({ agent, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      averageLatencyMs: Math.round(averageLatencyMs),
      totalTokens,
      totalCost: Math.round(totalCost * 10000) / 10000,
      topModels,
      topAgents,
    };
  }

  /**
   * Get latency percentiles
   */
  getLatencyPercentiles(options?: {
    hours?: number | undefined;
    agentId?: string | undefined;
  }): LatencyPercentiles {
    const hours = options?.hours ?? 24;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    let filtered = this.agentMetrics.filter(
      (m) => m.startTime >= since && m.endTime
    );

    if (options?.agentId) {
      filtered = filtered.filter((m) => m.agentId === options.agentId);
    }

    const latencies = filtered
      .map((m) => m.endTime!.getTime() - m.startTime.getTime())
      .sort((a, b) => a - b);

    if (latencies.length === 0) {
      return { p50: 0, p90: 0, p95: 0, p99: 0 };
    }

    return {
      p50: latencies[Math.floor(latencies.length * 0.5)] ?? 0,
      p90: latencies[Math.floor(latencies.length * 0.9)] ?? 0,
      p95: latencies[Math.floor(latencies.length * 0.95)] ?? 0,
      p99: latencies[Math.floor(latencies.length * 0.99)] ?? 0,
    };
  }

  /**
   * Get metric values for a specific metric
   */
  getMetricValues(
    name: string,
    options?: {
      hours?: number | undefined;
      tags?: Record<string, string> | undefined;
    }
  ): MetricPoint[] {
    const hours = options?.hours ?? 24;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    return this.metrics.filter((m) => {
      if (m.name !== name) return false;
      if (m.timestamp < since) return false;

      if (options?.tags) {
        for (const [key, value] of Object.entries(options.tags)) {
          if (m.tags?.[key] !== value) return false;
        }
      }

      return true;
    });
  }

  /**
   * Get aggregated metrics (for charts)
   */
  getAggregatedMetrics(
    name: string,
    aggregation: "sum" | "avg" | "count",
    bucketMinutes: number = 60
  ): Array<{ timestamp: Date; value: number }> {
    const metrics = this.getMetricValues(name);
    const buckets = new Map<number, number[]>();

    for (const m of metrics) {
      const bucketKey = Math.floor(
        m.timestamp.getTime() / (bucketMinutes * 60 * 1000)
      );
      const existing = buckets.get(bucketKey);
      if (existing) {
        existing.push(m.value);
      } else {
        buckets.set(bucketKey, [m.value]);
      }
    }

    return Array.from(buckets.entries())
      .map(([key, values]) => {
        let value: number;
        switch (aggregation) {
          case "sum":
            value = values.reduce((a, b) => a + b, 0);
            break;
          case "avg":
            value = values.reduce((a, b) => a + b, 0) / values.length;
            break;
          case "count":
            value = values.length;
            break;
        }

        return {
          timestamp: new Date(key * bucketMinutes * 60 * 1000),
          value,
        };
      })
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Export data
   */
  exportData(): { metrics: MetricPoint[]; agentMetrics: AgentMetrics[] } {
    return {
      metrics: [...this.metrics],
      agentMetrics: [...this.agentMetrics],
    };
  }

  /**
   * Import data
   */
  importData(data: {
    metrics: MetricPoint[];
    agentMetrics: AgentMetrics[];
  }): void {
    this.metrics = data.metrics.map((m) => ({
      ...m,
      timestamp: new Date(m.timestamp),
    }));
    this.agentMetrics = data.agentMetrics.map((m) => {
      const result: AgentMetrics = {
        ...m,
        startTime: new Date(m.startTime),
      };
      if (m.endTime) {
        result.endTime = new Date(m.endTime);
      }
      return result;
    });
  }

  /**
   * Prune old data
   */
  prune(olderThan: Date): number {
    const initialCount = this.metrics.length + this.agentMetrics.length;

    this.metrics = this.metrics.filter((m) => m.timestamp >= olderThan);
    this.agentMetrics = this.agentMetrics.filter((m) => m.startTime >= olderThan);

    return initialCount - (this.metrics.length + this.agentMetrics.length);
  }
}
