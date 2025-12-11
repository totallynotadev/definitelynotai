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

  // External services (optional for now)
  OPENAI_API_KEY: z.string().startsWith('sk-').optional(),
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-').optional(),
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
  OPENAI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;

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
