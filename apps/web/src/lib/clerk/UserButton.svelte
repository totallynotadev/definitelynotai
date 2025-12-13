<script lang="ts">
	/**
	 * UserButton - Clerk user button component
	 */
	import { onMount } from 'svelte';
	import type { UserButtonProps } from '@clerk/types';
	import { initClerk, getClerk } from './client.js';
	import { PUBLIC_CLERK_PUBLISHABLE_KEY } from '$env/static/public';

	interface Props {
		appearance?: UserButtonProps['appearance'];
		afterSignOutUrl?: string;
	}

	const { appearance, afterSignOutUrl = '/' }: Props = $props();

	// Use $state for DOM ref to work properly with bind:this in Svelte 5
	let containerEl = $state<HTMLDivElement | null>(null);
	// UI state
	let isReady = $state(false);
	let isMounted = false;

	onMount(() => {
		// Use async IIFE to handle async operations
		const initPromise = (async () => {
			try {
				await initClerk(PUBLIC_CLERK_PUBLISHABLE_KEY);

				const clerk = getClerk();
				// Only show if user is signed in
				if (!clerk?.user) {
					return;
				}

				isReady = true;

				// Wait a frame for the DOM to update
				await new Promise(resolve => requestAnimationFrame(resolve));

				if (!containerEl || !clerk) return;

				clerk.mountUserButton(containerEl, {
					appearance,
					afterSignOutUrl
				});
				isMounted = true;
			} catch (e) {
				console.error('UserButton: error:', e);
			}
		})();

		// Cleanup function
		return () => {
			if (isMounted && containerEl) {
				const clerk = getClerk();
				if (clerk) {
					try {
						clerk.unmountUserButton(containerEl);
					} catch {
						// Ignore cleanup errors
					}
				}
			}
		};
	});
</script>

{#if isReady}
	<div bind:this={containerEl} class="clerk-user-button"></div>
{/if}
