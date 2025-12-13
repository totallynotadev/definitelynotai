<script lang="ts">
	// DEBUG: Top of script - before any imports
	console.log('[SignUp] Script top - before imports');

	/**
	 * SignUp - Simple approach using vanilla Clerk JS
	 */
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { initClerk, getClerk } from './client.js';
	import { PUBLIC_CLERK_PUBLISHABLE_KEY } from '$env/static/public';

	console.log('[SignUp] After imports, PUBLIC_CLERK_PUBLISHABLE_KEY exists:', !!PUBLIC_CLERK_PUBLISHABLE_KEY);

	interface Props {
		redirectUrl?: string;
		signInUrl?: string;
	}

	const { redirectUrl = '/projects', signInUrl = '/sign-in' }: Props = $props();

	// Use $state for DOM ref to work properly with bind:this in Svelte 5
	let containerEl = $state<HTMLDivElement | null>(null);
	// UI state
	let isReady = $state(false);
	let isMounted = false;

	console.log('[SignUp] State initialized, registering onMount');

	onMount(() => {
		console.log('[SignUp] onMount callback executing');

		// Use async IIFE to handle async operations
		const initPromise = (async () => {
			console.log('[SignUp] async IIFE starting');

			try {
				// Wait for Clerk to fully initialize
				console.log('[SignUp] calling initClerk');
				await initClerk(PUBLIC_CLERK_PUBLISHABLE_KEY);
				console.log('[SignUp] initClerk complete');

				// Now set ready state to show the container
				isReady = true;
				console.log('[SignUp] isReady set to true');

				// Wait a frame for the DOM to update and containerEl to be set
				await new Promise(resolve => requestAnimationFrame(resolve));
				console.log('[SignUp] after requestAnimationFrame, containerEl:', !!containerEl);

				if (!containerEl) {
					console.error('[SignUp] containerEl is null after frame');
					return;
				}

				const clerk = getClerk();
				if (!clerk) {
					console.error('[SignUp] clerk is null');
					return;
				}

				// Check if already signed in
				if (clerk.user) {
					console.log('[SignUp] user already signed in, redirecting');
					goto(redirectUrl);
					return;
				}

				// Mount the SignUp component
				console.log('[SignUp] mounting clerk.mountSignUp');
				clerk.mountSignUp(containerEl, {
					signInUrl,
					forceRedirectUrl: redirectUrl
				});
				isMounted = true;
				console.log('[SignUp] mounted successfully');
			} catch (e) {
				console.error('[SignUp] error during initialization:', e);
			}
		})();

		// Cleanup function
		return () => {
			console.log('[SignUp] cleanup, isMounted:', isMounted);
			if (isMounted && containerEl) {
				const clerk = getClerk();
				if (clerk) {
					try {
						clerk.unmountSignUp(containerEl);
					} catch {
						// Ignore cleanup errors
					}
				}
			}
		};
	});
</script>

{#if isReady}
	<div bind:this={containerEl} class="clerk-container"></div>
{:else}
	<div class="flex items-center justify-center p-8">
		<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-purple-500"></div>
	</div>
{/if}
