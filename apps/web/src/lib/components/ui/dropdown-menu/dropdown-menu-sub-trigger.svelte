<script lang="ts">
  import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
  import { ChevronRight } from 'lucide-svelte';

  import { cn } from '$lib/utils.js';

  import type { Snippet } from 'svelte';

  type Props = {
    class?: string;
    inset?: boolean;
    disabled?: boolean;
    children?: Snippet;
  };

  const { class: className, inset, disabled = false, children }: Props = $props();
</script>

<DropdownMenuPrimitive.SubTrigger
  disabled={disabled}
  class={cn(
    'flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent',
    inset && 'pl-8',
    className
  )}
>
  {#if children}
    {@render children()}
  {/if}
  <ChevronRight class="ml-auto h-4 w-4" />
</DropdownMenuPrimitive.SubTrigger>
