<script lang="ts">
  import { cn } from '$lib/utils.js';
  import type { HTMLTableAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';

  type Props = HTMLTableAttributes & {
    class?: string;
    children?: Snippet;
  };

  let { class: className, children, ...restProps }: Props = $props();
</script>

<div class="relative w-full overflow-auto">
  <table class={cn('w-full caption-bottom text-sm', className)} {...restProps}>
    {#if children}
      {@render children()}
    {/if}
  </table>
</div>
