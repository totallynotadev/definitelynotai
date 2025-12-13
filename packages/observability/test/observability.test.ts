import { describe, it, expect, beforeEach } from 'vitest';
import { CostTracker, ErrorMonitor, MetricsCollector, getModelCosts, estimateCost } from '../src/index.js';

describe('CostTracker', () => {
  let tracker: CostTracker;

  beforeEach(() => {
    tracker = new CostTracker();
  });

  it('should calculate costs correctly', () => {
    const cost = tracker.calculateCost('gpt-5.2-pro', 1000, 500);
    expect(cost).toBeGreaterThan(0);
  });

  it('should record and summarize costs', () => {
    tracker.recordCost({
      model: 'gpt-5.2-pro',
      inputTokens: 1000,
      outputTokens: 500,
      totalTokens: 1500,
      cost: 0.105,
      latencyMs: 1000,
      success: true,
    });

    const summary = tracker.getSummary();
    expect(summary.daily).toBeGreaterThan(0);
    expect(summary.byModel['gpt-5.2-pro']).toBeGreaterThan(0);
  });

  it('should estimate costs', () => {
    const estimate = estimateCost('claude-sonnet-4-5-20250929', 10000, 5000);
    expect(estimate.expected).toBeGreaterThan(0);
    expect(estimate.min).toBeLessThan(estimate.expected);
    expect(estimate.max).toBeGreaterThan(estimate.expected);
  });

  it('should use default costs for unknown models', () => {
    const cost = tracker.calculateCost('unknown-model', 1000, 500);
    expect(cost).toBeGreaterThan(0);
  });

  it('should trigger budget alert when exceeded', () => {
    let alertMessage = '';
    const trackerWithBudget = new CostTracker({
      dailyBudget: 0.001,
      onAlert: (message) => {
        alertMessage = message;
      },
    });

    trackerWithBudget.recordCost({
      model: 'gpt-5.2-pro',
      inputTokens: 10000,
      outputTokens: 5000,
      totalTokens: 15000,
      cost: 1.0,
      latencyMs: 1000,
      success: true,
    });

    expect(alertMessage).toContain('exceeded');
  });

  it('should prune old records', () => {
    tracker.recordCost({
      model: 'gpt-5.2-pro',
      inputTokens: 1000,
      outputTokens: 500,
      totalTokens: 1500,
      cost: 0.105,
      latencyMs: 1000,
      success: true,
    });

    const pruned = tracker.pruneRecords(new Date(Date.now() + 1000));
    expect(pruned).toBe(1);
    expect(tracker.getRecords()).toHaveLength(0);
  });

  it('should export and import records', () => {
    tracker.recordCost({
      model: 'gpt-5.2-pro',
      inputTokens: 1000,
      outputTokens: 500,
      totalTokens: 1500,
      cost: 0.105,
      latencyMs: 1000,
      success: true,
    });

    const exported = tracker.exportRecords();
    expect(exported).toHaveLength(1);

    const newTracker = new CostTracker();
    newTracker.importRecords(exported);
    expect(newTracker.getRecords()).toHaveLength(1);
  });
});

describe('ErrorMonitor', () => {
  let monitor: ErrorMonitor;

  beforeEach(() => {
    monitor = new ErrorMonitor();
  });

  it('should record errors', () => {
    monitor.recordError({
      type: 'agent',
      message: 'Test error',
    });

    const stats = monitor.getStats();
    expect(stats.total).toBe(1);
  });

  it('should calculate error rate', () => {
    monitor.recordError({ type: 'agent', message: 'Error' });
    monitor.recordSuccess();
    monitor.recordSuccess();

    const stats = monitor.getStats();
    expect(stats.errorRate).toBeCloseTo(33.33, 1);
  });

  it('should capture exceptions', () => {
    const error = new Error('API failed');
    monitor.captureException(error, { agentId: 'test' });

    const stats = monitor.getStats();
    expect(stats.total).toBe(1);
  });

  it('should infer error types from exception message', () => {
    const apiError = new Error('API request failed');
    const agentError = new Error('Agent token limit exceeded');
    const deployError = new Error('GitHub deployment failed');
    const validError = new Error('TypeScript validation error');

    monitor.captureException(apiError);
    monitor.captureException(agentError);
    monitor.captureException(deployError);
    monitor.captureException(validError);

    const stats = monitor.getStats();
    expect(stats.byType['api']).toBe(1);
    expect(stats.byType['agent']).toBe(1);
    expect(stats.byType['deployment']).toBe(1);
    expect(stats.byType['validation']).toBe(1);
  });

  it('should create and manage alerts', () => {
    const alert = monitor.alert('warning', 'High error rate', { count: 10 });

    expect(alert.severity).toBe('warning');
    expect(alert.acknowledged).toBe(false);

    const activeAlerts = monitor.getActiveAlerts();
    expect(activeAlerts).toHaveLength(1);

    monitor.acknowledgeAlert(alert.id);
    expect(monitor.getActiveAlerts()).toHaveLength(0);
  });

  it('should resolve errors', () => {
    const record = monitor.recordError({
      type: 'agent',
      message: 'Test error',
    });

    expect(record.resolved).toBe(false);

    monitor.resolveError(record.id);

    const stats = monitor.getStats();
    const recentError = stats.recentErrors.find((e) => e.id === record.id);
    expect(recentError?.resolved).toBe(true);
  });

  it('should export and import data', () => {
    monitor.recordError({ type: 'agent', message: 'Error 1' });
    monitor.alert('error', 'Alert 1');

    const exported = monitor.exportData();
    expect(exported.errors).toHaveLength(1);
    expect(exported.alerts).toHaveLength(1);

    const newMonitor = new ErrorMonitor();
    newMonitor.importData(exported);

    const stats = newMonitor.getStats();
    expect(stats.total).toBe(1);
  });
});

