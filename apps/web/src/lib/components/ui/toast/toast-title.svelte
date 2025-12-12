<script lang="ts">
  import { cn } from '$lib/utils.js';

  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  type Props = HTMLAttributes<HTMLDivElement> & {
    class?: string;
    children?: Snippet;
  };

  const { class: className, children, ...restProps }: Props = $props();
</script>

<div class={cn('text-sm font-semibold', className)} {...restProps}>
  {#if children}
    {@render children()}
  {/if}
</div>
