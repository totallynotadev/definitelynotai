<script lang="ts">
  import '../app.css';
  import { ClerkProvider } from 'svelte-clerk';
  import { PUBLIC_CLERK_PUBLISHABLE_KEY } from '$env/static/public';
  import { browser } from '$app/environment';

  import Toaster from '$lib/components/Toaster.svelte';

  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
  }

  const { children }: Props = $props();
</script>

{#if browser}
  <ClerkProvider publishableKey={PUBLIC_CLERK_PUBLISHABLE_KEY}>
    {@render children()}
  </ClerkProvider>
{:else}
  {@render children()}
{/if}

<Toaster />
