import { createMiddleware } from "hono/factory";
import type { Context, Next } from "hono";
import { LangfuseClient, type TraceHandle } from "./langfuse.js";
import { CostTracker } from "./cost-tracker.js";
import { ErrorMonitor } from "./error-monitor.js";
import { MetricsCollector } from "./metrics.js";

export interface ObservabilityConfig {
  langfuse?: {
    publicKey: string;
    secretKey: string;
    baseUrl?: string | undefined;
  } | undefined;
  costTracker?: {
    dailyBudget?: number | undefined;
  } | undefined;
  enabled?: boolean | undefined;
}

export interface ObservabilityContext {
  trace: TraceHandle;
  costTracker: CostTracker;
  errorMonitor: ErrorMonitor;
  metrics: MetricsCollector;
  traceId: string;
}

// Extend Hono context
declare module "hono" {
  interface ContextVariableMap {
    observability: ObservabilityContext;
  }
}

// Singleton instances
let langfuseClient: LangfuseClient | null = null;
let costTracker: CostTracker | null = null;
let errorMonitor: ErrorMonitor | null = null;
let metricsCollector: MetricsCollector | null = null;

/**
 * Initialize observability
 */
export function initObservability(config: ObservabilityConfig): void {
  if (config.langfuse) {
    const langfuseConfig: import("./langfuse.js").LangfuseConfig = {
      publicKey: config.langfuse.publicKey,
      secretKey: config.langfuse.secretKey,
      enabled: config.enabled ?? true,
    };
    if (config.langfuse.baseUrl) {
      langfuseConfig.baseUrl = config.langfuse.baseUrl;
    }
    langfuseClient = new LangfuseClient(langfuseConfig);
  }

  costTracker = new CostTracker({
    dailyBudget: config.costTracker?.dailyBudget,
    onAlert: (message) => {
      console.warn(`[CostTracker] ${message}`);
      errorMonitor?.alert("warning", message, { source: "cost-tracker" });
    },
  });

  errorMonitor = new ErrorMonitor({
    onAlert: (alert) => {
      console.warn(`[Alert] ${alert.severity}: ${alert.message}`);
    },
  });

  metricsCollector = new MetricsCollector();
}

/**
 * Get observability instances
 */
export function getObservability(): {
  langfuse: LangfuseClient | null;
  costTracker: CostTracker;
  errorMonitor: ErrorMonitor;
  metrics: MetricsCollector;
} {
  if (!costTracker || !errorMonitor || !metricsCollector) {
    // Initialize with defaults if not already done
    initObservability({ enabled: false });
  }

  return {
    langfuse: langfuseClient,
    costTracker: costTracker!,
    errorMonitor: errorMonitor!,
    metrics: metricsCollector!,
  };
}

// NoOp trace handle for when Langfuse is not configured
const noOpTraceHandle: TraceHandle = {
  span: () => ({
    generation: () => ({ end: () => {}, error: () => {} }),
    event: () => {},
    end: () => {},
  }),
  generation: () => ({ end: () => {}, error: () => {} }),
  event: () => {},
  score: () => {},
  end: () => {},
};

/**
 * Observability middleware for Hono
 */
export function observabilityMiddleware() {
  return createMiddleware(async (c: Context, next: Next) => {
    const obs = getObservability();
    const traceId = c.req.header("x-trace-id") ?? crypto.randomUUID();
    const userId = c.get("userId") as string | undefined;

    // Create trace
    const trace =
      langfuseClient?.createTrace({
        traceId,
        userId,
        metadata: {
          path: c.req.path,
          method: c.req.method,
        },
      }) ?? noOpTraceHandle;

    // Set observability context
    c.set("observability", {
      trace,
      costTracker: obs.costTracker,
      errorMonitor: obs.errorMonitor,
      metrics: obs.metrics,
      traceId,
    });

    // Record request
    obs.metrics.record("http.request", 1, {
      method: c.req.method,
      path: c.req.path,
    });

    const startTime = Date.now();

    try {
      await next();

      // Record success
      obs.errorMonitor.recordSuccess();
      obs.metrics.record("http.response", 1, {
        method: c.req.method,
        path: c.req.path,
        status: String(c.res.status),
      });
    } catch (error) {
      // Record error
      obs.errorMonitor.captureException(error as Error, {
        traceId,
        userId,
      });

      obs.metrics.record("http.error", 1, {
        method: c.req.method,
        path: c.req.path,
      });

      throw error;
    } finally {
      // Record latency
      const latency = Date.now() - startTime;
      obs.metrics.record("http.latency", latency, {
        method: c.req.method,
        path: c.req.path,
      });

      // End trace
      trace.end();
    }
  });
}

/**
 * Shutdown observability (flush pending data)
 */
export async function shutdownObservability(): Promise<void> {
  if (langfuseClient) {
    await langfuseClient.shutdown();
  }
}
