<script lang="ts">
  import { Select as SelectPrimitive } from 'bits-ui';

  import { cn } from '$lib/utils.js';

  import type { Snippet } from 'svelte';

  type Props = {
    class?: string;
    children?: Snippet;
  };

  const { class: className, children }: Props = $props();
</script>

<SelectPrimitive.Label class={cn('py-1.5 pl-8 pr-2 text-sm font-semibold', className)}>
  {#if children}
    {@render children()}
  {/if}
</SelectPrimitive.Label>
