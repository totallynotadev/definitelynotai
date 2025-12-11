import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

import * as schema from './schema';

/**
 * Configure Neon for edge environments
 */
neonConfig.fetchConnectionCache = true;

/**
 * Create a database client
 * @param connectionString - Neon database connection string
 * @returns Drizzle database instance
 */
export function createClient(connectionString: string) {
  const sql = neon(connectionString);
  return drizzle(sql, { schema });
}

/**
 * Database client type
 */
export type Database = ReturnType<typeof createClient>;

/**
 * Create a singleton database client from environment variable
 * Note: This should only be used in environments where DATABASE_URL is available
 */
let _db: Database | null = null;

export function getDb(): Database {
  if (!_db) {
    const connectionString = process.env['DATABASE_URL'];
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    _db = createClient(connectionString);
  }
  return _db;
}

/**
 * Reset the singleton (useful for testing)
 */
export function resetDb(): void {
  _db = null;
}
