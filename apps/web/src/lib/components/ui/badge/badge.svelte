<script lang="ts">
  import { cn } from '$lib/utils.js';
  import { badgeVariants, type Props } from './index.js';
  import type { HTMLAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';

  type BadgeProps = HTMLAttributes<HTMLDivElement> &
    Props & {
      children?: Snippet;
      class?: string;
    };

  let { class: className, variant = 'default', children, ...restProps }: BadgeProps = $props();
</script>

<div class={cn(badgeVariants({ variant, className }))} {...restProps}>
  {#if children}
    {@render children()}
  {/if}
</div>
