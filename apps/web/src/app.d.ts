/// <reference types="@sveltejs/kit" />
/// <reference types="svelte-clerk/env" />

declare global {
  namespace App {
    interface Error {
      message: string;
      code?: string;
    }
    // Locals is extended by svelte-clerk/env to include auth()
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface Locals {}
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
