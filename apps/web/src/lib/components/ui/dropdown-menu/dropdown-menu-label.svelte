<script lang="ts">
  import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
  import { cn } from '$lib/utils.js';
  import type { Snippet } from 'svelte';

  type Props = {
    class?: string;
    inset?: boolean;
    children?: Snippet;
  };

  let { class: className, inset, children }: Props = $props();
</script>

<DropdownMenuPrimitive.Label
  class={cn('px-2 py-1.5 text-sm font-semibold', inset && 'pl-8', className)}
>
  {#if children}
    {@render children()}
  {/if}
</DropdownMenuPrimitive.Label>
