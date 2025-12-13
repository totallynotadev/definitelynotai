import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

// @agent:inject:schema
// Agent will add table definitions here

// Example structure (agent replaces this):
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});
