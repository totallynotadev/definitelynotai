<script lang="ts">
  import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
  import { cn } from '$lib/utils.js';
  import { Circle } from 'lucide-svelte';
  import type { Snippet, ComponentProps } from 'svelte';

  type Props = ComponentProps<typeof DropdownMenuPrimitive.RadioItem> & {
    class?: string;
    children?: Snippet;
  };

  let { class: className, children, ...restProps }: Props = $props();
</script>

<DropdownMenuPrimitive.RadioItem
  class={cn(
    'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
    className
  )}
  {...restProps}
>
  <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
    <Circle class="h-2 w-2 fill-current" />
  </span>
  {#if children}
    {@render children()}
  {/if}
</DropdownMenuPrimitive.RadioItem>
