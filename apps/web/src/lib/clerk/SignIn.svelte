<script lang="ts">
	// DEBUG: Top of script - before any imports
	console.log('[SignIn] Script top - before imports');

	/**
	 * SignIn - Simple approach using vanilla Clerk JS
	 */
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { initClerk, getClerk } from './client.js';
	import { PUBLIC_CLERK_PUBLISHABLE_KEY } from '$env/static/public';

	console.log('[SignIn] After imports, PUBLIC_CLERK_PUBLISHABLE_KEY exists:', !!PUBLIC_CLERK_PUBLISHABLE_KEY);

	interface Props {
		redirectUrl?: string;
		signUpUrl?: string;
	}

	const { redirectUrl = '/projects', signUpUrl = '/sign-up' }: Props = $props();

	// Use $state for DOM ref to work properly with bind:this in Svelte 5
	let containerEl = $state<HTMLDivElement | null>(null);
	// UI state
	let isReady = $state(false);
	let isMounted = false;

	console.log('[SignIn] State initialized, registering onMount');

	onMount(() => {
		console.log('[SignIn] onMount callback executing');

		// Use async IIFE to handle async operations
		const initPromise = (async () => {
			console.log('[SignIn] async IIFE starting');

			try {
				// Wait for Clerk to fully initialize
				console.log('[SignIn] calling initClerk');
				await initClerk(PUBLIC_CLERK_PUBLISHABLE_KEY);
				console.log('[SignIn] initClerk complete');

				// Now set ready state to show the container
				isReady = true;
				console.log('[SignIn] isReady set to true');

				// Wait a frame for the DOM to update and containerEl to be set
				await new Promise(resolve => requestAnimationFrame(resolve));
				console.log('[SignIn] after requestAnimationFrame, containerEl:', !!containerEl);

				if (!containerEl) {
					console.error('[SignIn] containerEl is null after frame');
					return;
				}

				const clerk = getClerk();
				if (!clerk) {
					console.error('[SignIn] clerk is null');
					return;
				}

				// Check if already signed in
				if (clerk.user) {
					console.log('[SignIn] user already signed in, redirecting');
					goto(redirectUrl);
					return;
				}

				// Mount the SignIn component
				console.log('[SignIn] mounting clerk.mountSignIn');
				clerk.mountSignIn(containerEl, {
					signUpUrl,
					forceRedirectUrl: redirectUrl
				});
				isMounted = true;
				console.log('[SignIn] mounted successfully');
			} catch (e) {
				console.error('[SignIn] error during initialization:', e);
			}
		})();

		// Cleanup function
		return () => {
			console.log('[SignIn] cleanup, isMounted:', isMounted);
			if (isMounted && containerEl) {
				const clerk = getClerk();
				if (clerk) {
					try {
						clerk.unmountSignIn(containerEl);
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
