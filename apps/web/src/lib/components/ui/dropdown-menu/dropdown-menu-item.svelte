<script lang="ts">
  import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';

  import { cn } from '$lib/utils.js';

  import type { Snippet } from 'svelte';

  type Props = {
    class?: string;
    inset?: boolean;
    disabled?: boolean;
    children?: Snippet;
  };

  const { class: className, inset, disabled, children }: Props = $props();
</script>

<DropdownMenuPrimitive.Item
  {disabled}
  class={cn(
    'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
    inset && 'pl-8',
    className
  )}
>
  {#if children}
    {@render children()}
  {/if}
</DropdownMenuPrimitive.Item>
