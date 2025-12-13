import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import { drizzle, NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema.js';

export type Database = NeonHttpDatabase<typeof schema>;

// Create a database client from connection string
export function createDb(databaseUrl: string): Database {
  const sql = neon(databaseUrl);
  return drizzle(sql, { schema });
}

// Helper to get raw SQL client for custom queries
export function createSqlClient(databaseUrl: string): NeonQueryFunction<false, false> {
  return neon(databaseUrl);
}
