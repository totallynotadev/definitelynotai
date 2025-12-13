import { pgTable, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// @agent:inject:schema

// Base user table (commonly needed)
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Example: User relations (agent can extend)
// export const usersRelations = relations(users, ({ many }) => ({
//   posts: many(posts),
// }));

// Type exports for use in routes
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
