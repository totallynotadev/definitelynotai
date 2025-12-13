import { Langfuse } from "langfuse";
import type { TraceContext, GenerationMetrics } from "./types.js";

export interface LangfuseConfig {
  publicKey: string;
  secretKey: string;
  baseUrl?: string;
  enabled?: boolean;
}

export class LangfuseClient {
  private client: Langfuse | null = null;
  private enabled: boolean;

  constructor(config: LangfuseConfig) {
    this.enabled = config.enabled ?? true;

    if (this.enabled && config.publicKey && config.secretKey) {
      const langfuseOptions: ConstructorParameters<typeof Langfuse>[0] = {
        publicKey: config.publicKey,
        secretKey: config.secretKey,
      };
      if (config.baseUrl) {
        langfuseOptions.baseUrl = config.baseUrl;
      }
      this.client = new Langfuse(langfuseOptions);
    }
  }

  /**
   * Create a new trace for a request
   */
  createTrace(context: TraceContext): TraceHandle {
    if (!this.client || !this.enabled) {
      return new NoOpTraceHandle();
    }

    const trace = this.client.trace({
      id: context.traceId,
      userId: context.userId ?? null,
      sessionId: context.sessionId ?? null,
      metadata: {
        projectId: context.projectId,
        ...context.metadata,
      },
    });

    return new LangfuseTraceHandle(trace, this.client);
  }

  /**
   * Flush all pending events
   */
  async flush(): Promise<void> {
    if (this.client) {
      await this.client.flushAsync();
    }
  }

  /**
   * Shutdown the client
   */
  async shutdown(): Promise<void> {
    if (this.client) {
      await this.client.shutdownAsync();
    }
  }
}

export interface TraceHandle {
  span(name: string, metadata?: Record<string, unknown>): SpanHandle;
  generation(name: string, model: string, input: unknown): GenerationHandle;
  event(name: string, metadata?: Record<string, unknown>): void;
  score(name: string, value: number, comment?: string): void;
  end(): void;
}

export interface SpanHandle {
  generation(name: string, model: string, input: unknown): GenerationHandle;
  event(name: string, metadata?: Record<string, unknown>): void;
  end(metadata?: Record<string, unknown>): void;
}

export interface GenerationHandle {
  end(output: unknown, metrics: Partial<GenerationMetrics>): void;
  error(error: Error): void;
}

class LangfuseTraceHandle implements TraceHandle {
  constructor(
    private trace: ReturnType<Langfuse["trace"]>,
    private client: Langfuse
  ) {}

  span(name: string, metadata?: Record<string, unknown>): SpanHandle {
    const span = this.trace.span({ name, metadata });
    return new LangfuseSpanHandle(span);
  }

  generation(name: string, model: string, input: unknown): GenerationHandle {
    const generation = this.trace.generation({
      name,
      model,
      input,
      startTime: new Date(),
    });
    return new LangfuseGenerationHandle(generation);
  }

  event(name: string, metadata?: Record<string, unknown>): void {
    this.trace.event({ name, metadata });
  }

  score(name: string, value: number, comment?: string): void {
    this.client.score({
      traceId: this.trace.id,
      name,
      value,
      comment: comment ?? null,
    });
  }

  end(): void {
    // Trace completion is handled by Langfuse automatically
  }
}

class LangfuseSpanHandle implements SpanHandle {
  constructor(
    private span: ReturnType<ReturnType<Langfuse["trace"]>["span"]>
  ) {}

  generation(name: string, model: string, input: unknown): GenerationHandle {
    const generation = this.span.generation({
      name,
      model,
      input,
      startTime: new Date(),
    });
    return new LangfuseGenerationHandle(generation);
  }

  event(name: string, metadata?: Record<string, unknown>): void {
    this.span.event({ name, metadata });
  }

  end(metadata?: Record<string, unknown>): void {
    this.span.end({ metadata });
  }
}

class LangfuseGenerationHandle implements GenerationHandle {
  constructor(
    private generation: ReturnType<
      ReturnType<Langfuse["trace"]>["generation"]
    >
  ) {}

  end(output: unknown, metrics: Partial<GenerationMetrics>): void {
    this.generation.end({
      output,
      usage: {
        input: metrics.inputTokens ?? null,
        output: metrics.outputTokens ?? null,
        total: metrics.totalTokens ?? null,
      },
      metadata: {
        cost: metrics.cost,
        latencyMs: metrics.latencyMs,
        success: metrics.success,
      },
    });
  }

  error(error: Error): void {
    this.generation.end({
      statusMessage: error.message,
      level: "ERROR",
    });
  }
}

class NoOpTraceHandle implements TraceHandle {
  span(): SpanHandle {
    return new NoOpSpanHandle();
  }

  generation(): GenerationHandle {
    return new NoOpGenerationHandle();
  }

  event(): void {}

  score(): void {}

  end(): void {}
}

class NoOpSpanHandle implements SpanHandle {
  generation(): GenerationHandle {
    return new NoOpGenerationHandle();
  }

  event(): void {}

  end(): void {}
}

class NoOpGenerationHandle implements GenerationHandle {
  end(): void {}

  error(): void {}
}
