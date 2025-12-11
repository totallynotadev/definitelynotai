/// <reference types="@sveltejs/kit" />
/* eslint-disable @typescript-eslint/no-empty-object-type */

declare global {
  namespace App {
    interface Error {
      message: string;
      code?: string;
    }
    interface Locals {}
    interface PageData {}
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
