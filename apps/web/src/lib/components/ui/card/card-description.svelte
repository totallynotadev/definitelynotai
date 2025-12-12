<script lang="ts">
  import { cn } from '$lib/utils.js';
  import type { HTMLAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';

  type Props = HTMLAttributes<HTMLParagraphElement> & {
    children?: Snippet;
    class?: string;
  };

  let { class: className, children, ...restProps }: Props = $props();
</script>

<p class={cn('text-sm text-muted-foreground', className)} {...restProps}>
  {#if children}
    {@render children()}
  {/if}
</p>
