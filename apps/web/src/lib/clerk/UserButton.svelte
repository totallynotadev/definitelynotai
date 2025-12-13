<script lang="ts">
	/**
	 * UserButton - Simple approach: no $effect, no $state for DOM refs
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

	// Regular let for DOM ref - NOT $state
	let containerEl: HTMLDivElement;
	// Use $state only for UI state
	let isReady = $state(false);
	let isMounted = false;

	onMount(async () => {
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

		return () => {
			if (isMounted && containerEl) {
				const clerk = getClerk();
				if (clerk) {
					try {
						clerk.unmountUserButton(containerEl);
					} catch {
						// Ignore
					}
				}
			}
		};
	});
</script>

{#if isReady}
	<div bind:this={containerEl} class="clerk-user-button"></div>
{/if}
