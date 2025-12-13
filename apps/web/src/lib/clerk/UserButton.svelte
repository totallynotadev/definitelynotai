<script lang="ts">
	/**
	 * UserButton - Using $effect for Svelte 5 lifecycle
	 */
	import { browser } from '$app/environment';
	import type { UserButtonProps } from '@clerk/types';
	import { initClerk, getClerk } from './client.js';
	import { PUBLIC_CLERK_PUBLISHABLE_KEY } from '$env/static/public';

	interface Props {
		appearance?: UserButtonProps['appearance'];
		afterSignOutUrl?: string;
	}

	const { appearance, afterSignOutUrl = '/' }: Props = $props();

	// Use $state for DOM ref and UI state
	let containerEl = $state<HTMLDivElement | null>(null);
	let isReady = $state(false);
	let isMounted = false;
	let hasInitialized = false;

	// Use $effect for initialization
	$effect(() => {
		if (!browser || hasInitialized) {
			return;
		}

		hasInitialized = true;

		(async () => {
			try {
				await initClerk(PUBLIC_CLERK_PUBLISHABLE_KEY);

				const clerk = getClerk();
				// Only show if user is signed in
				if (!clerk?.user) {
					return;
				}

				isReady = true;
			} catch (e) {
				console.error('UserButton: error during init:', e);
			}
		})();
	});

	// Second effect to mount when container is ready
	$effect(() => {
		if (!isReady || !containerEl || isMounted) {
			return;
		}

		const clerk = getClerk();
		if (!clerk) return;

		try {
			clerk.mountUserButton(containerEl, {
				appearance,
				afterSignOutUrl
			});
			isMounted = true;
		} catch (e) {
			console.error('UserButton: error mounting:', e);
		}
	});
</script>

{#if isReady}
	<div bind:this={containerEl} class="clerk-user-button"></div>
{/if}
