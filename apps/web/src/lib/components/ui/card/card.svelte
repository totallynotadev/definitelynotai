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

<div
  class={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}
  {...restProps}
>
  {#if children}
    {@render children()}
  {/if}
</div>
