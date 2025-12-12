<script lang="ts">
  import { cn } from '$lib/utils.js';
  import type { HTMLAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';

  type Props = HTMLAttributes<HTMLSpanElement> & {
    class?: string;
    children?: Snippet;
  };

  let { class: className, children, ...restProps }: Props = $props();
</script>

<span
  class={cn('flex h-full w-full items-center justify-center rounded-full bg-muted', className)}
  {...restProps}
>
  {#if children}
    {@render children()}
  {/if}
</span>
