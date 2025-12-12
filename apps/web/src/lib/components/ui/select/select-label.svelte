<script lang="ts">
  import { Select as SelectPrimitive } from 'bits-ui';
  import { cn } from '$lib/utils.js';
  import type { Snippet, ComponentProps } from 'svelte';

  type Props = ComponentProps<typeof SelectPrimitive.Label> & {
    class?: string;
    children?: Snippet;
  };

  let { class: className, children, ...restProps }: Props = $props();
</script>

<SelectPrimitive.Label class={cn('py-1.5 pl-8 pr-2 text-sm font-semibold', className)} {...restProps}>
  {#if children}
    {@render children()}
  {/if}
</SelectPrimitive.Label>
