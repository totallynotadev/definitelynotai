import { Hono } from 'hono';
import { Webhook } from 'svix';
import { getDb, users, eq } from '@definitelynotai/db';
import { generatePrefixedId, ID_PREFIXES } from '@definitelynotai/shared';

import type { CloudflareBindings } from '../../lib/env';

/**
 * Clerk webhook event types
 */
type ClerkUserEvent = {
  data: {
    id: string;
    email_addresses: Array<{
      id: string;
      email_address: string;
    }>;
    first_name: string | null;
    last_name: string | null;
    created_at: number;
    updated_at: number;
  };
  type: 'user.created' | 'user.updated' | 'user.deleted';
};

type ClerkWebhookEvent = ClerkUserEvent;

const clerk = new Hono<{ Bindings: CloudflareBindings }>();

/**
 * Clerk Webhook Handler
 * POST /webhooks/clerk
 *
 * Handles user sync events from Clerk:
 * - user.created: Creates a new user in our database
 * - user.updated: Updates user email/name
 * - user.deleted: Deletes user record
 */
clerk.post('/', async (c) => {
  // Get Svix headers for verification
  const svixId = c.req.header('svix-id');
  const svixTimestamp = c.req.header('svix-timestamp');
  const svixSignature = c.req.header('svix-signature');

  // Validate headers exist
  if (!svixId || !svixTimestamp || !svixSignature) {
    return c.json({ error: 'Missing svix headers', code: 'MISSING_HEADERS' }, 400);
  }

  // Get webhook secret from environment
  const webhookSecret = c.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('CLERK_WEBHOOK_SECRET is not configured');
    return c.json({ error: 'Webhook not configured', code: 'NOT_CONFIGURED' }, 500);
  }

  // Get raw body for signature verification
  const body = await c.req.text();

  // Verify webhook signature
  const wh = new Webhook(webhookSecret);
  let event: ClerkWebhookEvent;

  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return c.json({ error: 'Invalid signature', code: 'INVALID_SIGNATURE' }, 401);
  }

  // Get database client
  const db = getDb(c.env.DATABASE_URL);
  if (!db) {
    console.error('DATABASE_URL is not configured');
    return c.json({ error: 'Database not configured', code: 'DB_NOT_CONFIGURED' }, 500);
  }

  // Handle webhook events
  try {
    switch (event.type) {
      case 'user.created': {
        const { id: clerkId, email_addresses, first_name, last_name } = event.data;
        const primaryEmail = email_addresses[0]?.email_address;

        if (!primaryEmail) {
          console.error('User created without email address:', clerkId);
          return c.json({ error: 'No email address', code: 'NO_EMAIL' }, 400);
        }

        const name = [first_name, last_name].filter(Boolean).join(' ') || null;

        await db.insert(users).values({
          id: generatePrefixedId(ID_PREFIXES.USER),
          clerkId,
          email: primaryEmail,
          name,
        });

        console.log('User created:', clerkId);
        break;
      }

      case 'user.updated': {
        const { id: clerkId, email_addresses, first_name, last_name } = event.data;
        const primaryEmail = email_addresses[0]?.email_address;
        const name = [first_name, last_name].filter(Boolean).join(' ') || null;

        const updateData: { email?: string; name: string | null } = { name };
        if (primaryEmail) {
          updateData.email = primaryEmail;
        }

        await db
          .update(users)
          .set(updateData)
          .where(eq(users.clerkId, clerkId));

        console.log('User updated:', clerkId);
        break;
      }

      case 'user.deleted': {
        const { id: clerkId } = event.data;

        await db.delete(users).where(eq(users.clerkId, clerkId));

        console.log('User deleted:', clerkId);
        break;
      }

      default: {
        // Log unhandled event types but don't error
        console.log('Unhandled webhook event type:', (event as { type: string }).type);
      }
    }

    return c.json({ received: true });
  } catch (err) {
    console.error('Error processing webhook:', err);
    return c.json(
      { error: 'Failed to process webhook', code: 'PROCESSING_ERROR' },
      500
    );
  }
});

export { clerk };
