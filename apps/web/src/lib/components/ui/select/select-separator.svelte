<script lang="ts">
  import { Select as SelectPrimitive } from 'bits-ui';
  import { cn } from '$lib/utils.js';
  import type { ComponentProps } from 'svelte';

  type Props = ComponentProps<typeof SelectPrimitive.Separator> & {
    class?: string;
  };

  let { class: className, ...restProps }: Props = $props();
</script>

<SelectPrimitive.Separator class={cn('-mx-1 my-1 h-px bg-muted', className)} {...restProps} />
