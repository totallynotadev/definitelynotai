<script lang="ts">
  import { Tabs as TabsPrimitive } from 'bits-ui';

  import { cn } from '$lib/utils.js';

  import type { Snippet } from 'svelte';

  type Props = {
    class?: string;
    value: string;
    children?: Snippet;
  };

  const { class: className, value, children }: Props = $props();
</script>

<TabsPrimitive.Content
  {value}
  class={cn(
    'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    className
  )}
>
  {#if children}
    {@render children()}
  {/if}
</TabsPrimitive.Content>
