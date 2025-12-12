<script lang="ts">
  import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
  import { cn } from '$lib/utils.js';
  import type { Snippet, ComponentProps } from 'svelte';

  type Props = ComponentProps<typeof DropdownMenuPrimitive.Label> & {
    class?: string;
    inset?: boolean;
    children?: Snippet;
  };

  let { class: className, inset, children, ...restProps }: Props = $props();
</script>

<DropdownMenuPrimitive.Label
  class={cn('px-2 py-1.5 text-sm font-semibold', inset && 'pl-8', className)}
  {...restProps}
>
  {#if children}
    {@render children()}
  {/if}
</DropdownMenuPrimitive.Label>
