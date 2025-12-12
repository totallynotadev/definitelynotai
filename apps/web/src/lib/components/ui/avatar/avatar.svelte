<script lang="ts">
  import { cn } from '$lib/utils.js';

  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  type Props = HTMLAttributes<HTMLSpanElement> & {
    class?: string;
    children?: Snippet;
  };

  const { class: className, children, ...restProps }: Props = $props();
</script>

<span
  class={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)}
  {...restProps}
>
  {#if children}
    {@render children()}
  {/if}
</span>
