/// <reference types="@sveltejs/kit" />

/**
 * Custom auth object returned by locals.auth()
 */
interface ClerkAuth {
	userId: string | null;
	sessionId: string | null;
	sessionClaims: Record<string, unknown> | null;
	getToken: () => Promise<string | null>;
	has: () => boolean;
	debug: () => Record<string, unknown>;
}

declare global {
	namespace App {
		interface Error {
			message: string;
			code?: string;
		}
		interface Locals {
			auth: () => ClerkAuth;
		}
		// eslint-disable-next-line @typescript-eslint/no-empty-object-type
		interface PageData {}
		// eslint-disable-next-line @typescript-eslint/no-empty-object-type
		interface PageState {}
		interface Platform {
			env?: object;
			context?: {
				waitUntil(promise: Promise<unknown>): void;
			};
			caches?: CacheStorage;
		}
	}
}

export {};
