import { z } from 'zod';

// Environment variable schema
export const envSchema = z.object({
  // Required
  DATABASE_URL: z.string().url(),
  CLERK_SECRET_KEY: z.string().min(1),

  // Optional with defaults
  ENVIRONMENT: z.enum(['development', 'staging', 'production']).default('development'),
  ALLOWED_ORIGINS: z.string().optional(),

  // @agent:inject:env-schema
});

export type Env = z.infer<typeof envSchema>;

// Validate environment variables
export function validateEnv(env: Record<string, unknown>): Env {
  const result = envSchema.safeParse(env);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    console.error('Environment validation failed:', errors);
    throw new Error(`Invalid environment variables: ${JSON.stringify(errors)}`);
  }

  return result.data;
}

// Helper to check if we're in development
export function isDevelopment(env: Env): boolean {
  return env.ENVIRONMENT === 'development';
}

// Helper to check if we're in production
export function isProduction(env: Env): boolean {
  return env.ENVIRONMENT === 'production';
}
