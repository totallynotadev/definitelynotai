<script lang="ts">
  import { cn } from '$lib/utils.js';
  import { alertVariants, type Props } from './index.js';
  import type { HTMLAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';

  type AlertProps = HTMLAttributes<HTMLDivElement> &
    Props & {
      children?: Snippet;
      class?: string;
    };

  let { class: className, variant = 'default', children, ...restProps }: AlertProps = $props();
</script>

<div role="alert" class={cn(alertVariants({ variant }), className)} {...restProps}>
  {#if children}
    {@render children()}
  {/if}
</div>
