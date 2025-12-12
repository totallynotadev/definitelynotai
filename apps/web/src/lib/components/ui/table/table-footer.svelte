<script lang="ts">
  import { cn } from '$lib/utils.js';
  import type { HTMLAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';

  type Props = HTMLAttributes<HTMLTableSectionElement> & {
    class?: string;
    children?: Snippet;
  };

  let { class: className, children, ...restProps }: Props = $props();
</script>

<tfoot
  class={cn('border-t bg-muted/50 font-medium [&>tr]:last:border-b-0', className)}
  {...restProps}
>
  {#if children}
    {@render children()}
  {/if}
</tfoot>
