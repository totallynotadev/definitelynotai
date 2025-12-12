<script lang="ts">
  import { Dialog as DialogPrimitive } from 'bits-ui';

  import { cn } from '$lib/utils.js';

  import type { Snippet } from 'svelte';

  type Props = {
    class?: string;
    children?: Snippet;
  };

  const { class: className, children }: Props = $props();
</script>

<DialogPrimitive.Description class={cn('text-sm text-muted-foreground', className)}>
  {#if children}
    {@render children()}
  {/if}
</DialogPrimitive.Description>
