<script lang="ts">
  import { cn } from '$lib/utils.js';
  import { buttonVariants, type Props } from './index.js';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';

  type ButtonProps = HTMLButtonAttributes &
    Props & {
      children?: Snippet;
      class?: string;
    };

  let {
    class: className,
    variant = 'default',
    size = 'default',
    children,
    ...restProps
  }: ButtonProps = $props();
</script>

<button class={cn(buttonVariants({ variant, size, className }))} {...restProps}>
  {#if children}
    {@render children()}
  {/if}
</button>
