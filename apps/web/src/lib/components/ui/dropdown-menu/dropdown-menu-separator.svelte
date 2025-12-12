<script lang="ts">
  import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
  import { cn } from '$lib/utils.js';
  import type { ComponentProps } from 'svelte';

  type Props = ComponentProps<typeof DropdownMenuPrimitive.Separator> & {
    class?: string;
  };

  let { class: className, ...restProps }: Props = $props();
</script>

<DropdownMenuPrimitive.Separator class={cn('-mx-1 my-1 h-px bg-muted', className)} {...restProps} />
