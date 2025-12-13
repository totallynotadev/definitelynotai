<script lang="ts">
	/**
	 * SignUp - Using $effect for Svelte 5 lifecycle
	 */
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { initClerk, getClerk } from './client.js';
	import { PUBLIC_CLERK_PUBLISHABLE_KEY } from '$env/static/public';

	interface Props {
		redirectUrl?: string;
		signInUrl?: string;
	}

	const { redirectUrl = '/projects', signInUrl = '/sign-in' }: Props = $props();

	// Use $state for DOM ref and UI state
	let containerEl = $state<HTMLDivElement | null>(null);
	let isReady = $state(false);
	let isMounted = false;
	let hasInitialized = false;

	console.log('[SignUp] Component script running, browser:', browser);

	// Use $effect for initialization - runs when dependencies change
	$effect(() => {
		console.log('[SignUp] $effect running, browser:', browser, 'hasInitialized:', hasInitialized);

		if (!browser || hasInitialized) {
			console.log('[SignUp] $effect skipping - not browser or already initialized');
			return;
		}

		hasInitialized = true;
		console.log('[SignUp] $effect starting initialization');

		// Initialize Clerk
		(async () => {
			try {
				console.log('[SignUp] calling initClerk');
				await initClerk(PUBLIC_CLERK_PUBLISHABLE_KEY);
				console.log('[SignUp] initClerk complete');

				isReady = true;
				console.log('[SignUp] isReady set to true');
			} catch (e) {
				console.error('[SignUp] error during Clerk init:', e);
			}
		})();
	});

	// Second effect to mount Clerk component when container is ready
	$effect(() => {
		console.log('[SignUp] mount $effect, isReady:', isReady, 'containerEl:', !!containerEl, 'isMounted:', isMounted);

		if (!isReady || !containerEl || isMounted) {
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
		try {
			clerk.mountSignUp(containerEl, {
				signInUrl,
				forceRedirectUrl: redirectUrl
			});
			isMounted = true;
			console.log('[SignUp] mounted successfully');
		} catch (e) {
			console.error('[SignUp] error mounting:', e);
		}
	});
</script>

{#if isReady}
	<div bind:this={containerEl} class="clerk-container"></div>
{:else}
	<div class="flex items-center justify-center p-8">
		<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-purple-500"></div>
	</div>
{/if}
