<script lang="ts">
  import { Dialog as DialogPrimitive } from 'bits-ui';
  import { cn } from '$lib/utils.js';
  import type { Snippet, ComponentProps } from 'svelte';

  type Props = ComponentProps<typeof DialogPrimitive.Title> & {
    class?: string;
    children?: Snippet;
  };

  let { class: className, children, ...restProps }: Props = $props();
</script>

<DialogPrimitive.Title
  class={cn('text-lg font-semibold leading-none tracking-tight', className)}
  {...restProps}
>
  {#if children}
    {@render children()}
  {/if}
</DialogPrimitive.Title>
