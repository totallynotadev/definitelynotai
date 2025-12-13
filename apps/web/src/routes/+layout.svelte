<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { PUBLIC_CLERK_PUBLISHABLE_KEY } from '$env/static/public';
  import { browser } from '$app/environment';
  import { initClerk } from '$lib/clerk/index.js';

  import Toaster from '$lib/components/Toaster.svelte';

  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
  }

  const { children }: Props = $props();

  let clerkReady = $state(false);

  // Initialize Clerk on mount (client-side only)
  onMount(async () => {
    if (browser) {
      await initClerk(PUBLIC_CLERK_PUBLISHABLE_KEY);
      clerkReady = true;
    }
  });
</script>

<div class="min-h-screen bg-gray-950">
  {@render children()}
</div>

<Toaster />
