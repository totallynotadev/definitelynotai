import { Hono } from 'hono';
import { getObservability } from '@definitelynotai/observability';

import type { CloudflareBindings } from '../lib/env';
import type { AuthVariables } from '../middleware/auth';

const observability = new Hono<{ Bindings: CloudflareBindings; Variables: AuthVariables }>();

// Get cost summary
observability.get('/costs', async (c) => {
  const obs = getObservability();
  const auth = c.get('auth');
  const projectId = c.req.query('projectId');

  const summary = obs.costTracker.getSummary({
    userId: auth.userId ?? undefined,
    projectId,
  });

  return c.json({ costs: summary });
});

// Get cost records
observability.get('/costs/records', async (c) => {
  const obs = getObservability();
  const limit = parseInt(c.req.query('limit') ?? '100');

  const records = obs.costTracker.getRecords(limit);

  return c.json({ records });
});

// Get error stats
observability.get('/errors', async (c) => {
  const obs = getObservability();
  const hours = parseInt(c.req.query('hours') ?? '24');

  const stats = obs.errorMonitor.getStats({ hours });

  return c.json({ errors: stats });
});

// Get active alerts
observability.get('/alerts', async (c) => {
  const obs = getObservability();

  const alerts = obs.errorMonitor.getActiveAlerts();

  return c.json({ alerts });
});

// Acknowledge an alert
observability.post('/alerts/:id/acknowledge', async (c) => {
  const obs = getObservability();
  const alertId = c.req.param('id');

  obs.errorMonitor.acknowledgeAlert(alertId);

  return c.json({ acknowledged: true });
});

// Get usage stats
observability.get('/usage', async (c) => {
  const obs = getObservability();
  const hours = parseInt(c.req.query('hours') ?? '24');

  const stats = obs.metrics.getUsageStats({ hours });

  return c.json({ usage: stats });
});

// Get latency percentiles
observability.get('/latency', async (c) => {
  const obs = getObservability();
  const hours = parseInt(c.req.query('hours') ?? '24');
  const agentId = c.req.query('agentId');

  const percentiles = obs.metrics.getLatencyPercentiles({ hours, agentId });

  return c.json({ latency: percentiles });
});

// Get metrics for charts
observability.get('/metrics/:name', async (c) => {
  const obs = getObservability();
  const name = c.req.param('name');
  const aggregation = (c.req.query('aggregation') ?? 'sum') as 'sum' | 'avg' | 'count';
  const bucketMinutes = parseInt(c.req.query('bucket') ?? '60');

  const data = obs.metrics.getAggregatedMetrics(name, aggregation, bucketMinutes);

  return c.json({ metrics: data });
});

// Health check with observability status
observability.get('/health', async (c) => {
  const obs = getObservability();

  const stats = obs.metrics.getUsageStats({ hours: 1 });
  const errors = obs.errorMonitor.getStats({ hours: 1 });

  return c.json({
    status: 'ok',
    observability: {
      requestsLastHour: stats.totalRequests,
      errorsLastHour: errors.total,
      errorRate: errors.errorRate,
    },
  });
});

export { observability };
