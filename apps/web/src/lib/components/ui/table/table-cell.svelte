<script lang="ts">
  import { cn } from '$lib/utils.js';
  import type { HTMLTdAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';

  type Props = HTMLTdAttributes & {
    class?: string;
    children?: Snippet;
  };

  let { class: className, children, ...restProps }: Props = $props();
</script>

<td class={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)} {...restProps}>
  {#if children}
    {@render children()}
  {/if}
</td>