describe('MetricsCollector', () => {
  let collector: MetricsCollector;

  beforeEach(() => {
    collector = new MetricsCollector();
  });

  it('should record metrics', () => {
    collector.record('test.metric', 42, { tag: 'value' });

    const values = collector.getMetricValues('test.metric');
    expect(values).toHaveLength(1);
    expect(values[0].value).toBe(42);
  });

  it('should calculate usage stats', () => {
    collector.recordAgentExecution({
      agentId: 'test-agent',
      taskType: 'code',
      model: 'gpt-5.2-pro',
      startTime: new Date(),
      endTime: new Date(),
      tokens: { input: 1000, output: 500 },
      cost: 0.01,
      success: true,
    });

    const stats = collector.getUsageStats();
    expect(stats.totalRequests).toBe(1);
    expect(stats.successfulRequests).toBe(1);
  });

  it('should calculate latency percentiles', () => {
    for (let i = 0; i < 100; i++) {
      const start = new Date();
      collector.recordAgentExecution({
        agentId: 'test',
        taskType: 'code',
        model: 'gpt-5.2-pro',
        startTime: start,
        endTime: new Date(start.getTime() + i * 10), // 0-990ms
        tokens: { input: 100, output: 50 },
        cost: 0.001,
        success: true,
      });
    }

    const percentiles = collector.getLatencyPercentiles();
    expect(percentiles.p50).toBeGreaterThan(0);
    expect(percentiles.p99).toBeGreaterThan(percentiles.p50);
  });

  it('should filter metrics by tags', () => {
    collector.record('test.metric', 1, { env: 'prod' });
    collector.record('test.metric', 2, { env: 'dev' });
    collector.record('test.metric', 3, { env: 'prod' });

    const prodValues = collector.getMetricValues('test.metric', { tags: { env: 'prod' } });
    expect(prodValues).toHaveLength(2);
  });

  it('should aggregate metrics for charts', () => {
    const now = Date.now();
    collector.record('test.metric', 10);
    collector.record('test.metric', 20);
    collector.record('test.metric', 30);

    const sumAgg = collector.getAggregatedMetrics('test.metric', 'sum', 60);
    expect(sumAgg.length).toBeGreaterThan(0);

    const avgAgg = collector.getAggregatedMetrics('test.metric', 'avg', 60);
    expect(avgAgg.length).toBeGreaterThan(0);

    const countAgg = collector.getAggregatedMetrics('test.metric', 'count', 60);
    expect(countAgg.length).toBeGreaterThan(0);
  });

  it('should track top models and agents', () => {
    for (let i = 0; i < 5; i++) {
      collector.recordAgentExecution({
        agentId: 'agent-a',
        taskType: 'code',
        model: 'gpt-5.2-pro',
        startTime: new Date(),
        endTime: new Date(),
        tokens: { input: 100, output: 50 },
        cost: 0.01,
        success: true,
      });
    }

    for (let i = 0; i < 3; i++) {
      collector.recordAgentExecution({
        agentId: 'agent-b',
        taskType: 'code',
        model: 'claude-sonnet-4-5-20250929',
        startTime: new Date(),
        endTime: new Date(),
        tokens: { input: 100, output: 50 },
        cost: 0.01,
        success: true,
      });
    }

    const stats = collector.getUsageStats();
    expect(stats.topModels[0].model).toBe('gpt-5.2-pro');
    expect(stats.topAgents[0].agent).toBe('agent-a');
  });

  it('should export and import data', () => {
    collector.record('test.metric', 42);
    collector.recordAgentExecution({
      agentId: 'test',
      taskType: 'code',
      model: 'gpt-5.2-pro',
      startTime: new Date(),
      endTime: new Date(),
      tokens: { input: 100, output: 50 },
      cost: 0.01,
      success: true,
    });

    const exported = collector.exportData();
    expect(exported.metrics.length).toBeGreaterThan(0);
    expect(exported.agentMetrics.length).toBeGreaterThan(0);

    const newCollector = new MetricsCollector();
    newCollector.importData(exported);

    const stats = newCollector.getUsageStats();
    expect(stats.totalRequests).toBe(1);
  });

  it('should prune old data', () => {
    collector.record('test.metric', 42);
    collector.recordAgentExecution({
      agentId: 'test',
      taskType: 'code',
      model: 'gpt-5.2-pro',
      startTime: new Date(),
      endTime: new Date(),
      tokens: { input: 100, output: 50 },
      cost: 0.01,
      success: true,
    });

    const pruned = collector.prune(new Date(Date.now() + 1000));
    expect(pruned).toBeGreaterThan(0);
  });
});

describe('getModelCosts', () => {
  it('should return all model costs', () => {
    const costs = getModelCosts();
    expect(costs['gpt-5.2-pro']).toBeDefined();
    expect(costs['claude-sonnet-4-5-20250929']).toBeDefined();
    expect(costs['claude-opus-4-5-20251101']).toBeDefined();
    expect(costs['gemini-3-pro-preview']).toBeDefined();
    expect(costs['grok-4-0709']).toBeDefined();
  });

  it('should have input and output costs for each model', () => {
    const costs = getModelCosts();
    for (const [model, cost] of Object.entries(costs)) {
      expect(cost.input).toBeGreaterThan(0);
      expect(cost.output).toBeGreaterThan(0);
    }
  });
});
