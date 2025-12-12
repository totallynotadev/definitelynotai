<script lang="ts">
  import { cn } from '$lib/utils.js';

  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  type Props = HTMLAttributes<HTMLTableSectionElement> & {
    class?: string;
    children?: Snippet;
  };

  const { class: className, children, ...restProps }: Props = $props();
</script>

<tfoot
  class={cn('border-t bg-muted/50 font-medium [&>tr]:last:border-b-0', className)}
  {...restProps}
>
  {#if children}
    {@render children()}
  {/if}
</tfoot>
