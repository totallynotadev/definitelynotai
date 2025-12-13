/**
 * Clerk integration for Svelte 5
 *
 * Uses vanilla @clerk/clerk-js with minimal Svelte wrappers.
 * No Svelte stores or reactivity - just DOM mounting.
 */

export { default as SignIn } from './SignIn.svelte';
export { default as SignUp } from './SignUp.svelte';
export { default as UserButton } from './UserButton.svelte';
export { initClerk, getClerk, isSignedIn, getUserId } from './client.js';
