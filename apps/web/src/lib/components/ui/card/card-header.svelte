<script lang="ts">
  import { cn } from '$lib/utils.js';

  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  type Props = HTMLAttributes<HTMLDivElement> & {
    children?: Snippet;
    class?: string;
  };

  const { class: className, children, ...restProps }: Props = $props();
</script>

<div class={cn('flex flex-col space-y-1.5 p-6', className)} {...restProps}>
  {#if children}
    {@render children()}
  {/if}
</div>
