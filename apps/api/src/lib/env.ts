import { z } from 'zod';

/**
 * Environment variable schema for validation
 */
export const envSchema = z.object({
  ENVIRONMENT: z.enum(['development', 'staging', 'production']).default('development'),
  API_VERSION: z.string().default('v1'),

  // Database (optional for now)
  DATABASE_URL: z.string().url().optional(),

  // Auth (optional for now)
  JWT_SECRET: z.string().min(32).optional(),
  AUTH_PROVIDER_URL: z.string().url().optional(),
  CLERK_SECRET_KEY: z.string().optional(),
  CLERK_WEBHOOK_SECRET: z.string().optional(),

  // LLM API Keys (all optional, at least one required for agent features)
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-').optional(),
  OPENAI_API_KEY: z.string().startsWith('sk-').optional(),
  GOOGLE_AI_API_KEY: z.string().optional(),
  XAI_API_KEY: z.string().optional(),

  // Sandbox / Execution
  E2B_API_KEY: z.string().optional(),
  MODAL_TOKEN_ID: z.string().optional(),
  MODAL_TOKEN_SECRET: z.string().optional(),

  // Observability
  LANGFUSE_PUBLIC_KEY: z.string().optional(),
  LANGFUSE_SECRET_KEY: z.string().optional(),
  LANGFUSE_HOST: z.string().url().optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Cloudflare Workers bindings
 */
export interface CloudflareBindings {
  // Environment variables
  ENVIRONMENT: string;
  API_VERSION: string;
  DATABASE_URL?: string;
  JWT_SECRET?: string;
  AUTH_PROVIDER_URL?: string;
  CLERK_SECRET_KEY?: string;
  CLERK_WEBHOOK_SECRET?: string;
  ANTHROPIC_API_KEY?: string;
  OPENAI_API_KEY?: string;
  GOOGLE_AI_API_KEY?: string;
  XAI_API_KEY?: string;

  // Sandbox / Execution
  E2B_API_KEY?: string;
  MODAL_TOKEN_ID?: string;
  MODAL_TOKEN_SECRET?: string;

  // Observability
  LANGFUSE_PUBLIC_KEY?: string;
  LANGFUSE_SECRET_KEY?: string;
  LANGFUSE_HOST?: string;

  // Cloudflare bindings (uncomment when configured)
  // DB: D1Database;
  // KV: KVNamespace;
  // BUCKET: R2Bucket;
}

/**
 * Validate environment variables
 */
export function validateEnv(env: Record<string, unknown>): Env {
  const result = envSchema.safeParse(env);

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Environment validation failed:\n${errors}`);
  }

  return result.data;
}
