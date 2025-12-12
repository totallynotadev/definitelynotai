<script lang="ts">
  import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
  import { Circle } from 'lucide-svelte';

  import { cn } from '$lib/utils.js';

  import type { Snippet } from 'svelte';

  type Props = {
    class?: string;
    value: string;
    disabled?: boolean;
    children?: Snippet;
  };

  const { class: className, value, disabled = false, children }: Props = $props();
</script>

<DropdownMenuPrimitive.RadioItem
  {value}
  disabled={disabled}
  class={cn(
    'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
    className
  )}
>
  <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
    <Circle class="h-2 w-2 fill-current" />
  </span>
  {#if children}
    {@render children()}
  {/if}
</DropdownMenuPrimitive.RadioItem>
