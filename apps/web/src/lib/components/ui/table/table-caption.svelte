<script lang="ts">
  import { cn } from '$lib/utils.js';
  import type { Snippet } from 'svelte';

  type Props = {
    class?: string;
    children?: Snippet;
  };

  let { class: className, children }: Props = $props();
</script>

<caption class={cn('mt-4 text-sm text-muted-foreground', className)}>
  {#if children}
    {@render children()}
  {/if}
</caption>
