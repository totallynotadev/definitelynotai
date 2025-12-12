<script lang="ts">
  import '../app.css';
  import { ClerkProvider } from 'svelte-clerk';
  import Toaster from '$lib/components/Toaster.svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
  }

  const { children }: Props = $props();
</script>

<ClerkProvider>
  {@render children()}
</ClerkProvider>

<Toaster />
